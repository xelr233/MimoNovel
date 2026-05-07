const steps = [
  { key: "input", label: "输入文本", icon: "壹" },
  { key: "result", label: "分析结果", icon: "贰" },
  { key: "play", label: "有声播放", icon: "叁" },
];

interface Props {
  current: "input" | "result" | "play";
}

export default function StepIndicator({ current }: Props) {
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-500 ${
                isActive
                  ? "bg-amber-500/15 border border-amber-500/30"
                  : isDone
                  ? "bg-ink-800/50 border border-ink-700/50"
                  : "border border-ink-800/40"
              }`}
            >
              <span
                className={`text-sm font-bold transition-colors ${
                  isActive ? "text-amber-400" : isDone ? "text-emerald-400" : "text-ink-600"
                }`}
              >
                {isDone ? "✓" : step.icon}
              </span>
              <span
                className={`text-xs tracking-wide transition-colors ${
                  isActive ? "text-amber-300" : isDone ? "text-ink-400" : "text-ink-600"
                }`}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={`w-8 h-px transition-colors duration-500 ${
                  i < currentIndex ? "bg-emerald-500/40" : "bg-ink-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
