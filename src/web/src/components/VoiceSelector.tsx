interface Voice {
  id: string;
  label: string;
  lang: string;
  gender: string;
}

interface Props {
  voices: Voice[];
  value: string;
  onChange: (voiceId: string) => void;
}

export default function VoiceSelector({ voices, value, onChange }: Props) {
  return (
    <select
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {voices.map((v) => (
        <option key={v.id} value={v.id}>
          {v.label} ({v.lang} · {v.gender})
        </option>
      ))}
    </select>
  );
}
