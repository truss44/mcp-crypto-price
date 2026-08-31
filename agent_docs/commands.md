# Development Commands

Requires **Node.js 22.14+**.

```bash
pnpm dev              # HTTP server with hot reload (Smithery CLI)
pnpm build            # Compile TypeScript → dist/
pnpm start:http       # Start HTTP server (dist/http.js)
pnpm start:stdio      # Start STDIO server (dist/index.js)

pnpm test             # Run all tests (Vitest)
pnpm test:coverage    # Tests with coverage
pnpm vitest run src/services/__tests__/coincap.test.ts  # Single test file

pnpm lint             # ESLint + typescript-eslint
pnpm lint:fix         # Auto-fix lint errors
pnpm format           # Prettier
pnpm types:check      # tsc --noEmit
pnpm watch            # tsc --watch
pnpm inspector        # MCP Inspector (debug tools interactively)
```
