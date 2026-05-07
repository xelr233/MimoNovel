import { Hono } from "hono";
import { callLLM } from "../services/mimo-llm";

type Bindings = {
  MIMO_API_KEY: string;
};

export const generateRoute = new Hono<{ Bindings: Bindings }>();

const VOICE_DESC_PROMPT = `你是一个专业的 TTS 音色描述助手。用户会给你几个关键词或简短描述，你需要将其扩展为一段详细的音色设计描述。

参考维度：性别与年龄、音色/质感、情绪/语气、语速/节奏、角色/人设、说话风格、场景描写

要求：
- 输出 1-4 句话，核心特征描述清楚比堆砌维度更重要
- 避免矛盾特征（如"稚嫩童声 + CEO气场"）
- 避免音质效果词（混响、回声、EQ 等）
- 避免模糊词（"普通的""正常的"）
- 使用中文
- 不要输出多余的解释，直接输出音色描述`;

const SYNTHESIS_TEXT_PROMPT = `你是一个专业的 TTS 文本生成助手。根据用户提供的音色描述，生成一段适合该音色朗读/演绎的文本。

要求：
- 文本应与音色特征相匹配（如温柔音色配治愈独白，磁性音色配深夜电台）
- 文本长度 50-150 字，适合单次 TTS 合成
- 文本应有情感起伏和表现力，能展示音色特点
- 使用中文
- 不要输出多余的解释，直接输出文本`;

generateRoute.post("/generate", async (c) => {
  const { type, prompt } = await c.req.json<{
    type: "voice-desc" | "synthesis-text";
    prompt: string;
  }>();

  if (!type || !prompt) {
    return c.json({ error: "type and prompt are required" }, 400);
  }

  const systemPrompt = type === "voice-desc" ? VOICE_DESC_PROMPT : SYNTHESIS_TEXT_PROMPT;

  try {
    const result = await callLLM(c.env.MIMO_API_KEY, [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ], { temperature: 0.8 });

    return c.json({ text: result.trim() });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
