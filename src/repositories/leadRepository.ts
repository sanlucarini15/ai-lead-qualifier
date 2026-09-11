import { Pool } from "pg";
import { env } from "../config/env";
import { NotFoundError } from "../shared/errors";

const pool = new Pool({ connectionString: env.DATABASE_URL });

export interface Lead {
  id: string;
  nombre: string;
  email: string;
  empresa: string;
  notas: string | null;
  score: number | null;
  createdAt: Date;
}

export async function create(input: {
  nombre: string;
  email: string;
  empresa: string;
  notas?: string;
}): Promise<Lead> {
  const result = await pool.query(
    `INSERT INTO leads (nombre, email, empresa, notas)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
     RETURNING id, nombre, email, empresa, notas, score, created_at as "createdAt"`,
    [input.nombre, input.email, input.empresa, input.notas ?? null]
  );
  return result.rows[0];
}

export async function findById(id: string): Promise<Lead> {
  const result = await pool.query(`SELECT * FROM leads WHERE id = $1`, [id]);
  if (result.rows.length === 0) throw new NotFoundError("Lead", id);
  return result.rows[0];
}

export async function updateScore(id: string, score: number, razon: string): Promise<void> {
  await pool.query(`UPDATE leads SET score = $1, score_razon = $2 WHERE id = $3`, [
    score,
    razon,
    id,
  ]);
}
