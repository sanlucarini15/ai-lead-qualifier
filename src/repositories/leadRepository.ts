import { Pool } from "pg";
import { env } from "../config/env";
import { NotFoundError } from "../shared/errors";

const pool = new Pool({ connectionString: env.DATABASE_URL });

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  notes: string | null;
  score: number | null;
  createdAt: Date;
}

export async function create(input: {
  name: string;
  email: string;
  company: string;
  notes?: string;
}): Promise<Lead> {
  const result = await pool.query(
    `INSERT INTO leads (name, email, company, notes)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, name, email, company, notes, score, created_at as "createdAt"`,
    [input.name, input.email, input.company, input.notes ?? null]
  );
  return result.rows[0];
}

export async function findById(id: string): Promise<Lead> {
  const result = await pool.query(`SELECT * FROM leads WHERE id = $1`, [id]);
  if (result.rows.length === 0) throw new NotFoundError("Lead", id);
  return result.rows[0];
}

export async function updateScore(id: string, score: number, reason: string): Promise<void> {
  await pool.query(`UPDATE leads SET score = $1, score_reason = $2 WHERE id = $3`, [
    score,
    reason,
    id,
  ]);
}
