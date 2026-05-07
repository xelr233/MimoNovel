import { useNovelStore } from "../stores/novel";
import VoiceSelector from "./VoiceSelector";

const VOICES = [
  { id: "冰糖", label: "冰糖", lang: "中文", gender: "女", color: "bg-pink-500" },
  { id: "茉莉", label: "茉莉", lang: "中文", gender: "女", color: "bg-purple-500" },
  { id: "苏打", label: "苏打", lang: "中文", gender: "男", color: "bg-blue-500" },
  { id: "白桦", label: "白桦", lang: "中文", gender: "男", color: "bg-cyan-500" },
  { id: "Mia", label: "Mia", lang: "英文", gender: "女", color: "bg-rose-500" },
  { id: "Chloe", label: "Chloe", lang: "英文", gender: "女", color: "bg-amber-500" },
  { id: "Milo", label: "Milo", lang: "英文", gender: "男", color: "bg-emerald-500" },
  { id: "Dean", label: "Dean", lang: "英文", gender: "男", color: "bg-teal-500" },
];

export default function CharacterPanel() {
  const { segments, characterVoices, setCharacterVoice } = useNovelStore();

  const characters = [
    ...new Set(segments.filter((s) => s.character).map((s) => s.character!)),
  ];

  if (characters.length === 0) return null;

  return (
    <div className="rounded-2xl border border-ink-800/60 bg-ink-900/50 backdrop-blur-sm overflow-hidden">
      {/* Section header */}
      <div className="px-6 py-4 border-b border-ink-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-purple-500/10 flex items-center justify-center">
            <span className="text-purple-400 text-xs font-bold">角</span>
          </div>
          <h2 className="text-sm font-semibold text-ink-300 tracking-wide">角色音色分配</h2>
        </div>
        <span className="text-xs text-ink-600">{characters.length} 个角色</span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {characters.map((char, i) => {
            const current = characterVoices.get(char);
            const voiceData = VOICES.find(v => v.id === (current?.voice || "冰糖"));

            return (
              <div
                key={char}
                className="group flex items-center gap-3 rounded-xl border border-ink-800/40 bg-ink-950/40
                  px-4 py-3 hover:border-ink-700/60 transition-all"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Character avatar */}
                <div className={`w-8 h-8 rounded-full ${voiceData?.color || "bg-ink-600"} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <span className="text-white text-xs font-bold">{char[0]}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-ink-300 truncate">{char}</span>
                  <VoiceSelector
                    voices={VOICES}
                    value={current?.voice || "冰糖"}
                    onChange={(voice) =>
                      setCharacterVoice(char, { character: char, voice })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
