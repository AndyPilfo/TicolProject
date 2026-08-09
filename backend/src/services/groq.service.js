import Groq from "groq-sdk";
import { env } from "../config/env.js";

let groqClient = null;

export function isGroqConfigured() {
  return Boolean(env.GROQ_API_KEY && env.GROQ_MODEL);
}

function getGroqClient() {
  if (!isGroqConfigured()) return null;

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: env.GROQ_API_KEY,
      timeout: env.GROQ_TIMEOUT_MS,
      maxRetries: 0
    });
  }

  return groqClient;
}

export async function generateGroqCompletion(messages) {
  const client = getGroqClient();
  if (!client) {
    return { configured: false, content: null };
  }

  const completion = await client.chat.completions.create({
    model: env.GROQ_MODEL,
    messages,
    temperature: env.GROQ_TEMPERATURE,
    max_tokens: env.GROQ_MAX_TOKENS
  });

  const content = completion.choices?.[0]?.message?.content?.trim() ?? "";
  return { configured: true, content };
}
