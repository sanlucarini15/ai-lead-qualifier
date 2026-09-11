# Working conventions

Solo, practice project, but we follow a team-like workflow to exercise it.
None of this is enforced with git hooks (for now) — it's judgment to apply
by hand, both by me and by Claude Code.

## Branches

- `main`: always deployable, never committed to directly.
- `development`: integration branch.
- Work branches off `development`, named `<type>/<short-slug>`:
  - `feat/bullmq-worker`
  - `fix/score-timeout-retry`
  - `chore/ci-workflow`
  - `docs/architecture-update`
  - `refactor/leads-service`
  - `test/fake-llm-client`

## Commits — Conventional Commits

Commit messages are always in English, regardless of what language the
session is conducted in.

Format: `<type>(<optional scope>): <description, imperative mood, lowercase, no trailing period>`

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`.

Examples:
```
feat(worker): move lead scoring to a BullMQ job
fix(llm): handle Groq timeout with exponential retry
chore(ci): add build and test workflow
docs(architecture): document BullMQ vs cron decision
```

Rules:
- One commit = one logical change. Don't mix a refactor with a feature.
- Commit body (optional, after a blank line, also in English) explains the
  *why*, not the *what* (the diff already says that).
- Breaking changes: `!` after the type (`feat!: ...`) + note in the body.
- No Claude co-authorship lines (`Co-Authored-By: Claude ...`) in commits.

## Pull Requests

- Always against `development` (never directly to `main`).
- One PR = one roadmap item (see `README.md`), don't mix different steps.
- PR title follows Conventional Commits (`feat: add BullMQ worker for async scoring`).
- Description follows `.github/PULL_REQUEST_TEMPLATE.md`.
- Before opening the PR, run locally: `npm run typecheck`, `npm run build`, `npm test`. The CI workflow runs the same.
- Merge into `development`: **merge commit** ("Merge pull request" on GitHub), not squash — see below.
- Merge from `development` into `main`: when a full roadmap session/milestone is closed, not per PR (also a merge commit, not squash).

## Rebase vs. merge

- **Rebase** your feature branch on top of `development` while it's still local/in-progress and not yet reviewed, to keep commit history linear and each commit atomic before opening (or updating) the PR. Never rebase a branch others are already reviewing/building on.
- **Merge commit** to integrate a finished PR into `development` or `main`. It preserves the already-curated commit history from the branch and leaves an explicit integration point in the graph — cleaner to read than a rebase-and-fast-forward for a repo with more than one commit per feature, and doesn't collapse meaningful atomic commits the way squash would.
- Squash is the exception, not the default: only use it if a branch ended up with messy WIP/fixup commits not worth preserving individually.

## When asking Claude Code for this

When asking Claude to implement something from the roadmap, the expected
flow is:
1. Create a new branch off `development` named per the convention above.
2. Implement + run `typecheck`/`build`/`test` locally.
3. Commit(s) following Conventional Commits, in English.
4. Push the branch.
5. Open the PR against `development` with `gh pr create`, using the template.
6. Don't merge the PR without review, unless explicitly told to "merge it".
