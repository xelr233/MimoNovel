import { useState } from "react";
import { useNovelStore } from "../stores/novel";

export default function SegmentList() {
  const { segments } = useNovelStore();
  const [expanded, setExpanded] = useState(true);

  if (segments.length === 0) return null;

  const dialogueCount = segments.filter((s) => s.type === "dialogue").length;
  const narrationCount = segments.filter((s) => s.type === "narration").length;

  return (
    <div className="rounded-2xl border border-ink-800/60 bg-ink-900/50 backdrop-blur-sm overflow-hidden">
      {/* Section header */}
      <div className="px-6 py-4 border-b border-ink-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
            <span className="text-emerald-400 text-xs font-bold">贰</span>
          </div>
          <h2 className="text-sm font-semibold text-ink-300 tracking-wide">分析结果</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500/60" />
              对话 {dialogueCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ink-500" />
              旁白 {narrationCount}
            </span>
          </div>

          <button
            className="text-ink-500 hover:text-ink-300 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-6">
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {segments.map((seg, i) => (
              <div
                key={i}
                className={`group flex gap-3 rounded-xl p-3 transition-all hover:bg-ink-800/30 ${
                  seg.type === "dialogue" ? "bg-ink-800/20" : ""
                }`}
              >
                {/* Index */}
                <span className="flex-shrink-0 w-6 text-right text-[10px] text-ink-600 tabular-nums pt-0.5">
                  {i + 1}
                </span>

                {/* Type indicator */}
                <div className="flex-shrink-0 pt-0.5">
                  {seg.type === "dialogue" ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-ink-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {seg.character && (
                      <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                        {seg.character}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400 ring-1 ring-inset ring-amber-500/20">
                      {seg.emotion}
                    </span>
                  </div>
                  <p className="text-sm text-ink-400 leading-relaxed">{seg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
