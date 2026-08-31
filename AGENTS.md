# AGENTS.md

MCP server exposing CoinCap v3 cryptocurrency data via STDIO and Streamable HTTP transports. TypeScript, Node.js 22.14+, pnpm, Zod, Vitest.

## Critical rules

- `COINCAP_API_KEY` is required at runtime — never commit it.
- One file per tool in `src/tools/`; each exports a `*Schema` (Zod) and `handle*(args)`. Wrap `.parse()` in try/catch returning `isError: true` on validation failure.
- Register new tools/resources/prompts in `src/index.ts`.
- Cache lives in `src/services/coincap.ts` (`CACHE_TTL` = 60s) — don't bypass it for CoinCap calls.
- Commits must be SSH-signed and follow Conventional Commits (`feat:`, `fix:`, `chore:`...). Releases are automated via semantic-release on push to `main`.
- Don't add code-style rules here — Prettier (`.prettierrc`) and ESLint (`eslint.config.js`) own formatting/linting.
- Use `pnpm` (not npm/yarn). Run `pnpm types:check` and `pnpm test` before considering work done.

## Entry points

- STDIO: `src/index.ts` → `dist/index.js`
- HTTP: `src/http.ts` → `dist/http.js` (key via `?COINCAP_API_KEY={key}`)

## Progressive disclosure

Read the relevant file when working on a specific area:

- `agent_docs/commands.md` — development, build, test, lint commands
- `agent_docs/architecture.md` — request flow, design points, env vars
- `agent_docs/tools.md` — the 13 tools, resources, and prompts reference
- `agent_docs/releases.md` — semantic-release, SSH signing, tooling configs
