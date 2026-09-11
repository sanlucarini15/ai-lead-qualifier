// Errores explícitos en vez de "Error" genérico, para poder decidir
// en el worker si algo se reintenta, se descarta, o se manda a dead-letter.

export class LlmInvalidOutputError extends Error {
  constructor(message: string, public raw: unknown) {
    super(message);
    this.name = "LlmInvalidOutputError";
  }
}

export class LlmTimeoutError extends Error {
  constructor(message = "El LLM tardó demasiado en responder") {
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
    super(`${entity} con id ${id} no encontrado`);
    this.name = "NotFoundError";
  }
}
