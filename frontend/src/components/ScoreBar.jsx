function colorFor(score) {
  if (score >= 80) return "bg-success";
  if (score >= 55) return "bg-warning";
  return "bg-danger";
}

export default function ScoreBar({ label, score }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between mb-1.5">
        <span className="text-[13px] text-muted capitalize">{label.replace("_", " ")}</span>
        <span className="text-[13px] font-mono text-text font-medium">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-panel-2 overflow-hidden border border-border">
        <div
          className={`h-full rounded-full ${colorFor(score)} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}