function getScoreColor(score) {
  if (score >= 80) return { ring: "#059669", text: "text-accent-600", label: "Excellent" };
  if (score >= 60) return { ring: "#2563eb", text: "text-primary-600", label: "Good" };
  if (score >= 40) return { ring: "#d97706", text: "text-amber-600", label: "Needs Work" };
  return { ring: "#dc2626", text: "text-red-600", label: "Poor Match" };
}

export default function ScoreCard({ score }) {
  const { ring, text, label } = getScoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card flex flex-col items-center gap-3 text-center">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        ATS Match Score
      </h3>
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={ring}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold ${text}`}>{label}</span>
    </div>
  );
}