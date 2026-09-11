import { z } from "zod";
import { LlmClient } from "../llm/LlmClient";
import { buscarEmpresaTool, ejecutarBuscarEmpresa } from "../llm/tools/buscarEmpresa";
import * as leadRepository from "../repositories/leadRepository";
import { LlmInvalidOutputError } from "../shared/errors";

// Contrato estricto de lo que esperamos que devuelva el LLM.
// Si no matchea, explota acá y no silenciosamente más adelante.
const scoreSchema = z.object({
  score: z.number().min(0).max(100),
  razon: z.string(),
});

// El service recibe el LlmClient por parámetro (inyección simple, sin
// container de DI) — así en los tests le pasamos un FakeLlmClient.
export async function enrichAndScoreLead(leadId: string, llm: LlmClient) {
  const lead = await leadRepository.findById(leadId);

  // Paso 1: dejamos que el LLM decida si necesita buscar más info de la empresa
  const firstPass = await llm.chat({
    messages: [
      {
        role: "system",
        content:
          "Sos un asistente que califica leads comerciales. Si necesitás más info de la empresa, usá la tool disponible.",
      },
      {
        role: "user",
        content: `Lead: ${lead.nombre} de ${lead.empresa}. Notas: ${lead.notas ?? "sin notas"}`,
      },
    ],
    tools: [buscarEmpresaTool],
  });

  let empresaInfo = null;
  for (const call of firstPass.toolCalls) {
    if (call.toolName === "buscar_empresa") {
      empresaInfo = await ejecutarBuscarEmpresa(call.args as { nombre: string });
    }
  }

  // Paso 2: con (o sin) la info de la empresa, pedimos el score en JSON estricto
  const secondPass = await llm.chat({
    messages: [
      {
        role: "system",
        content:
          'Devolvé SOLO un JSON con la forma {"score": number 0-100, "razon": string}. Nada de texto extra.',
      },
      {
        role: "user",
        content: `Lead: ${lead.nombre} de ${lead.empresa}. ${
          empresaInfo ? `Info de la empresa: ${JSON.stringify(empresaInfo)}` : ""
        }`,
      },
    ],
  });

  if (!secondPass.content) {
    throw new LlmInvalidOutputError("El LLM no devolvió contenido para el score", secondPass);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(secondPass.content);
  } catch {
    throw new LlmInvalidOutputError("El LLM no devolvió JSON válido", secondPass.content);
  }

  const { score, razon } = scoreSchema.parse(parsed);
  await leadRepository.updateScore(leadId, score, razon);

  return { score, razon, empresaInfo };
}
