import { useEffect, useMemo, useState } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { getHistory } from "../api";

function scoreColor(score) {
  if (score >= 80) return "text-success";
  if (score >= 55) return "text-warning";
  return "text-danger";
}

export default function History({ openReview }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"

  useEffect(() => {
    getHistory().then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, []);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = useMemo(() => {
    let rows = history.filter((r) =>
      r.language.toLowerCase().includes(search.toLowerCase())
    );
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = new Date(a.date) - new Date(b.date);
      if (sortKey === "score") cmp = a.overall_score - b.overall_score;
      if (sortKey === "language") cmp = a.language.localeCompare(b.language);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [history, search, sortKey, sortDir]);

  function SortHeader({ label, sortKeyName, align = "left" }) {
    const active = sortKey === sortKeyName;
    return (
      <button
        onClick={() => toggleSort(sortKeyName)}
        className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
          active ? "text-accent" : "text-muted"
        } hover:text-accent transition-colors ${align === "right" ? "ml-auto" : ""}`}
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ArrowUp className="w-3 h-3" strokeWidth={2.5} />
          ) : (
            <ArrowDown className="w-3 h-3" strokeWidth={2.5} />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" strokeWidth={2.5} />
        )}
      </button>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-[24px] text-text tracking-tight mb-1">
        Review history
      </h1>
      <p className="text-[14px] text-muted mb-6">
        {loading ? "Loading..." : `${filtered.length} of ${history.length} reviews`}
      </p>

      {/* Search */}
      <div className="relative max-w-xs mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by language..."
          className="w-full bg-panel-2 border border-border rounded-lg pl-9 pr-3 py-2 text-[13px] text-text placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-all"
        />
      </div>

      {loading ? (
        <p className="text-muted text-[14px] font-mono">loading...</p>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-muted text-[14px]">No reviews match "{search}".</p>
        </div>
      ) : (
        <div className="bg-panel border border-border rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_140px] gap-4 px-5 py-3 border-b border-border bg-panel-2">
            <SortHeader label="Language" sortKeyName="language" />
            <SortHeader label="Score" sortKeyName="score" align="right" />
            <SortHeader label="Date" sortKeyName="date" align="right" />
          </div>

          {/* Rows */}
          {filtered.map((r, i) => (
            <button
              key={r.review_id}
              onClick={() => openReview(r.review_id)}
              className={`w-full grid grid-cols-[1fr_100px_140px] gap-4 px-5 py-3.5 items-center text-left hover:bg-panel-2 transition-colors ${
                i !== filtered.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-[14px] text-text font-mono capitalize">{r.language}</span>
              <span className={`text-[14px] font-semibold text-right ${scoreColor(r.overall_score)}`}>
                {r.overall_score}
              </span>
              <span className="text-[13px] text-muted text-right">
                {new Date(r.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}