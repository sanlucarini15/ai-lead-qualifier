import express from "express";
import { env } from "./config/env";
import { leadsRouter } from "./routes/leads.route";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(leadsRouter);

// Manejador de errores centralizado — el equivalente a @ControllerAdvice.
// TODO(sesión 6): mapear LlmTimeoutError, LlmInvalidOutputError, etc.
// a respuestas HTTP específicas en vez de un 500 genérico.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? "Error interno" });
});

app.listen(env.PORT, () => {
  console.log(`Server corriendo en http://localhost:${env.PORT}`);
});
