// Única interfaz explícita del proyecto. La justificación: vamos a tener
// más de una implementación real (Groq ahora, capaz Gemini después) y
// queremos que el compilador nos obligue a mantenerlas alineadas.

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON schema de los parámetros
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
