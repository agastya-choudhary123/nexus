"use server";

import { callPlannerAgent } from "@/lib/agents/planner";
import { executeTavilySearch } from "@/lib/mcp/host";

export async function chatAction(userMessage: string): Promise<string> {
  try {
    // Call the Planner agent
    const agentOutput = await callPlannerAgent(userMessage);

    // Execute any tool calls
    let toolResults = "";
    if (agentOutput.tool_calls && agentOutput.tool_calls.length > 0) {
      for (const toolCall of agentOutput.tool_calls) {
        if (toolCall.name === "tavily_search") {
          const query = (toolCall.arguments as Record<string, unknown>)
            .query as string;
          const result = await executeTavilySearch(query);
          toolResults += result.content
            .map((c) => c.text || "")
            .join("\n");
        }
      }
    }

    // Return the summary and tool results
    const response =
      agentOutput.summary + (toolResults ? `\n\n${toolResults}` : "");
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Chat error: ${message}`);
  }
}
