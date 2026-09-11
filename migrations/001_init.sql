CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  empresa TEXT NOT NULL,
  notas TEXT,
  score NUMERIC,
  score_razon TEXT,
  embedding VECTOR(1536), -- se completa en la sesión de RAG
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_empresa ON leads (empresa);
