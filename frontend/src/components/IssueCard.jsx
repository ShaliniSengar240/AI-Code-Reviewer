const severityStyles = {
  high: "border-l-danger",
  medium: "border-l-warning",
  low: "border-l-teal",
};

const severityTextColor = {
  high: "text-danger",
  medium: "text-warning",
  low: "text-teal",
};

const typeLabel = {
  bug: "Bug",
  security: "Security",
  style: "Style",
    unused_variable: "Unused variable",
  performance: "Performance",
};

export default function IssueCard({ issue, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-panel-2 border border-border border-l-4 rounded-xl p-4 mb-3 last:mb-0 transition-colors ${
        severityStyles[issue.severity] || "border-l-border"
      } ${onClick ? "cursor-pointer hover:border-accent" : ""}`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-panel text-muted">
            line {issue.line}
          </span>
          <span className="text-[12px] text-muted">{typeLabel[issue.type] || issue.type}</span>
        </div>
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${
            severityTextColor[issue.severity] || "text-muted"
          }`}
        >
          {issue.severity}
        </span>
      </div>
      <p className="text-[14px] text-text mb-1.5">{issue.message}</p>
      <p className="text-[13px] text-muted">
        <span className="text-accent font-medium">Fix: </span>
        {issue.suggestion}
      </p>
    </div>
  );
}