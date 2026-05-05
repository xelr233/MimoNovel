import { useNovelStore } from "../stores/novel";
import VoiceSelector from "./VoiceSelector";

const VOICES = [
  { id: "冰糖", label: "冰糖", lang: "中文", gender: "女" },
  { id: "茉莉", label: "茉莉", lang: "中文", gender: "女" },
  { id: "苏打", label: "苏打", lang: "中文", gender: "男" },
  { id: "白桦", label: "白桦", lang: "中文", gender: "男" },
  { id: "Mia", label: "Mia", lang: "英文", gender: "女" },
  { id: "Chloe", label: "Chloe", lang: "英文", gender: "女" },
  { id: "Milo", label: "Milo", lang: "英文", gender: "男" },
  { id: "Dean", label: "Dean", lang: "英文", gender: "男" },
];

export default function CharacterPanel() {
  const { segments, characterVoices, setCharacterVoice } = useNovelStore();

  const characters = [
    ...new Set(segments.filter((s) => s.character).map((s) => s.character!)),
  ];

  if (characters.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 font-medium text-gray-700">角色音色分配</h3>
      <div className="space-y-3">
        {characters.map((char) => {
          const current = characterVoices.get(char);
          return (
            <div key={char} className="flex items-center gap-3">
              <span className="w-20 text-sm font-medium text-gray-600 truncate">
                {char}
              </span>
              <VoiceSelector
                voices={VOICES}
                value={current?.voice || "冰糖"}
                onChange={(voice) =>
                  setCharacterVoice(char, { character: char, voice })
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
