import { useCVAnalysis } from "../context/CVAnalysisContext";
import CVUploader from "../components/upload/CVUploader";
import JobDetailsForm from "../components/upload/JobDetailsForm";
import { Loader2, ScanSearch, Sparkles } from "lucide-react";
import { mockAnalysisResult } from "../utils/mockData";

export default function HomePage() {
  const {
    file,
    setFile,
    jobTitle,
    setJobTitle,
    jobDescription,
    setJobDescription,
    loading,
    error,
    submitAnalysis,
    setResult,
  } = useCVAnalysis();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitAnalysis();
  };

  const canSubmit = file && jobTitle.trim() && jobDescription.trim() && !loading;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Optimize your CV for any job
        </h2>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Upload your CV and the job description. We'll score your ATS match
          and generate a clean Harvard-format resume tailored to the role.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <CVUploader file={file} onFileSelect={setFile} />
        <JobDetailsForm
          jobTitle={jobTitle}
          jobDescription={jobDescription}
          onJobTitleChange={setJobTitle}
          onJobDescriptionChange={setJobDescription}
        />

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={!canSubmit} className="btn-primary w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your CV...
            </>
          ) : (
            <>
              <ScanSearch className="h-4 w-4" />
              Scan &amp; Generate Harvard CV
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setResult(mockAnalysisResult)}
          className="btn-secondary w-full"
        >
          <Sparkles className="h-4 w-4" />
          View Demo Result (no backend needed)
        </button>
      </form>
    </div>
  );
}