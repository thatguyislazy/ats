import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function HarvardCVPreview({ cvText, pdfBlob, jobTitle = "CV" }) {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfBlob]);

  if (!cvText) return null;

  const SECTION_HEADERS = [
    "SUMMARY", "PROFESSIONAL SUMMARY", "EDUCATION", "EXPERIENCE", "WORK EXPERIENCE",
    "SKILLS", "TECHNICAL SKILLS", "PROJECTS", "CERTIFICATIONS", "AWARDS",
    "PROFESSIONAL EXPERIENCE", "ADDITIONAL", "OBJECTIVE", "CAREER OBJECTIVE",
    "ACHIEVEMENTS", "VOLUNTEER", "LANGUAGES", "INTERESTS",
  ];

  const isSectionHeader = (line) => {
    const upper = line.trim().toUpperCase();
    if (SECTION_HEADERS.some((h) => upper === h || upper.startsWith(h + " "))) return true;
    const words = upper.split(/\s+/);
    if (
      words.length <= 4 &&
      line.trim() === line.trim().toUpperCase() &&
      !/\d/.test(line) &&
      !line.trim().startsWith("•") &&
      line.trim().length > 2
    ) return true;
    return false;
  };

  const isDateLine = (line) =>
    /\d{4}/.test(line) &&
    (line.includes("–") || line.includes("-") || /present/i.test(line));

  const isBullet = (line) =>
    line.trim().startsWith("•") || line.trim().startsWith("-") || line.trim().startsWith("*");

  const allLines = cvText.split("\n").filter((l) => l.trim() !== "");

  // Find header block (before first section header), capped at 6 lines
//   const firstSectionIdx = allLines.findIndex((l) => isSectionHeader(l.trim()));
  const searchFrom = 1;
  const idxInSlice = allLines.slice(searchFrom).findIndex((l) => isSectionHeader(l.trim()));
  const firstSectionIdx = idxInSlice === -1 ? -1 : idxInSlice + searchFrom;
  const headerCutoff = firstSectionIdx === -1 ? allLines.length : firstSectionIdx;
  const headerLineCount = Math.min(headerCutoff, 6);
  const headerLines = allLines.slice(0, headerLineCount);
  const bodyLines = allLines.slice(headerLineCount);

  const ENTRY_SECTIONS = ["EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "PROJECTS", "CERTIFICATIONS", "AWARDS", "ACHIEVEMENTS", "VOLUNTEER"];
  const PLAIN_SECTIONS = ["SUMMARY", "PROFESSIONAL SUMMARY", "OBJECTIVE", "CAREER OBJECTIVE", "SKILLS", "TECHNICAL SKILLS", "ADDITIONAL", "LANGUAGES", "INTERESTS", "EDUCATION"];

  let currentSection = "";
  let entryState = "idle";

  const tagged = bodyLines.map((line) => {
    const trimmed = line.trim();

    if (isSectionHeader(trimmed)) {
      currentSection = trimmed.toUpperCase();
      entryState = "idle";
      return { type: "section", text: trimmed };
    }

    const isEntry = ENTRY_SECTIONS.some((s) => currentSection.startsWith(s));
    const isPlain = PLAIN_SECTIONS.some((s) => currentSection.startsWith(s));
    const isEdu = currentSection.startsWith("EDUCATION");

    if (isBullet(trimmed)) {
      entryState = "bullets";
      return { type: "bullet", text: trimmed.replace(/^[•\-*]\s*/, "") };
    }

    if (isDateLine(trimmed)) {
      entryState = "bullets";
      return { type: "date", text: trimmed };
    }

    if (isEdu) {
      if (entryState === "idle") {
        entryState = "role";
        return { type: "edu-degree", text: trimmed };
      }
      if (entryState === "role") {
        entryState = "company";
        return { type: "edu-institution", text: trimmed };
      }
    }

    if (isEntry) {
      if (entryState === "idle" || entryState === "bullets") {
        entryState = "role";
        return { type: "role", text: trimmed };
      }
      if (entryState === "role") {
        entryState = "company";
        return { type: "company", text: trimmed };
      }
    }

    if (isPlain) {
      return { type: "body", text: trimmed };
    }

    return { type: "body", text: trimmed };
  });

  const candidateName = headerLines[0]?.trim().replace(/\s+/g, "_") || "Candidate";
  const safeJob = jobTitle.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  const filename = `${candidateName}_${safeJob}.pdf`;

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = filename;
    a.click();
  };

  const renderToken = ({ type, text }, i) => {
    switch (type) {
      case "section":
        return (
          <div key={i} className="mt-5 mb-1.5">
            <h2 className="font-serif text-xs font-bold uppercase tracking-widest text-ink-900">
              {text}
            </h2>
            <div className="border-b border-ink-900 mt-1" />
          </div>
        );
      case "role":
        return (
          <p key={i} className="font-serif text-sm font-bold text-ink-900 mt-3 mb-0 leading-snug">
            {text}
          </p>
        );
      case "company":
        return (
          <p key={i} className="font-serif text-xs italic text-ink-500 mb-0 leading-snug">
            {text}
          </p>
        );
      case "date":
        return (
          <p key={i} className="font-serif text-xs font-bold text-ink-900 mb-1 leading-snug">
            {text}
          </p>
        );
      case "bullet":
        return (
          <p key={i} className="font-serif text-xs text-ink-700 ml-4 mb-0.5 leading-relaxed">
            • {text}
          </p>
        );
      case "edu-degree":
        return (
          <p key={i} className="font-serif text-xs font-semibold text-ink-900 mt-2 mb-0 leading-snug">
            {text}
          </p>
        );
      case "edu-institution":
        return (
          <p key={i} className="font-serif text-xs italic text-ink-500 mb-0 leading-snug">
            {text}
          </p>
        );
      case "body":
      default:
        return (
          <p key={i} className="font-serif text-xs text-ink-700 mb-1 leading-relaxed">
            {text}
          </p>
        );
    }
  };

  return (
    <div className="w-full">
      {pdfUrl && (
        <button
          onClick={handleDownload}
          className="mb-4 flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-ink-800"
        >
          <Download size={15} />
          Download PDF
        </button>
      )}

      <div className="w-full rounded-2xl border border-ink-100 bg-white p-8 shadow-card overflow-y-auto max-h-[700px]">
        <div className="max-w-2xl mx-auto">
          {/* Header: name centered, contact info centered below, wraps naturally */}
          <div className="mb-4 text-center">
            <h1 className="font-serif text-2xl font-bold text-ink-900 tracking-tight mb-2">
              {headerLines[0]?.trim()}
            </h1>
            {(() => {
              const parts = headerLines.slice(1).map((l) => l.trim()).filter(Boolean);
              if (parts.length === 0) return null;
              return (
                <p className="font-serif text-xs text-ink-500 leading-snug">
                  {parts.reduce((acc, part, i) => (
                    i === 0 ? [part] : [...acc, <span key={i} className="mx-1.5 text-ink-300">|</span>, part]
                  ), [])}
                </p>
              );
            })()}
          </div>

          {/* Body tokens */}
          {tagged.map((token, i) => renderToken(token, i))}
        </div>
      </div>
    </div>
  );
}