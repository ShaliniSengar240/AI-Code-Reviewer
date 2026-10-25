import { useState } from "react";
import {
  Download,
  AlertTriangle,
  Sparkles,
  Gauge,
  ShieldAlert,
  ListChecks,
  FileText,
} from "lucide-react";
import ScoreBar from "./ScoreBar";
import IssueCard from "./IssueCard";

function scoreStroke(score) {
  if (score >= 80) return "var(--color-success)";
  if (score >= 55) return "var(--color-warning)";
  return "var(--color-danger)";
}

function gradeLabel(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Needs work";
  return "Poor";
}

function ScoreRing({ score }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-21 h-21 shrink-0">
      <svg viewBox="0 0 84 84" className="w-full h-full -rotate-90">
        <circle cx="42" cy="42" r={r} fill="none" strokeWidth="7" style={{ stroke: "var(--color-border)" }} />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
          style={{ stroke: scoreStroke(score), transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-[24px] leading-none text-text">{score}</span>
        <span className="text-[10px] text-muted mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-block w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <div>
          <p className="font-display font-bold text-[16px] text-text leading-tight">
            Analyzing your code...
          </p>
          <p className="text-[13px] text-muted mt-0.5">This usually takes a few seconds</p>
        </div>
      </div>

      <div className="animate-pulse space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-[84px] h-[84px] rounded-full bg-border" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 bg-border rounded" />
            <div className="h-3 w-1/3 bg-border rounded" />
          </div>
        </div>
        <div className="h-36 bg-border rounded-xl" />
        <div className="h-20 bg-border rounded-xl" />
        <div className="h-20 bg-border rounded-xl" />
      </div>
    </div>
  );
}

const steps = [
  "Paste your code, or load a sample",
  "Pick a language and a focus",
  "Run the review (Ctrl + Enter)",
];

const features = [
  { icon: Gauge, title: "Overall score", text: "A 0 to 100 rating with a grade" },
  { icon: ShieldAlert, title: "Critical issues", text: "Security risks flagged first" },
  { icon: ListChecks, title: "Issues with fixes", text: "Click one to jump to its line" },
  { icon: FileText, title: "Code explanation", text: "A plain-English summary" },
];

function EmptyState({ onLoadSample }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-accent" strokeWidth={2} />
        </div>
        <div>
          <p className="font-display font-bold text-[17px] text-text leading-tight">
            Ready for your code
          </p>
          <p className="text-[13px] text-muted mt-0.5">Your review will appear here</p>
        </div>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">
        How it works
      </p>
      <div className="space-y-2.5 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-panel-2 border border-border text-accent text-[12px] font-mono flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="text-[13px] text-text">{s}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">
        What you'll get
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="bg-panel-2 border border-border rounded-xl p-3.5">
              <Icon className="w-4 h-4 text-accent mb-2.5" strokeWidth={2} />
              <p className="text-[13px] font-semibold text-text mb-0.5">{f.title}</p>
              <p className="text-[12px] text-muted leading-snug">{f.text}</p>
            </div>
          );
        })}
      </div>

      {onLoadSample && (
        <button
          onClick={onLoadSample}
          className="w-full border border-dashed border-border rounded-lg py-2.5 text-[13px] font-medium text-accent hover:border-accent transition-colors"
        >
          Try with sample code
        </button>
      )}
    </div>
  );
}

const filters = [
  { id: "all", label: "All" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

export default function ResultsPanel({ review, loading = false, onIssueClick, onLoadSample }) {
  const [filter, setFilter] = useState("all");

  if (loading) return <LoadingSkeleton />;

  if (!review) return <EmptyState onLoadSample={onLoadSample} />;

  const issueCounts = {
    all: review.issues.length,
    high: review.issues.filter((i) => i.severity === "high").length,
    medium: review.issues.filter((i) => i.severity === "medium").length,
    low: review.issues.filter((i) => i.severity === "low").length,
  };
  const visibleIssues = filter === "all" ? review.issues : review.issues.filter((i) => i.severity === filter);

  function handleDownload() {
    const blob = new Blob([review.explanation], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `review-${review.review_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <ScoreRing score={review.overall_score} />
        <div>
          <p className="font-display font-bold text-[20px] text-text leading-tight">
            {gradeLabel(review.overall_score)}
          </p>
          <p className="text-[13px] text-muted mt-1">{review.issues.length} issues found</p>
        </div>
      </div>

      {review.critical_issues_count > 0 && (
        <div className="flex items-center gap-2.5 bg-danger/10 border border-danger/40 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0" strokeWidth={2} />
          <span className="text-danger text-[13px] font-medium">
            {review.critical_issues_count} critical issue
            {review.critical_issues_count > 1 ? "s" : ""} found
          </span>
        </div>
      )}

      <div className="bg-panel-2 border border-border rounded-xl p-4 mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted mb-4">
          Category scores
        </p>
        {Object.entries(review.category_scores).map(([key, val]) => (
          <ScoreBar key={key} label={key} score={val} />
        ))}
      </div>

      <div className="bg-panel-2 border border-border rounded-xl p-4 mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted mb-2">
          What this code does
        </p>
        <p className="text-[13px] text-text leading-relaxed">{review.explanation}</p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Issues</p>
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
                filter === f.id ? "bg-accent text-bg" : "text-muted hover:text-text bg-panel-2"
              }`}
            >
              {f.label} {issueCounts[f.id]}
            </button>
          ))}
        </div>
      </div>
      {onIssueClick && (
        <p className="text-[12px] text-muted mb-3">Click an issue to jump to its line in the editor.</p>
      )}

      <div className="mb-5">
        {visibleIssues.length === 0 ? (
          <p className="text-[13px] text-muted py-4 text-center">No {filter} severity issues.</p>
        ) : (
          visibleIssues.map((issue, i) => (
            <IssueCard
              key={i}
              issue={issue}
              onClick={onIssueClick ? () => onIssueClick(issue.line) : undefined}
            />
          ))
        )}
      </div>

      <div className="bg-panel-2 border border-border rounded-xl p-4 mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted mb-2">
          Summary
        </p>
        <p className="text-[13px] text-muted leading-relaxed">{review.summary}</p>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 border border-border text-text text-[13px] font-medium rounded-lg px-4 py-2.5 hover:border-accent transition-colors"
      >
        <Download className="w-4 h-4" strokeWidth={2} />
        Download
      </button>
    </div>
  );
}