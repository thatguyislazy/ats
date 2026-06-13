import { useCVAnalysis } from "../context/CVAnalysisContext";
import ScoreCard from "../components/results/ScoreCard";
import KeywordAnalysis from "../components/results/KeywordAnalysis";
import SuggestionsList from "../components/results/SuggestionsList";
import HarvardCVPreview from "../components/cv-template/HarvardCVPreview";
import PDFDownloadButton from "../components/cv-template/PDFDownloadButton";
import { ArrowLeft } from "lucide-react";

export default function ResultsPage({ onBack }) {
  const { result, reset } = useCVAnalysis();

  if (!result) return null;

  const { score, cv } = result;

  const handleBack = () => {
    reset();
    onBack?.();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <button
        onClick={handleBack}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Start a new scan
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <ScoreCard score={score?.ats_score ?? 0} />
          <KeywordAnalysis
            matched={score?.matched_keywords}
            missing={score?.missing_keywords}
          />
          <SuggestionsList suggestions={score?.suggestions} />
        </div>

        <div className="lg:col-span-2">
          <div className="card mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Your Harvard-Format CV
              </h3>
              <p className="text-xs text-gray-500">
                Tailored to the job description you provided.
              </p>
            </div>
            <PDFDownloadButton
              data={cv}
              fileName={`${(cv?.name || "Harvard_CV").replace(/\s+/g, "_")}.pdf`}
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-gray-100 p-4 sm:p-8">
            <HarvardCVPreview data={cv} />
          </div>
        </div>
      </div>
    </div>
  );
}