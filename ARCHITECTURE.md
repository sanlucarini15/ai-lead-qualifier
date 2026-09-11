# AI Lead Qualifier — Arquitectura y Decisiones

Documento vivo. Se actualiza en cada sesión con las decisiones que se van tomando.
Pensado para retomar el proyecto en otra conversación sin perder criterio.

---

## 1. Estilo de arquitectura

**Separación por rol, sin ceremonia hexagonal.** TypeScript tiene tipado
estructural, así que no hace falta declarar interfaces para todo como en Java.

```
routes/ → services/ → repositories/ (o llm/)
```

- `routes/`: solo parsea HTTP in/out, no tiene lógica de negocio.
- `services/`: la lógica de negocio real, orquesta repos y el LLM.
- `repositories/`: acceso a datos, funciones directas exportadas (sin interfaz).
- `llm/`: acceso al modelo. **Es la única capa con interfaz explícita**
  (`LlmClient`), porque acá sí vamos a swappear implementaciones reales
  (Groq ahora, capaz Gemini después) y nos sirve poder mockearlo en tests
  sin gastar cuota real.

Regla simple: **interfaz solo donde de verdad va a haber más de una
implementación.** En todo lo demás, funciones y módulos directos.

---

## 2. Estructura de carpetas (real, tal cual quedó armada)

```
ai-lead-qualifier/
├── src/
│   ├── index.ts                     # bootstrap Express + error handler
│   ├── config/
│   │   └── env.ts                    # validación de env vars con zod
│   │
│   ├── routes/
│   │   └── leads.route.ts            # POST /leads, POST /leads/:id/score, GET /leads/:id
│   │
│   ├── services/
│   │   └── leadService.ts            # enrichAndScoreLead: orquesta LLM + repo
│   │
│   ├── repositories/
│   │   └── leadRepository.ts         # funciones directas sobre Postgres (pg)
│   │
│   ├── llm/
│   │   ├── LlmClient.ts              # interfaz (único lugar del proyecto con interfaz)
│   │   ├── GroqClient.ts             # implementación real
│   │   ├── FakeLlmClient.ts          # implementación fake para tests
│   │   └── tools/
│   │       └── buscarEmpresa.ts      # definición + ejecución de la tool
│   │
│   ├── workers/                      # (vacío por ahora, sesión 4: BullMQ)
│   ├── eval/                         # (vacío por ahora, sesión 7: dataset de eval)
│   └── shared/
│       └── errors.ts                 # LlmTimeoutError, LlmInvalidOutputError, etc.
│
├── migrations/
│   └── 001_init.sql                  # tabla leads + extensión pgvector
├── README.md                         # cómo levantar el proyecto
├── ARCHITECTURE.md                   # este documento
└── .env.example
```

---

## 3. Decisiones tomadas (ADR corto)

### ADR-001: Separación por rol, no hexagonal completo
**Decisión:** `routes/ → services/ → repositories/`, sin capa de `use-cases/`
ni `ports/` ni `adapters/` separados.
**Motivo:** El objetivo es aprender AI backend, no practicar DDD. La única
interfaz que aporta valor real es la del LLM client, porque ahí sí hay
swapping real de implementación.

### ADR-002: TypeScript + Express
**Motivo:** Mantener la curva de aprendizaje enfocada en los conceptos
nuevos (LLM, RAG, agentes), no en sintaxis de un lenguaje nuevo.

### ADR-003: Interfaz explícita solo en `LlmClient`
**Decisión:** `LlmClient` es una interfaz con `GroqClient` (real) y
`FakeLlmClient` (para tests) como implementaciones.
**Motivo:** Vamos a comparar proveedores (Groq, capaz Gemini) y necesitamos
poder testear `services/` sin llamar al modelo real.

### ADR-004: Errores explícitos para fallas del LLM
**Decisión:** `LlmTimeoutError`, `LlmInvalidOutputError`, `LlmToolCallError`
en vez de `Error` genérico.
**Motivo:** El equivalente al manejo de excepciones de Spring, pero para
causas nuevas: JSON inválido, timeout, tool mal invocada. Permite decidir
en el worker si algo se reintenta o no, según el tipo.

### ADR-005: Postgres + pgvector, un solo motor de datos
**Motivo:** Menos infraestructura, y fuerza a decidir explícitamente cuándo
una query es SQL tradicional y cuándo es búsqueda semántica.

### ADR-006: Groq como proveedor de LLM inicial
**Motivo:** Free tier generoso, baja latencia para iterar rápido durante
el aprendizaje. Cambiar de proveedor es agregar una clase que implemente
`LlmClient`, no reescribir nada.

### ADR-007: Procesamiento síncrono por ahora (sin cola todavía)
**Decisión:** `POST /leads/:id/score` llama al LLM directo en el request.
**Motivo:** Sesiones 1-3 priorizaron ver el flujo completo (tool calling +
structured output) funcionando de punta a punta antes de sumar
infraestructura async. BullMQ entra en la sesión 4 sin tocar `services/`.

> *(Agregar ADR-00X a medida que se tomen nuevas decisiones)*

---

## 4. Dónde vive cada capa conceptual del roadmap

| Concepto del roadmap | Dónde vive en el código | Estado |
|---|---|---|
| LLM como primitiva | `llm/GroqClient.ts` | ✅ |
| Prompt & context engineering | `services/leadService.ts` (arma los mensajes) | ✅ básico |
| Tool calling / agentes | `llm/tools/buscarEmpresa.ts` + loop en `leadService.ts` | ✅ básico |
| Retrieval (RAG) | — | ⏳ sesión 5 |
| DBs relacional + vectorial | `repositories/leadRepository.ts` (col `embedding` ya en la migración) | ⏳ parcial |
| Manejo de fallas no determinísticas | `shared/errors.ts` | ✅ tipos definidos, falta uso en worker |
| Evaluación y observabilidad | `eval/` | ⏳ sesión 7 |
| Costo y latencia | — | ⏳ pendiente |

---

## 5. Convenciones

- Los `services/` reciben el `LlmClient` **por parámetro**, no lo instancian
  ellos mismos — así en tests se inyecta el `FakeLlmClient`.
- Salidas del LLM que deben ser estructuradas se validan con **zod**, nunca
  se confía en el JSON crudo.
- Los errores del LLM son tipos explícitos, no `Error` genérico.
- Un service = una acción de negocio completa (`enrichAndScoreLead`), no un
  CRUD genérico envuelto en una clase.
