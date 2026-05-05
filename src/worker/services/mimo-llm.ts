const BASE_URL = "https://token-plan-sgp.xiaomimimo.com/v1";

export interface LLMOptions {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export async function callLLM(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  options: LLMOptions = {}
) {
  const { temperature = 0.3, topP = 0.95, maxTokens = 4096 } = options;

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mimo-v2.5-pro",
      messages,
      temperature,
      top_p: topP,
      max_completion_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    throw new Error(`MiMo LLM error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as any;
  return data.choices[0].message.content;
}
