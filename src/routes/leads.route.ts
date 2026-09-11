import { Router } from "express";
import { z } from "zod";
import * as leadRepository from "../repositories/leadRepository";
import { enrichAndScoreLead } from "../services/leadService";
import { GroqClient } from "../llm/GroqClient";
import { NotFoundError } from "../shared/errors";

export const leadsRouter = Router();

// TODO(session 4): this is going to move to being queued with BullMQ
// instead of processed synchronously here. For now, synchronous so we
// can see the full flow working end to end.
const llm = new GroqClient();

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  notes: z.string().optional(),
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
