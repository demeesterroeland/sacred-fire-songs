## Description

Summary of the change, motivation and context.

Closes # (issue)

## Target branch (Gitflow)

- [ ] Work branch (`feat/…`, `fix/…`, `chore/…`, `docs/…`) → **`develop`** (squash)
- [ ] `hotfix/…` → **`main`** (squash; `main` is back-merged into `develop` automatically)
- [ ] Promotion `develop` → **`main`** (merge commit)

The PR title is a Conventional Commit (`feat(scope): …`); it becomes the squash commit and drives Release Please.

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Chore (documentation, refactoring, dependency upgrade)

## Test pyramid

- [ ] L1 static: `npm run lint` and `npx tsc --noEmit`
- [ ] L2 unit / BDD: `npm test` and `npm run test:bdd:unit` (failing test written first)
- [ ] L3/L4 component, integration or `npm run test:bdd:seed` where relevant
- [ ] L5 E2E: Playwright journey added or updated where user-visible behaviour changed
- [ ] Manual verification (describe steps)

## Checklist

- [ ] Docs, tests and code aligned (design doc, stories, feature files, changelog headers)
- [ ] All 8 locale files updated for new UX copy
- [ ] `/sync-artifacts` run; logbook committed on this branch
- [ ] No deployment details (hosts, server paths, deploy secrets) in this public repo
