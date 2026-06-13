import { CheckCircle2, XCircle } from "lucide-react";

export default function KeywordAnalysis({ matched = [], missing = [] }) {
  return (
    <div className="card space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Keyword Analysis
      </h3>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-accent-600">
          <CheckCircle2 size={16} />
          Matched Keywords ({matched.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {matched.length === 0 && (
            <span className="text-sm text-gray-400">None found</span>
          )}
          {matched.map((kw) => (
            <span
              key={kw}
              className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-600"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-red-500">
          <XCircle size={16} />
          Missing Keywords ({missing.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {missing.length === 0 && (
            <span className="text-sm text-gray-400">None — great coverage!</span>
          )}
          {missing.map((kw) => (
            <span
              key={kw}
              className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}