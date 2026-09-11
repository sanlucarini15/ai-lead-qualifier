// The only explicit interface in the project. The reasoning: we'll have
// more than one real implementation (Groq now, maybe Gemini later) and
// want the compiler to force us to keep them aligned.

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON schema for the parameters
}

export interface ToolCall {
  toolName: string;
  args: Record<string, unknown>;
}

export interface LlmResponse {
  content: string | null;
  toolCalls: ToolCall[];
}

export interface LlmClient {
  chat(params: {
    messages: { role: "system" | "user" | "assistant" | "tool"; content: string }[];
    tools?: ToolDefinition[];
  }): Promise<LlmResponse>;
}
