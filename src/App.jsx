import { useState, useEffect, useRef } from "react";
import {
  Upload, Sparkles, ArrowRight, RotateCcw,
  CheckCircle2, FileCheck2, AlertCircle, Loader2, X, Heart,
} from "lucide-react";
import HarvardCVPreview from "./components/cv-template/HarvardCVPreview";
import { generateHarvardPDF } from "./utils/generateHarvardPDF";
import { extractTextFromFile } from "./utils/extractTextFromFile";

const MIMO_API_BASE = "https://token-plan-sgp.xiaomimimo.com/v1";
const MIMO_API_KEY = import.meta.env.VITE_MIMO_API_KEY;
const MIMO_MODEL = "mimo-v2.5-pro";

// JSONBin config — create a free bin at jsonbin.io and paste your IDs here
const JSONBIN_BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
const JSONBIN_API_KEY = import.meta.env.VITE_JSONBIN_API_KEY;
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// ─── Floating heart particle ──────────────────────────────────────────────────
function HeartParticle({ id, onDone }) {
  const style = {
    left: `${40 + Math.random() * 20}%`,
    animationDuration: `${700 + Math.random() * 400}ms`,
    fontSize: `${14 + Math.random() * 10}px`,
    opacity: 0,
  };
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <span
      key={id}
      className="pointer-events-none absolute animate-float-heart select-none"
      style={style}
    >
      ❤️
    </span>
  );
}

export default function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [generatedCV, setGeneratedCV] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");
  const [toast, setToast] = useState(null);

  // ─── Like / heart state ───────────────────────────────────────────────────
  const [likeCount, setLikeCount] = useState(null); // null = loading
  const [hasLiked, setHasLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const particleId = useRef(0);

  const minChars = 20;
  const isReady = file && jobTitle.trim() && jobDescription.trim().length >= minChars;

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Fetch like count on mount
  useEffect(() => {
    const liked = localStorage.getItem("ats_liked") === "true";
    setHasLiked(liked);
    fetchLikeCount();
  }, []);

  const fetchLikeCount = async () => {
    try {
      const res = await fetch(`${JSONBIN_URL}/latest`, {
        headers: { "X-Master-Key": JSONBIN_API_KEY },
      });
      const data = await res.json();
      setLikeCount(data.record?.likes ?? 0);
    } catch {
      setLikeCount(0);
    }
  };

  const handleLike = async () => {
    if (hasLiked || likeLoading) return;
    setLikeLoading(true);

    // Optimistic update
    const newCount = (likeCount ?? 0) + 1;
    setLikeCount(newCount);
    setHasLiked(true);
    localStorage.setItem("ats_liked", "true");

    // Spawn particles
    const ids = Array.from({ length: 6 }, () => ++particleId.current);
    setParticles((p) => [...p, ...ids]);

    try {
      // GET latest first to avoid overwrite race
      const getRes = await fetch(`${JSONBIN_URL}/latest`, {
        headers: { "X-Master-Key": JSONBIN_API_KEY },
      });
      const getData = await getRes.json();
      const current = getData.record?.likes ?? 0;

      await fetch(JSONBIN_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_API_KEY,
        },
        body: JSON.stringify({ likes: current + 1 }),
      });

      setLikeCount(current + 1);
    } catch {
      // Keep optimistic count on error
    } finally {
      setLikeLoading(false);
    }
  };

  const removeParticle = (id) =>
    setParticles((p) => p.filter((x) => x !== id));

  // ─── File / form handlers ─────────────────────────────────────────────────
  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOC, or DOCX file.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReady || loading) return;

    setLoading(true);
    setError(null);
    setGeneratedCV(null);
    setPdfBlob(null);

    try {
      setLoadingStep("Reading your CV...");
      const cvText = await extractTextFromFile(file);

      setLoadingStep("Analyzing and rewriting with AI...");
      const prompt = `You are an expert CV writer specializing in Harvard-format resumes optimized for ATS systems.

Here is the candidate's current CV:
---
${cvText}
---

Job Title they are applying for: ${jobTitle}

Job Description:
---
${jobDescription}
---

Rewrite this CV in the Harvard format following these rules:
1. Header: Full name on first line, then email, phone, LinkedIn (if present), location on separate lines
2. Summary: 2-3 sentences tailored to the job title
3. Education: Reverse chronological, institution, degree, year
4. Experience: Reverse chronological, company, title, dates, 3-5 bullet points each with strong action verbs and quantified achievements
5. Skills: Grouped by category, include ATS keywords from the job description
6. Additional sections if relevant (Projects, Certifications, Awards)

Return ONLY the CV content in clean plain text. No markdown symbols like ** or ##. Use ALL CAPS for section headers (e.g. EXPERIENCE, EDUCATION, SKILLS).`;

      const response = await fetch(`${MIMO_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MIMO_API_KEY}`,
        },
        body: JSON.stringify({
          model: MIMO_MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `AI error: ${response.status}`);
      }

      const data = await response.json();
      const cvContent = data.choices[0].message.content.trim();
      console.log("RAW CV TEXT:\n" + cvContent);

      setLoadingStep("Generating your Harvard CV PDF...");
      const blob = await generateHarvardPDF(cvContent, jobTitle);

      setGeneratedCV(cvContent);
      setPdfBlob(blob);
      setSubmitted(true);
      showToast("Your Harvard CV has been generated and is ready to download! 🎉");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFile(null);
    setJobTitle("");
    setJobDescription("");
    setError(null);
    setLoading(false);
    setGeneratedCV(null);
    setPdfBlob(null);
    setLoadingStep("");
    setToast(null);
  };

  return (
    <div className="min-h-screen bg-hero-gradient px-4 py-6 sm:px-8 sm:py-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-2xl px-5 py-4 shadow-lg transition-all duration-300 max-w-sm ${
            toast.type === "success" ? "bg-ink-900 text-white" : "bg-red-600 text-white"
          }`}
        >
          <span className="mt-0.5 flex-shrink-0">
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="text-green-400" />
            ) : (
              <AlertCircle size={18} className="text-red-200" />
            )}
          </span>
          <p className="text-sm font-medium leading-snug">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 mt-0.5 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Top bar */}
        <div className="mx-auto mb-10 flex max-w-6xl items-center justify-between sm:mb-16">
            <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 group"
            >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full transition-transform group-hover:scale-110">
                <img src="/icon.png" alt="ATS logo" className="h-full w-full object-cover" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
                ats<span className="text-accent-500">.vercel.dev</span>
            </span>
            </button>
            <p className="hidden text-sm text-ink-400 sm:block">
            No sign-up. Just upload &amp; go.
            </p>
        </div>

      {/* Main content */}
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Form card */}
        <div className={`w-full max-w-md flex-shrink-0 lg:max-w-lg ${submitted ? "lg:order-1" : "lg:order-2"}`}>
          {submitted && (
            <div className="mb-6">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-medium text-ink-600 shadow-card">
                <CheckCircle2 size={14} className="text-green-500" />
                Harvard CV generated successfully
              </span>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                Your CV, <span className="text-accent-500">rebuilt</span> for the role.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-ink-400">
                Your Harvard-format CV has been downloaded and is shown in the preview.
              </p>
            </div>
          )}

          <div className="flex flex-col rounded-3xl bg-white p-6 shadow-card sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">Your current CV</h2>
              {submitted && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-full border border-ink-100 px-3 py-1.5 text-xs font-medium text-ink-400 transition-colors hover:border-ink-400 hover:text-ink-900"
                >
                  <RotateCcw size={12} /> Start over
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* CV Upload */}
              <label
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors ${
                  submitted || loading
                    ? "cursor-default border-ink-100 bg-paper opacity-70"
                    : dragOver
                    ? "cursor-pointer border-accent-500 bg-accent-50"
                    : "cursor-pointer border-ink-100 bg-paper hover:border-accent-500 hover:bg-accent-50"
                }`}
                onDragOver={(e) => { e.preventDefault(); if (!submitted && !loading) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={!submitted && !loading ? handleDrop : undefined}
              >
                <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-accent-500 text-white">
                  {file ? <FileCheck2 size={18} /> : <Upload size={18} />}
                </span>
                <span className="text-sm text-ink-900">
                  {file ? (
                    <span className="font-medium">{file.name}</span>
                  ) : (
                    <>Drop your CV here or{" "}<span className="font-semibold text-accent-500 underline">browse</span></>
                  )}
                </span>
                <span className="font-mono text-xs text-ink-400">PDF, DOC, DOCX · max 10MB</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  disabled={submitted || loading}
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
              </label>

              {/* Job title */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-900">Job title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Product Designer"
                  value={jobTitle}
                  disabled={submitted || loading}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400/70 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100 disabled:cursor-default disabled:bg-paper"
                />
              </div>

              {/* Job description */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-900">Job description</label>
                <textarea
                  rows={6}
                  disabled={submitted || loading}
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full resize-none rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400/70 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100 disabled:cursor-default disabled:bg-paper"
                />
                <p className="mt-1 text-right font-mono text-xs text-ink-400">
                  {jobDescription.length} characters
                </p>
              </div>

              {/* Loading step indicator */}
              {loading && loadingStep && (
                <div className="flex items-center gap-2 rounded-xl border border-accent-100 bg-accent-50 px-4 py-3">
                  <Loader2 size={14} className="animate-spin text-accent-500" />
                  <p className="text-sm text-accent-700">{loadingStep}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!submitted && (
                <>
                  <button
                    type="submit"
                    disabled={!isReady || loading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-4 text-sm font-semibold text-white shadow-card transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-400"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing your CV…</>
                    ) : (
                      <><Sparkles size={16} /> Scan &amp; generate Harvard CV <ArrowRight size={16} /></>
                    )}
                  </button>
                  <p className="text-center text-xs text-ink-400">
                    Your file stays private. We never share it with third parties.
                  </p>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Hero / Preview */}
        <div className={`flex-1 ${submitted ? "lg:order-2" : "lg:order-1"}`}>
          {submitted ? (
            <div className="flex flex-col gap-4">
              <HarvardCVPreview cvText={generatedCV} pdfBlob={pdfBlob} />

              {/* Like / heart button — shown after generation */}
              <div className="relative flex flex-col items-center gap-2 py-2">
                {/* Floating heart particles */}
                {particles.map((id) => (
                  <HeartParticle key={id} id={id} onDone={() => removeParticle(id)} />
                ))}
                <p className="text-sm text-ink-400">Happy with your CV?</p>
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={hasLiked || likeLoading}
                  className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                    hasLiked
                      ? "bg-red-50 text-red-500 border border-red-200 cursor-default"
                      : "bg-white border border-ink-100 text-ink-600 hover:border-red-300 hover:text-red-500 hover:scale-105 shadow-card"
                  }`}
                >
                  <Heart
                    size={16}
                    className={hasLiked ? "fill-red-500 text-red-500" : ""}
                  />
                  {hasLiked ? "Thanks for the love!" : "I love this CV ❤️"}
                  {likeCount !== null && (
                    <span className={`ml-1 font-mono text-xs ${hasLiked ? "text-red-400" : "text-ink-400"}`}>
                      {likeCount.toLocaleString()}
                    </span>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-full border-2 border-ink-900 px-6 py-3.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
              >
                <RotateCcw size={15} />
                Generate another CV
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                Make your CV{" "}
                <span className="text-accent-500">pass the scan</span> every time.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-ink-400">
                Drop in your resume, paste the role you're chasing, and we'll score,
                restructure, and rebuild it in the Harvard format, keyword-ready,
                recruiter-ready.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "ATS-optimized keywords pulled from the job post",
                  "Quantified, recruiter-tested bullet points",
                  "Clean Harvard-format rebuild, ready to download",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-ink-600">
                    <CheckCircle2 size={18} className="flex-shrink-0 text-accent-500" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Social proof — like counter on landing */}
              {likeCount !== null && likeCount > 0 && (
                <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-4 py-2 shadow-card">
                  <Heart size={14} className="fill-red-500 text-red-500" />
                  <span className="text-sm text-ink-600">
                    <span className="font-semibold text-ink-900">{likeCount.toLocaleString()}</span>{" "}
                    {likeCount === 1 ? "person loves" : "people love"} this tool
                  </span>
                </div>
              )}

              {/* Tech stack badges */}
              <div className="mt-10 border-t border-ink-100 pt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Built with
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React", "Vite", "Tailwind CSS", "jsPDF",
                    "pdf.js", "Mammoth.js", "Mimo AI", "Lucide Icons",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-ink-100 bg-white px-3 py-1 text-xs font-medium text-ink-600 shadow-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}