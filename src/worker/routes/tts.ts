import { Hono } from "hono";
import { callTTS, type TTSModel, type TTSOptions } from "../services/mimo-tts";

type Bindings = {
  MIMO_API_KEY: string;
};

export const ttsRoute = new Hono<{ Bindings: Bindings }>();

ttsRoute.post("/tts", async (c) => {
  const { text, voice, style, model, format } = await c.req.json<{
    text: string;
    voice?: string;
    style?: string;
    model?: TTSModel;
    format?: "wav" | "pcm16";
  }>();

  if (!text) {
    return c.json({ error: "text is required" }, 400);
  }

  const options: TTSOptions = {};
  if (voice) options.voice = voice;
  if (style) options.style = style;
  if (model) options.model = model;
  if (format) options.format = format;

  try {
    const audioBase64 = await callTTS(c.env.MIMO_API_KEY, text, options);
    return c.json({ audio: audioBase64 });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
