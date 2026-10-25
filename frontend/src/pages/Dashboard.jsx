import { useEffect, useState } from "react";
import { FileCode2, TrendingUp, Gauge, Trophy, Plus, ArrowRight } from "lucide-react";
import { getHistory } from "../api";

function scoreColor(score) {
  if (score >= 80) return "text-success";
  if (score >= 55) return "text-warning";
  return "text-danger";
}

function relativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SkeletonCard() {
  return (
    <div className="bg-panel border border-border rounded-xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-16 bg-panel-2 rounded" />
        <div className="h-5 w-8 bg-panel-2 rounded" />
      </div>
      <div className="h-3 w-20 bg-panel-2 rounded" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, valueColor = "text-text", onClick }) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`bg-panel border border-border rounded-2xl p-6 text-left w-full ${
        onClick
          ? "cursor-pointer hover:border-accent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 transition-all"
          : ""
      }`}
    >
      <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center mb-5">
        <Icon className="w-5 h-5 text-accent" strokeWidth={2} />
      </div>
      <p className="text-[13px] text-muted mb-1.5">{label}</p>
      <p className={`font-display font-bold text-[34px] leading-none ${valueColor}`}>{value}</p>
    </Wrapper>
  );
}

export default function Dashboard({ user, setView, openReview }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, []);

  const scores = history.map((r) => r.overall_score);
  const totalReviews = history.length;
  const latestScore = history[0]?.overall_score ?? null;
  const avgScore = scores.length
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : null;
  const bestScore = scores.length ? Math.max(...scores) : null;
  const visibleReviews = history.slice(0, 8);

  return (
    <div className="max-w-[1350px] mx-auto px-6 py-8">
      {/* Header: welcome on the left, primary action on the right */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-[26px] text-text tracking-tight mb-1">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-[14px] text-muted">Here's what's happening with your code reviews</p>
        </div>
        <button
          onClick={() => setView("newReview")}
          className="flex items-center gap-2 bg-accent text-bg text-[14px] font-semibold rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          New review
        </button>
      </div>

      {/* Stats: four across, same grid as the review cards below */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          icon={FileCode2}
          label="Total reviews"
          value={loading ? "—" : totalReviews}
          onClick={() => setView("history")}
        />
        <StatCard
          icon={TrendingUp}
          label="Latest score"
          value={loading || latestScore === null ? "—" : `${latestScore}/100`}
          valueColor={!loading && latestScore !== null ? scoreColor(latestScore) : "text-text"}
        />
        <StatCard
          icon={Gauge}
          label="Average score"
          value={loading || avgScore === null ? "—" : `${avgScore}/100`}
          valueColor={!loading && avgScore !== null ? scoreColor(avgScore) : "text-text"}
        />
        <StatCard
          icon={Trophy}
          label="Best score"
          value={loading || bestScore === null ? "—" : `${bestScore}/100`}
          valueColor={!loading && bestScore !== null ? scoreColor(bestScore) : "text-text"}
        />
      </div>

      {/* Recent reviews */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-[18px] text-text">Recent reviews</h2>
        {!loading && history.length > 0 && (
          <button
            onClick={() => setView("history")}
            className="flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-yellow-300 transition-colors cursor-pointer"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-muted text-[14px] mb-4">
            No reviews yet. Submit your first piece of code to see it here.
          </p>
          <button
            onClick={() => setView("newReview")}
            className="bg-accent text-bg text-[13px] font-semibold rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 cursor-pointer"
          >
            Start your first review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visibleReviews.map((r) => (
            <button
              key={r.review_id}
              onClick={() => openReview(r.review_id)}
              className="bg-panel border border-border rounded-xl p-5 text-left cursor-pointer hover:border-accent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted font-mono">
                  {r.language}
                </span>
                <span className={`font-display font-bold text-[20px] ${scoreColor(r.overall_score)}`}>
                  {r.overall_score}
                </span>
              </div>
              <p className="text-[13px] text-muted">{relativeTime(r.date)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}