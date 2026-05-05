import { Hono } from "hono";
import { callLLM } from "../services/mimo-llm";

type Bindings = {
  MIMO_API_KEY: string;
};

export const analyzeRoute = new Hono<{ Bindings: Bindings }>();

const SYSTEM_PROMPT = `你是一个小说文本分析助手。你的任务是分析小说文本，识别其中的角色和对话。

请将输入的小说文本拆分为多个段落，每个段落标注：
1. type: "narration"（旁白）或 "dialogue"（对话）
2. character: 角色名称（对话段落必填，旁白为 null）
3. text: 段落文本内容
4. emotion: 建议的朗读情绪（如：平静、愤怒、悲伤、开心、紧张等）

请以 JSON 数组格式返回，不要添加任何额外说明。
示例格式：
[
  {"type": "narration", "character": null, "text": "夜幕降临，小镇笼罩在一片寂静之中。", "emotion": "平静"},
  {"type": "dialogue", "character": "张三", "text": "你怎么还不回家？", "emotion": "关切"},
  {"type": "dialogue", "character": "李四", "text": "我在等一个人。", "emotion": "平静"}
]`;

analyzeRoute.post("/analyze", async (c) => {
  const { text } = await c.req.json<{ text: string }>();

  if (!text) {
    return c.json({ error: "text is required" }, 400);
  }

  try {
    const result = await callLLM(c.env.MIMO_API_KEY, [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ], { temperature: 0.3 });

    const segments = JSON.parse(result);
    return c.json({ segments });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
