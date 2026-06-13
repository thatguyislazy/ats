import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Use the worker bundled with pdfjs-dist itself (no CDN version mismatch)
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts plain text from a PDF, DOC, or DOCX File object.
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "pdf") return extractFromPDF(file);
  if (ext === "docx" || ext === "doc") return extractFromDOCX(file);

  throw new Error(`Unsupported file type: .${ext}`);
}

async function extractFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n\n");
}

async function extractFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}