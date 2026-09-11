import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  GROQ_API_KEY: z.string().min(1, "Missing GROQ_API_KEY in .env"),
  DATABASE_URL: z.string().min(1, "Missing DATABASE_URL in .env"),
  PORT: z.coerce.number().default(3000),
});

// Validated once at startup. If something's missing, the process dies here
// instead of mid-request at random — better to fail fast and loud.
export const env = envSchema.parse(process.env);
