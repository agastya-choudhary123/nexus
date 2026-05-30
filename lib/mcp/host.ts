"use server";

import { ToolExecutionResult } from "@/lib/mcp/types";

export async function executeTavilySearch(
  query: string
): Promise<ToolExecutionResult> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return {
      content: [
        {
          type: "text",
          text: "Error: TAVILY_API_KEY not configured",
        },
      ],
      isError: true,
    };
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();

    let resultText = `Search results for "${query}":\n\n`;

    if (data.answer) {
      resultText += `Answer: ${data.answer}\n\n`;
    }

    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((result: any, idx: number) => {
        resultText += `${idx + 1}. ${result.title}\n`;
        resultText += `   ${result.url}\n`;
        if (result.content) {
          resultText += `   ${result.content.substring(0, 200)}...\n`;
        }
        resultText += "\n";
      });
    }

    return {
      content: [
        {
          type: "text",
          text: resultText,
        },
      ],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [
        {
          type: "text",
          text: `Search error: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
