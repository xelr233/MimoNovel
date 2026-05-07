import { useState } from "react";
import { useNovelStore } from "../stores/novel";
import { analyzeText } from "../lib/api";

const MODELS = [
  { id: "mimo-v2.5-pro", label: "MiMo v2.5 Pro", desc: "最强推理 · 1M上下文" },
  { id: "mimo-v2-pro", label: "MiMo v2 Pro", desc: "通用旗舰" },
  { id: "mimo-v2.5", label: "MiMo v2.5 Omni", desc: "全模态理解" },
  { id: "mimo-v2-omni", label: "MiMo v2 Omni", desc: "全模态" },
  { id: "mimo-v2-flash", label: "MiMo v2 Flash", desc: "极速轻量" },
];

export default function TextInput() {
  const { rawText, setRawText, setSegments, setIsAnalyzing, isAnalyzing } =
    useNovelStore();
  const [model, setModel] = useState("mimo-v2.5-pro");
  const [error, setError] = useState("");

  const charCount = rawText.length;

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setError("");
    setIsAnalyzing(true);
    try {
      const segments = await analyzeText(rawText, model);
      setSegments(segments);
    } catch (err: any) {
      setError(err.message || "分析失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-800/60 bg-ink-900/50 backdrop-blur-sm overflow-hidden">
      {/* Section header */}
      <div className="px-6 py-4 border-b border-ink-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">壹</span>
          </div>
          <h2 className="text-sm font-semibold text-ink-300 tracking-wide">输入小说文本</h2>
        </div>
        <span className="text-xs text-ink-600 tabular-nums">
          {charCount.toLocaleString()} 字
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Textarea */}
        <div className="relative group">
          <textarea
            className="w-full h-56 rounded-xl border border-ink-700/50 bg-ink-950/60 p-5 text-sm text-ink-300
              placeholder:text-ink-600 focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
              outline-none resize-none transition-all leading-relaxed tracking-wide"
            placeholder="在这里粘贴你的小说文本...&#10;&#10;支持中文和英文，对话和旁白会被自动识别。"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent
            group-focus-within:border-amber-500/10 transition-colors" />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Model selector */}
          <div className="flex-1 min-w-[240px]">
            <label className="block text-[11px] text-ink-500 uppercase tracking-[0.15em] mb-2">
              分析模型
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-ink-700/50 bg-ink-950/60
                  px-4 py-2.5 pr-10 text-sm text-ink-300 focus:border-amber-500/40 focus:ring-1
                  focus:ring-amber-500/20 outline-none transition-all cursor-pointer"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-ink-900">
                    {m.label} — {m.desc}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Analyze button */}
          <div className="flex-shrink-0 self-end">
            <button
              className="relative group/btn rounded-lg bg-gradient-to-r from-amber-500 to-amber-600
                px-7 py-2.5 text-sm font-semibold text-ink-950 tracking-wide
                hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed
                transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !rawText.trim()}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  分析中...
                </span>
              ) : (
                "分析文本"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
