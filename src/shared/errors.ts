// Explicit errors instead of a generic "Error", so the worker can decide
// whether something gets retried, discarded, or sent to dead-letter.

export class LlmInvalidOutputError extends Error {
  constructor(message: string, public raw: unknown) {
    super(message);
    this.name = "LlmInvalidOutputError";
  }
}

export class LlmTimeoutError extends Error {
  constructor(message = "The LLM took too long to respond") {
    super(message);
    this.name = "LlmTimeoutError";
  }
}

export class LlmToolCallError extends Error {
  constructor(message: string, public toolName: string) {
    super(message);
    this.name = "LlmToolCallError";
  }
}

export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}
