import express from "express";
import { env } from "./config/env";
import { leadsRouter } from "./routes/leads.route";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(leadsRouter);

// Centralized error handler — the equivalent of @ControllerAdvice.
// TODO(session 6): map LlmTimeoutError, LlmInvalidOutputError, etc.
// to specific HTTP responses instead of a generic 500.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? "Internal error" });
});

app.listen(env.PORT, () => {
  console.log(`Server running at http://localhost:${env.PORT}`);
});
