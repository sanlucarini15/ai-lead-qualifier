import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  GROQ_API_KEY: z.string().min(1, "Falta GROQ_API_KEY en el .env"),
  DATABASE_URL: z.string().min(1, "Falta DATABASE_URL en el .env"),
  PORT: z.coerce.number().default(3000),
});

// Validamos una sola vez al arrancar. Si falta algo, el proceso muere acá
// y no en medio de una request random — preferible fallar rápido y claro.
export const env = envSchema.parse(process.env);
