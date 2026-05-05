const BASE_URL = "https://token-plan-sgp.xiaomimimo.com/v1";

export type TTSModel = "mimo-v2.5-tts" | "mimo-v2.5-tts-voicedesign" | "mimo-v2.5-tts-voiceclone";

export interface TTSOptions {
  model?: TTSModel;
  voice?: string;
  style?: string;
  format?: "wav" | "pcm16";
}

export async function callTTS(
  apiKey: string,
  text: string,
  options: TTSOptions = {}
) {
  const {
    model = "mimo-v2.5-tts",
    voice = "冰糖",
    style,
    format = "wav",
  } = options;

  const messages: Array<{ role: string; content: string }> = [];

  if (style) {
    messages.push({ role: "user", content: style });
  }

  messages.push({ role: "assistant", content: text });

  const body: Record<string, any> = {
    model,
    messages,
    audio: { format, voice },
  };

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`MiMo TTS error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as any;
  const audioBase64 = data.choices[0].message.audio.data;
  return audioBase64;
}
