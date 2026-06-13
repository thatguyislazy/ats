import jsPDF from "jspdf";

function extractNameFromCV(cvText) {
  const lines = cvText.split("\n").filter((l) => l.trim() !== "");
  return (lines[0]?.trim() || "Candidate").replace(/[^a-zA-Z\s]/g, "").trim();
}

export async function generateHarvardPDF(cvText, jobTitle = "CV") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let y = marginTop;

  const SECTION_HEADERS = [
    "SUMMARY", "PROFESSIONAL SUMMARY", "EDUCATION", "EXPERIENCE", "WORK EXPERIENCE",
    "SKILLS", "TECHNICAL SKILLS", "PROJECTS", "CERTIFICATIONS", "AWARDS",
    "PROFESSIONAL EXPERIENCE", "ADDITIONAL", "OBJECTIVE", "CAREER OBJECTIVE",
    "ACHIEVEMENTS", "VOLUNTEER", "LANGUAGES", "INTERESTS",
  ];

  const ENTRY_SECTIONS = [
    "EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE",
    "PROJECTS", "CERTIFICATIONS", "AWARDS", "ACHIEVEMENTS", "VOLUNTEER",
  ];

  const PLAIN_SECTIONS = [
    "SUMMARY", "PROFESSIONAL SUMMARY", "OBJECTIVE", "CAREER OBJECTIVE",
    "SKILLS", "TECHNICAL SKILLS", "ADDITIONAL", "LANGUAGES", "INTERESTS",
  ];

  const isSectionHeader = (line) => {
    const upper = line.trim().toUpperCase();
    if (SECTION_HEADERS.some((h) => upper === h || upper.startsWith(h + " "))) return true;
    const words = upper.split(/\s+/);
    if (
      words.length <= 4 &&
      upper === line.trim().toUpperCase() &&
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
    line.trim().startsWith("•") ||
    line.trim().startsWith("-") ||
    line.trim().startsWith("*");

  const checkPageBreak = (needed = 8) => {
    if (y + needed > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  };

  const allLines = cvText.split("\n").filter((l) => l.trim() !== "");

  // Skip line 0 (the name) when searching for the first section header,
  // since an all-caps short name can false-positive as a header.
  const searchFrom = 1;
  const idxInSlice = allLines.slice(searchFrom).findIndex((l) => isSectionHeader(l.trim()));
  const firstSectionIdx = idxInSlice === -1 ? -1 : idxInSlice + searchFrom;

  // Header = everything before the first recognized section header,
  // hard-capped at 6 lines (name + up to 5 contact items) to avoid
  // accidentally swallowing body content.
  const headerCutoff = firstSectionIdx === -1 ? allLines.length : firstSectionIdx;
  const headerLineCount = Math.min(headerCutoff, 6);
  const headerLines = allLines.slice(0, headerLineCount);
  const bodyLines = allLines.slice(headerLineCount);

  let currentSection = "";
  let entryState = "idle";

  const tagged = bodyLines.map((line) => {
    const trimmed = line.trim();

    if (isSectionHeader(trimmed)) {
      currentSection = trimmed.toUpperCase();
      entryState = "idle";
      return { type: "section", text: trimmed };
    }

    if (isBullet(trimmed)) {
      entryState = "bullets";
      return { type: "bullet", text: trimmed.replace(/^[•\-*]\s*/, "") };
    }

    if (isDateLine(trimmed)) {
      entryState = "bullets";
      return { type: "date", text: trimmed };
    }

    const isEdu = currentSection.startsWith("EDUCATION");
    const isEntry = ENTRY_SECTIONS.some((s) => currentSection.startsWith(s));
    const isPlain = PLAIN_SECTIONS.some((s) => currentSection.startsWith(s));

    if (isEdu) {
      if (entryState === "idle") { entryState = "role"; return { type: "edu-degree", text: trimmed }; }
      if (entryState === "role") { entryState = "company"; return { type: "edu-institution", text: trimmed }; }
    }

    if (isEntry) {
      if (entryState === "idle" || entryState === "bullets") { entryState = "role"; return { type: "role", text: trimmed }; }
      if (entryState === "role") { entryState = "company"; return { type: "company", text: trimmed }; }
    }

    if (isPlain) return { type: "body", text: trimmed };

    return { type: "body", text: trimmed };
  });

  // ─── Render header: name centered, then ALL contact parts centered, wrapped ──

  checkPageBreak(12);
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text(headerLines[0]?.trim() || "", pageWidth / 2, y, { align: "center" });
  y += 9;

  const contactParts = headerLines.slice(1).map((l) => l.trim()).filter(Boolean);
  if (contactParts.length > 0) {
    doc.setFont("times", "normal");
    doc.setFontSize(9.5);
    const fullLine = contactParts.join("   |   ");

    const wrappedContact = doc.splitTextToSize(fullLine, contentWidth);
    wrappedContact.forEach((wl) => {
      checkPageBreak(6);
      doc.text(wl, pageWidth / 2, y, { align: "center" });
      y += 5;
    });
    y += 0.5;
  }

  y += 2;

  tagged.forEach(({ type, text }) => {
    const trimmed = text.trim();

    switch (type) {
      case "section": {
        checkPageBreak(14);
        y += 4;
        doc.setFont("times", "bold");
        doc.setFontSize(11);
        doc.text(trimmed.toUpperCase(), marginLeft, y);
        y += 2;
        doc.setLineWidth(0.4);
        doc.line(marginLeft, y, pageWidth - marginRight, y);
        y += 5;
        break;
      }

      case "role": {
        checkPageBreak(7);
        y += 2;
        doc.setFont("times", "bold");
        doc.setFontSize(10.5);
        const wrappedRole = doc.splitTextToSize(trimmed, contentWidth);
        wrappedRole.forEach((wl) => { checkPageBreak(6); doc.text(wl, marginLeft, y); y += 5; });
        break;
      }

      case "company": {
        checkPageBreak(6);
        doc.setFont("times", "italic");
        doc.setFontSize(10);
        const wrappedCo = doc.splitTextToSize(trimmed, contentWidth);
        wrappedCo.forEach((wl) => { checkPageBreak(6); doc.text(wl, marginLeft, y); y += 5; });
        break;
      }

      case "date": {
        checkPageBreak(6);
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.text(trimmed, marginLeft, y);
        y += 5;
        break;
      }

      case "bullet": {
        checkPageBreak(6);
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        const wrapped = doc.splitTextToSize(`• ${trimmed}`, contentWidth - 5);
        wrapped.forEach((wl) => { checkPageBreak(6); doc.text(wl, marginLeft + 4, y); y += 5; });
        break;
      }

      case "edu-degree": {
        checkPageBreak(6);
        y += 2;
        doc.setFont("times", "bold");
        doc.setFontSize(10.5);
        const wrappedDeg = doc.splitTextToSize(trimmed, contentWidth);
        wrappedDeg.forEach((wl) => { checkPageBreak(6); doc.text(wl, marginLeft, y); y += 5; });
        break;
      }

      case "edu-institution": {
        checkPageBreak(6);
        doc.setFont("times", "italic");
        doc.setFontSize(10);
        const wrappedInst = doc.splitTextToSize(trimmed, contentWidth);
        wrappedInst.forEach((wl) => { checkPageBreak(6); doc.text(wl, marginLeft, y); y += 5; });
        break;
      }

      case "body":
      default: {
        checkPageBreak(6);
        doc.setFont("times", "normal");
        doc.setFontSize(10.5);
        const wrappedBody = doc.splitTextToSize(trimmed, contentWidth);
        wrappedBody.forEach((wl) => { checkPageBreak(6); doc.text(wl, marginLeft, y); y += 5; });
        break;
      }
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.setTextColor(0);
  }

  const candidateName = extractNameFromCV(cvText).replace(/\s+/g, "_");
  const safeJob = jobTitle.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  const filename = `${candidateName}_${safeJob}.pdf`;

  doc.save(filename);
  return doc.output("blob");
}