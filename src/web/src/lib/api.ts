export interface Segment {
  type: "narration" | "dialogue";
  character: string | null;
  text: string;
  emotion: string;
}

export interface CharacterVoice {
  character: string;
  voice: string;
  style?: string;
}

export async function analyzeText(text: string): Promise<Segment[]> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`分析失败: ${res.status}`);
  const data = await res.json();
  return data.segments;
}

export async function generateStyle(
  character: string,
  emotion: string,
  context?: string
): Promise<string> {
  const res = await fetch("/api/style", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ character, emotion, context }),
  });
  if (!res.ok) throw new Error(`风格生成失败: ${res.status}`);
  const data = await res.json();
  return data.style;
}

export async function synthesizeSpeech(
  text: string,
  options: { voice?: string; style?: string } = {}
): Promise<string> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, ...options }),
  });
  if (!res.ok) throw new Error(`语音合成失败: ${res.status}`);
  const data = await res.json();
  return data.audio;
}
