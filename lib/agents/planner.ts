import { callLLM, parseAgentOutput } from "@/lib/llm/client";
import { AgentOutput, ToolCall } from "@/types";

export function buildPlannerSystemPrompt(availableTools: string[]): string {
  return `You are a helpful AI planning agent. Your job is to:
1. Understand user intent from their message
2. Decide if you need to call tools to fulfill the request
3. Return a structured JSON response

Available tools:
${availableTools.map((t) => `- ${t}`).join("\n")}

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no extra text. The JSON must have this exact structure:
{
  "thought": "your reasoning about what the user wants",
  "tool_calls": [
    {
      "name": "tool_name",
      "arguments": {
        "query": "search term or relevant parameter"
      }
    }
  ],
  "ui_hint": {
    "type": "text" | "card_list" | "table"
  },
  "requires_confirmation": false,
  "summary": "plain text summary of what you found or will do"
}

If no tools are needed, leave tool_calls as an empty array.
If calling a tool, set tool_calls to the list of tools to invoke.`;
}

export async function callPlannerAgent(
  userMessage: string,
  availableTools: string[] = ["tavily_search"]
): Promise<AgentOutput> {
  const systemPrompt = buildPlannerSystemPrompt(availableTools);

  let output = await callLLM(systemPrompt, userMessage);
  let result = parseAgentOutput(output.content);

  // Single retry for parse failures
  if (!result.tool_calls && !result.summary && output.content.length > 0) {
    console.log("Parse failed, retrying...");
    output = await callLLM(systemPrompt, userMessage);
    result = parseAgentOutput(output.content);
  }

  return result;
}
