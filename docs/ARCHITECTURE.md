# AI Lead Qualifier — Architecture and Decisions

Living document. Updated each session with the decisions being made.
Meant to let the project be picked back up in another conversation without
losing context.

---

## 1. Architecture style

**Separation by role, no full hexagonal ceremony.** TypeScript has structural
typing, so there's no need to declare interfaces for everything like in Java.

```
routes/ → services/ → repositories/ (or llm/)
```

- `routes/`: only parses HTTP in/out, no business logic.
- `services/`: the actual business logic, orchestrates repos and the LLM.
- `repositories/`: data access, plain exported functions (no interface).
- `llm/`: model access. **The only layer with an explicit interface**
  (`LlmClient`), because this is where we'll actually swap real
  implementations (Groq now, maybe Gemini later) and it lets us mock it in
  tests without burning real quota.

Simple rule: **interface only where there will genuinely be more than one
implementation.** Everything else is plain functions and modules.

---

## 2. Folder structure (actual, as it stands)

```
ai-lead-qualifier/
├── src/
│   ├── index.ts                     # Express bootstrap + error handler
│   ├── config/
│   │   └── env.ts                    # env var validation with zod
│   │
│   ├── routes/
│   │   └── leads.route.ts            # POST /leads, POST /leads/:id/score, GET /leads/:id
│   │
│   ├── services/
│   │   └── leadService.ts            # enrichAndScoreLead: orchestrates LLM + repo
│   │
│   ├── repositories/
│   │   └── leadRepository.ts         # plain functions over Postgres (pg)
│   │
│   ├── llm/
│   │   ├── LlmClient.ts              # interface (the only one in the project)
│   │   ├── GroqClient.ts             # real implementation
│   │   ├── FakeLlmClient.ts          # fake implementation for tests
│   │   └── tools/
│   │       └── buscarEmpresa.ts      # tool definition + execution
│   │
│   ├── workers/                      # (empty for now, session 4: BullMQ)
│   ├── eval/                         # (empty for now, session 7: eval dataset)
│   └── shared/
│       └── errors.ts                 # LlmTimeoutError, LlmInvalidOutputError, etc.
│
├── migrations/
│   └── 001_init.sql                  # leads table + pgvector extension
├── README.md                         # how to run the project
├── docs/
│   ├── ARCHITECTURE.md               # this document
│   └── CONTRIBUTING.md               # git/PR workflow
└── .env.example
```

---

## 3. Decisions made (short ADR format)

### ADR-001: Separation by role, not full hexagonal
**Decision:** `routes/ → services/ → repositories/`, with no separate
`use-cases/`, `ports/`, or `adapters/` layer.
**Why:** The goal is to learn AI backend, not to practice DDD. The only
interface that adds real value is the LLM client, because that's where
implementation swapping actually happens.

### ADR-002: TypeScript + Express
**Why:** Keep the learning curve focused on the new concepts (LLM, RAG,
agents), not on a new language's syntax.

### ADR-003: Explicit interface only for `LlmClient`
**Decision:** `LlmClient` is an interface with `GroqClient` (real) and
`FakeLlmClient` (for tests) as implementations.
**Why:** We'll be comparing providers (Groq, maybe Gemini) and need to be
able to test `services/` without calling the real model.

### ADR-004: Explicit errors for LLM failures
**Decision:** `LlmTimeoutError`, `LlmInvalidOutputError`, `LlmToolCallError`
instead of generic `Error`.
**Why:** The equivalent of Spring's exception handling, but for new causes:
invalid JSON, timeout, badly invoked tool. Lets the worker decide whether
something gets retried based on its type.

### ADR-005: Postgres + pgvector, a single data engine
**Why:** Less infrastructure, and forces an explicit decision on when a
query is traditional SQL vs. semantic search.

### ADR-006: Groq as the initial LLM provider
**Why:** Generous free tier, low latency for fast iteration while learning.
Switching providers means adding a class that implements `LlmClient`, not
rewriting anything.

### ADR-007: Synchronous processing for now (no queue yet)
**Decision:** `POST /leads/:id/score` calls the LLM directly in the request.
**Why:** Sessions 1-3 prioritized seeing the full flow (tool calling +
structured output) working end to end before adding async infrastructure.
BullMQ comes in session 4 without touching `services/`.

> *(Add new ADRs as decisions are made)*

---

## 4. Where each roadmap concept lives

| Roadmap concept | Where it lives in the code | Status |
|---|---|---|
| LLM as a primitive | `llm/GroqClient.ts` | ✅ |
| Prompt & context engineering | `services/leadService.ts` (builds the messages) | ✅ basic |
| Tool calling / agents | `llm/tools/buscarEmpresa.ts` + loop in `leadService.ts` | ✅ basic |
| Retrieval (RAG) | — | ⏳ session 5 |
| Relational + vector DBs | `repositories/leadRepository.ts` (`embedding` column already in the migration) | ⏳ partial |
| Non-deterministic failure handling | `shared/errors.ts` | ✅ types defined, not yet used in a worker |
| Evaluation and observability | `eval/` | ⏳ session 7 |
| Cost and latency | — | ⏳ pending |

---

## 5. Conventions

- `services/` receive the `LlmClient` **as a parameter**, they don't
  instantiate it themselves — so tests can inject `FakeLlmClient`.
- LLM outputs that need to be structured are validated with **zod**, the
  raw JSON is never trusted.
- LLM errors are explicit types, not generic `Error`.
- One service = one complete business action (`enrichAndScoreLead`), not a
  generic CRUD wrapped in a class.
