import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { env } from "../config/env";
import { LlmClient, LlmResponse, ToolDefinition } from "./LlmClient";
import { LlmTimeoutError, LlmInvalidOutputError } from "../shared/errors";

const MODEL = "llama-3.3-70b-versatile"; // revisá el modelo vigente en console.groq.com
const TIMEOUT_MS = 15_000;

export class GroqClient implements LlmClient {
  private client: Groq;

  constructor() {
    this.client = new Groq({ apiKey: env.GROQ_API_KEY });
  }

  async chat(params: {
    messages: { role: "system" | "user" | "assistant" | "tool"; content: string }[];
    tools?: ToolDefinition[];
  }): Promise<LlmResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await this.client.chat.completions.create(
        {
          model: MODEL,
          messages: params.messages as ChatCompletionMessageParam[],
          tools: params.tools?.map((t) => ({
            type: "function" as const,
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            },
          })),
        },
        { signal: controller.signal }
      );

      const message = response.choices[0]?.message;
      if (!message) {
        throw new LlmInvalidOutputError("Respuesta sin choices", response);
      }

      return {
        content: message.content ?? null,
        toolCalls: (message.tool_calls ?? []).map((tc) => {
          try {
            return {
              toolName: tc.function.name,
              args: JSON.parse(tc.function.arguments),
            };
          } catch {
            throw new LlmInvalidOutputError(
              `El LLM devolvió argumentos inválidos para la tool ${tc.function.name}`,
              tc.function.arguments
            );
          }
        }),
      };
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new LlmTimeoutError();
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
