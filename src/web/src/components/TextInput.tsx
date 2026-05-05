import { useNovelStore } from "../stores/novel";
import { analyzeText } from "../lib/api";

export default function TextInput() {
  const { rawText, setRawText, setSegments, setIsAnalyzing, isAnalyzing } =
    useNovelStore();

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    try {
      const segments = await analyzeText(rawText);
      setSegments(segments);
    } catch (err) {
      console.error("分析失败:", err);
      alert("文本分析失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full h-64 rounded-lg border border-gray-300 p-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
        placeholder="粘贴小说文本..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />
      <button
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handleAnalyze}
        disabled={isAnalyzing || !rawText.trim()}
      >
        {isAnalyzing ? "分析中..." : "分析文本"}
      </button>
    </div>
  );
}
