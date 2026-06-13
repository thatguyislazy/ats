import { useCallback, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function CVUploader({ file, onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateAndSet = useCallback(
    (selectedFile) => {
      if (!selectedFile) return;
      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        setErrorMsg("Please upload a PDF or Word document (.pdf, .doc, .docx).");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMsg("File is too large. Max size is 10MB.");
        return;
      }
      setErrorMsg("");
      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSet(droppedFile);
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files?.[0];
    validateAndSet(selectedFile);
  };

  return (
    <div>
      <label className="label-text">Upload your CV</label>

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            isDragging
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50"
          }`}
        >
          <UploadCloud className="mb-3 h-10 w-10 text-primary-500" />
          <p className="text-sm font-medium text-gray-700">
            Drag &amp; drop your CV here, or{" "}
            <label className="cursor-pointer text-primary-600 underline">
              browse
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
              />
            </label>
          </p>
          <p className="mt-1 text-xs text-gray-400">PDF, DOC, or DOCX (max 10MB)</p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {errorMsg && <p className="mt-1.5 text-xs text-red-600">{errorMsg}</p>}
    </div>
  );
}