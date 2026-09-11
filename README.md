# AI Lead Qualifier

Practice project to move from traditional backend to AI backend. Receives leads,
uses an LLM with tool calling to enrich them, and assigns them a score.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for architecture decisions and the conceptual roadmap, and [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) for the git/PR workflow.

## Setup

### 1. Get a Groq API key

1. Go to [console.groq.com](https://console.groq.com)
2. Create a free account
3. **API Keys** section → **Create API Key**
4. Copy it, you'll need it in step 4

### 2. Start Postgres with pgvector (Docker)

```bash
docker run --name ai-lead-db -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=ai_lead_qualifier -p 5433:5432 -d ankane/pgvector
```

### 3. Run the initial migration

```bash
docker exec -i ai-lead-db psql -U postgres -d ai_lead_qualifier < migrations/001_init.sql
```

### 4. Environment variables

```bash
cp .env.example .env
# fill in GROQ_API_KEY with the key from step 1
```

### 5. Install dependencies and start the server

```bash
npm install
npm run dev
```

Should end up running on `http://localhost:3000`.

## Verify it works

```bash
# health check
curl http://localhost:3000/health

# create a lead
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Perez","email":"juan@acme.com","empresa":"Acme Corp","notas":"Pidió demo por LinkedIn"}'

# score the lead (use the id returned by the previous POST)
curl -X POST http://localhost:3000/leads/<ID>/score
```

If the second curl returns JSON with `score` and `razon`, tool calling +
structured output are working end to end. 🎉

## Project status (session roadmap)

- [x] Session 1: setup + basic tool calling
- [x] Session 2: REST API + Postgres
- [x] Session 3: enrichment with real tool calling
- [ ] Session 4: BullMQ for async processing
- [ ] Session 5: pgvector + similar-lead search
- [ ] Session 6: failure handling — retries and idempotency
- [ ] Session 7: evaluation dataset
