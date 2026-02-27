import { mustEnv } from "./env";

export type ChatResult = {
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
};

export async function asiChat(userMessage: string): Promise<ChatResult> {
  const baseURL = mustEnv("ASI_CLOUD_BASE_URL").replace(/\/$/, "");
  const apiKey = mustEnv("ASI_CLOUD_API_KEY");
  const model = mustEnv("ASI_CLOUD_MODEL");

  const res = await fetch(`${baseURL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are Mushee AI, a helpful identity + Web3 assistant. Be concise, friendly, and practical." },
        { role: "user", content: userMessage }
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`ASI:Cloud error ${res.status}: ${t}`);
  }

  const data: any = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  const usedModel = data?.model ?? model;
  const usage = data?.usage ?? {};
  return {
    text,
    model: usedModel,
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
  };
}
