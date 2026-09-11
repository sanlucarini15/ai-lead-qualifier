import { Router } from "express";
import { z } from "zod";
import * as leadRepository from "../repositories/leadRepository";
import { enrichAndScoreLead } from "../services/leadService";
import { GroqClient } from "../llm/GroqClient";
import { NotFoundError } from "../shared/errors";

export const leadsRouter = Router();

// TODO(sesión 4): esto va a pasar a encolarse con BullMQ en vez de
// procesarse sincrónicamente acá. Por ahora, síncrono para poder ver
// el flujo completo funcionando de punta a punta.
const llm = new GroqClient();

const createLeadSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  empresa: z.string().min(1),
  notas: z.string().optional(),
});

leadsRouter.post("/leads", async (req, res, next) => {
  try {
    const input = createLeadSchema.parse(req.body);
    const lead = await leadRepository.create(input);
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
});

leadsRouter.post("/leads/:id/score", async (req, res, next) => {
  try {
    const result = await enrichAndScoreLead(req.params.id, llm);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

leadsRouter.get("/leads/:id", async (req, res, next) => {
  try {
    const lead = await leadRepository.findById(req.params.id);
    res.json(lead);
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
});
