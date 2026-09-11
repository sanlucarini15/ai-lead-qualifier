import { LlmClient, LlmResponse } from "./LlmClient";

// Implementación fake del mismo contrato. Sirve para testear los services
// sin llamar a Groq de verdad — ni gastar cuota, ni depender de la red.
export class FakeLlmClient implements LlmClient {
  constructor(private fixedResponse: LlmResponse) {}

  async chat(): Promise<LlmResponse> {
    return this.fixedResponse;
  }
}
