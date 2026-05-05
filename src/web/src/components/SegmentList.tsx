import { useNovelStore } from "../stores/novel";

export default function SegmentList() {
  const { segments } = useNovelStore();

  if (segments.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 font-medium text-gray-700">分析结果</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`rounded-md p-3 text-sm ${
              seg.type === "dialogue"
                ? "bg-blue-50 border-l-4 border-blue-400"
                : "bg-gray-50 border-l-4 border-gray-300"
            }`}
          >
            {seg.character && (
              <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {seg.character}
              </span>
            )}
            <span className="mr-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              {seg.emotion}
            </span>
            <p className="mt-1 text-gray-700">{seg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
