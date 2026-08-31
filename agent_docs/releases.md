# Releases & Commits

Releases are automated via **semantic-release** on push to `main`. Commit messages must follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.) to trigger version bumps.

## SSH-signed commits (required)

All commits must be SSH-signed (verified). CI enforces this. To sign locally:

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

## Tooling

- **Prettier** — formatting (`pnpm format`). Config: `.prettierrc`. Ignores: `.prettierignore`.
- **ESLint** — linting with `typescript-eslint` (`pnpm lint`). Config: `eslint.config.js`.
- **commitlint** — enforces Conventional Commits. Config: `commitlint.config.js`.
- **Husky** — git hooks (`.husky/`).
