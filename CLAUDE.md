# AI Lead Qualifier — instructions for Claude Code

Personal practice project (see `README.md` and `docs/ARCHITECTURE.md` for
architecture context and roadmap). Full git/PR conventions are in
`docs/CONTRIBUTING.md` — read it before touching the repo. Operational
summary below.

## Expected flow when implementing something from the roadmap

1. **Never commit directly to `development` or `main`.** Create a branch off `development`: `<type>/<short-slug>` (`feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`, `ci/`).
2. Implement the change following the architecture conventions in `docs/ARCHITECTURE.md` (routes/services/repositories, `LlmClient` as the only interface, zod for validating LLM outputs, typed errors in `shared/errors.ts`).
3. Before committing, run `npm run typecheck`, `npm run build`, and `npm test`. Don't commit if any of these fail.
4. Commits in Conventional Commits format, **always in English** (`feat: ...`, `fix: ...`, etc. — see `docs/CONTRIBUTING.md` for full detail). No Claude co-authorship lines.
5. Push the branch and open the PR with `gh pr create --base development`, using the template in `.github/PULL_REQUEST_TEMPLATE.md` (fill in "What it does", "How to test it", checklist).
6. **Never merge the PR without explicit confirmation from the user.** Leave it open for review unless told otherwise.
7. When merging is confirmed: use a **merge commit** ("Merge pull request"), not squash and not rebase-and-fast-forward — see `docs/CONTRIBUTING.md` for the rebase-vs-merge rule (rebase locally to clean up the branch before/while it's in review, merge commit to integrate it).
8. One PR per roadmap item — don't mix different steps (e.g. don't bundle BullMQ and pgvector in the same PR).

## Things not to break

- The only explicit interface in the project is `LlmClient` (so `FakeLlmClient` can be injected in tests). Don't add interfaces everywhere just for Java/Kotlin-style "best practice" — this project uses structural typing.
- Any LLM output used as structured data goes through zod, the raw JSON is never trusted.
- LLM/domain errors are explicit types in `src/shared/errors.ts`, never generic `Error`.

## CI

`.github/workflows/ci.yml` runs `typecheck`, `build`, and `test` on every push/PR against `development` and `main`. If you add a new script the CI should run, update the workflow.
