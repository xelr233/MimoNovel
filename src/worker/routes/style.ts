import { Hono } from "hono";
import { callLLM } from "../services/mimo-llm";

type Bindings = {
  MIMO_API_KEY: string;
};

export const styleRoute = new Hono<{ Bindings: Bindings }>();

const SYSTEM_PROMPT = `你是一个语音风格指令生成助手。根据角色信息和上下文，为 TTS 生成自然语言风格控制指令。

输入格式：角色名称、情绪、上下文描述
输出：一段简洁的自然语言风格描述，用于控制 TTS 的语气、语速、情绪等。

要求：
- 描述简洁有力，1-2 句话即可
- 包含情绪、语速、音色质感等关键信息
- 使用中文描述
- 不要输出多余的解释`;

styleRoute.post("/style", async (c) => {
  const { character, emotion, context } = await c.req.json<{
    character: string;
    emotion: string;
    context?: string;
  }>();

  if (!character || !emotion) {
    return c.json({ error: "character and emotion are required" }, 400);
  }

  const prompt = `角色：${character}\n情绪：${emotion}${context ? `\n上下文：${context}` : ""}\n\n请生成 TTS 风格指令。`;

  try {
    const style = await callLLM(c.env.MIMO_API_KEY, [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], { temperature: 0.8 });

    return c.json({ style: style.trim() });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
