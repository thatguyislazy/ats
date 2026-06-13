import { createContext, useContext, useState, useCallback } from "react";
import { analyzeCV } from "../services/n8nApi";

const CVAnalysisContext = createContext(null);

export function CVAnalysisProvider({ children }) {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitAnalysis = useCallback(async () => {
    if (!file || !jobTitle || !jobDescription) {
      setError("Please upload a CV and fill in the job title and description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeCV({ file, jobTitle, jobDescription });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while analyzing your CV. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [file, jobTitle, jobDescription]);

  const reset = useCallback(() => {
    setFile(null);
    setJobTitle("");
    setJobDescription("");
    setResult(null);
    setError(null);
  }, []);

  const value = {
    file,
    setFile,
    jobTitle,
    setJobTitle,
    jobDescription,
    setJobDescription,
    result,
    setResult,
    loading,
    error,
    setError,
    submitAnalysis,
    reset,
  };

  return (
    <CVAnalysisContext.Provider value={value}>
      {children}
    </CVAnalysisContext.Provider>
  );
}

export function useCVAnalysis() {
  const ctx = useContext(CVAnalysisContext);
  if (!ctx) {
    throw new Error("useCVAnalysis must be used within a CVAnalysisProvider");
  }
  return ctx;
}