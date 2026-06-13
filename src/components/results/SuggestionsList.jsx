import { Lightbulb } from "lucide-react";

export default function SuggestionsList({ suggestions = [] }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="card">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-gray-500">
        <Lightbulb size={16} className="text-amber-500" />
        Suggestions to Improve
      </h3>
      <ul className="space-y-2">
        {suggestions.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="mt-0.5 text-primary-500">•</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}