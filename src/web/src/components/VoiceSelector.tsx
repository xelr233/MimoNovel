interface Voice {
  id: string;
  label: string;
  lang: string;
  gender: string;
  color?: string;
}

interface Props {
  voices: Voice[];
  value: string;
  onChange: (voiceId: string) => void;
}

export default function VoiceSelector({ voices, value, onChange }: Props) {
  return (
    <select
      className="mt-1 w-full appearance-none bg-transparent text-xs text-ink-500
        focus:text-amber-400 outline-none cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {voices.map((v) => (
        <option key={v.id} value={v.id} className="bg-ink-900 text-ink-300">
          {v.label} ({v.lang}·{v.gender})
        </option>
      ))}
    </select>
  );
}
