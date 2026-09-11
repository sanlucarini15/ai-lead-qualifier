# AI Lead Qualifier

Proyecto de práctica para pasar de backend tradicional a AI backend. Recibe leads,
usa un LLM con tool calling para enriquecerlos, y les asigna un score.

Ver `ARCHITECTURE.md` para las decisiones de arquitectura y el roadmap conceptual.

## Setup

### 1. Conseguir la API key de Groq

1. Andá a [console.groq.com](https://console.groq.com)
2. Creá una cuenta gratis
3. Sección **API Keys** → **Create API Key**
4. Copiala, la vas a necesitar en el paso 4

### 2. Levantar Postgres con pgvector (Docker)

```bash
docker run --name lead-db -e POSTGRES_PASSWORD=devpass -p 5432:5432 -d ankane/pgvector
```

### 3. Correr la migración inicial

```bash
docker exec -i lead-db psql -U postgres -d postgres < migrations/001_init.sql
```

### 4. Variables de entorno

```bash
cp .env.example .env
# completá GROQ_API_KEY con la key del paso 1
```

### 5. Instalar dependencias y levantar el server

```bash
npm install
npm run dev
```

Debería quedar corriendo en `http://localhost:3000`.

## Probar que funciona

```bash
# health check
curl http://localhost:3000/health

# crear un lead
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Perez","email":"juan@acme.com","empresa":"Acme Corp","notas":"Pidió demo por LinkedIn"}'

# scorear el lead (usá el id que devolvió el POST anterior)
curl -X POST http://localhost:3000/leads/<ID>/score
```

Si el segundo curl te devuelve un JSON con `score` y `razon`, tool calling +
structured output están andando de punta a punta. 🎉

## Estado del proyecto (roadmap de sesiones)

- [x] Sesión 1: setup + tool calling básico
- [x] Sesión 2: API REST + Postgres
- [x] Sesión 3: enrichment con tool calling real
- [ ] Sesión 4: BullMQ para procesamiento asíncrono
- [ ] Sesión 5: pgvector + búsqueda de leads similares
- [ ] Sesión 6: manejo de fallas — reintentos e idempotencia
- [ ] Sesión 7: dataset de evaluación
