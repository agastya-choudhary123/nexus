import { AgentOutput } from "@/types";

export interface LLMOptions {
  model: string;
  systemPrompt: string;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  stop_reason: string;
}

async function callOllama(
  systemPrompt: string,
  userMessage: string,
  model: string
): Promise<LLMResponse> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: userMessage,
      system: systemPrompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.response,
    stop_reason: "end_turn",
  };
}

async function callGroq(
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    stop_reason: data.choices[0].finish_reason,
  };
}

export async function callLLM(
  systemPrompt: string,
  userMessage: string,
  options: { model?: string; useGroq?: boolean } = {}
): Promise<LLMResponse> {
  const { model = "llama3.1:8b", useGroq = false } = options;

  try {
    if (useGroq && process.env.GROQ_API_KEY) {
      return await callGroq(systemPrompt, userMessage, process.env.GROQ_API_KEY);
    }
    return await callOllama(systemPrompt, userMessage, model);
  } catch (error) {
    if (!useGroq && process.env.GROQ_API_KEY) {
      console.warn("Ollama failed, falling back to Groq", error);
      return await callGroq(systemPrompt, userMessage, process.env.GROQ_API_KEY);
    }
    throw error;
  }
}

export function parseAgentOutput(content: string): AgentOutput {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      thought: content,
      tool_calls: [],
      ui_hint: { type: "text" },
      requires_confirmation: false,
      summary: content,
    };
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    return {
      thought: content,
      tool_calls: [],
      ui_hint: { type: "text" },
      requires_confirmation: false,
      summary: content,
    };
  }
}
