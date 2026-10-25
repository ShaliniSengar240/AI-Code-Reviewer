import { ArrowLeft } from "lucide-react";
import ResultsPanel from "../components/ResultsPanel";

export default function ReviewResults({ review, setView }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <button
        onClick={() => setView("dashboard")}
        className="flex items-center gap-1.5 text-[13px] text-muted hover:text-text mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
        Back to dashboard
      </button>
      <ResultsPanel review={review} />
    </div>
  );
}