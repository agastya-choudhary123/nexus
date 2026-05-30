export type UIHintType = "text" | "card_list" | "table" | "chart" | "action_required";

export interface UIHint {
  type: UIHintType;
  priority?: "low" | "medium" | "high";
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface AgentOutput {
  thought: string;
  tool_calls: ToolCall[];
  ui_hint: UIHint;
  requires_confirmation: boolean;
  summary: string;
}
