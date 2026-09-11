import { z } from "zod";
import { LlmClient } from "../llm/LlmClient";
import { searchCompanyTool, executeSearchCompany } from "../llm/tools/searchCompany";
import * as leadRepository from "../repositories/leadRepository";
import { LlmInvalidOutputError } from "../shared/errors";

// Strict contract for what we expect the LLM to return.
// If it doesn't match, it blows up here and not silently later on.
const scoreSchema = z.object({
  score: z.number().min(0).max(100),
  reason: z.string(),
});

// The service receives the LlmClient as a parameter (simple injection, no
// DI container) — so tests can pass in a FakeLlmClient.
export async function enrichAndScoreLead(leadId: string, llm: LlmClient) {
  const lead = await leadRepository.findById(leadId);

  // Step 1: let the LLM decide if it needs more info about the company
  const firstPass = await llm.chat({
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that qualifies sales leads. If you need more info about the company, use the available tool.",
      },
      {
        role: "user",
        content: `Lead: ${lead.name} from ${lead.company}. Notes: ${lead.notes ?? "no notes"}`,
      },
    ],
    tools: [searchCompanyTool],
  });

  let companyInfo = null;
  for (const call of firstPass.toolCalls) {
    if (call.toolName === "search_company") {
      companyInfo = await executeSearchCompany(call.args as { companyName: string });
    }
  }

  // Step 2: with (or without) the company info, ask for the score as strict JSON
  const secondPass = await llm.chat({
    messages: [
      {
        role: "system",
        content:
          'Return ONLY a JSON object shaped as {"score": number 0-100, "reason": string}. No extra text.',
      },
      {
        role: "user",
        content: `Lead: ${lead.name} from ${lead.company}. ${
          companyInfo ? `Company info: ${JSON.stringify(companyInfo)}` : ""
        }`,
      },
    ],
  });

  if (!secondPass.content) {
    throw new LlmInvalidOutputError("The LLM did not return any content for the score", secondPass);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(secondPass.content);
  } catch {
    throw new LlmInvalidOutputError("The LLM did not return valid JSON", secondPass.content);
  }

  const { score, reason } = scoreSchema.parse(parsed);
  await leadRepository.updateScore(leadId, score, reason);

  return { score, reason, companyInfo };
}
