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

要求：
- 只返回 JSON 数组，不要添加任何额外说明、markdown 标记或代码块
- 确保 JSON 格式完整，所有字符串用双引号
- 每个段落的 text 不要超过 200 字

示例格式：
[{"type":"narration","character":null,"text":"夜幕降临，小镇笼罩在一片寂静之中。","emotion":"平静"},{"type":"dialogue","character":"张三","text":"你怎么还不回家？","emotion":"关切"}]`;

function extractJSON(text: string): any[] {
  // 去掉 markdown 代码块
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

  // 尝试直接解析
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // 尝试找第一个 [ 到最后一个 ]
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start !== -1 && end > start) {
    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  throw new Error("无法从 LLM 响应中提取有效 JSON");
}

analyzeRoute.post("/analyze", async (c) => {
  const { text } = await c.req.json<{ text: string }>();

  if (!text) {
    return c.json({ error: "text is required" }, 400);
  }

  try {
    const result = await callLLM(
      c.env.MIMO_API_KEY,
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      { temperature: 0.3, maxTokens: 8192 }
    );

    const segments = extractJSON(result);
    return c.json({ segments });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
