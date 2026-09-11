import { LlmClient, LlmResponse } from "./LlmClient";

// Fake implementation of the same contract. Used to test services without
// calling Groq for real — no burning quota, no network dependency.
export class FakeLlmClient implements LlmClient {
  constructor(private fixedResponse: LlmResponse) {}

  async chat(): Promise<LlmResponse> {
    return this.fixedResponse;
  }
}
