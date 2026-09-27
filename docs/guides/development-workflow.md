# Software Development Life Cycle (SDLC) & CI/CD Workflow

This document outlines the industry-standard **GitHub Flow** tailored specifically for the Sacred Fire Songs Docker-based infrastructure. It covers local development, preview deployments, QA testing, and production releases.

## 1. Local Development (Feature Branches)

**Goal**: Develop in an isolated, safe environment without affecting production data.

1. **Create an Issue**: Never write code without an Issue to track it.
2. **Branch out**: `git checkout -b feat/<issue-id>-<description>`
3. **Database Setup**:
   * **Local Supabase**: Run `npx supabase start` to spin up the local database and auth services. Your `.env.local` should point to `http://127.0.0.1:54321`.
   * **Testing server**: When running `npm run build && npm run start`, use port `3<issue#>` for dev servers, or `4<issue#>` for local production builds (e.g., port `4237`).
4. **Develop & Commit**: Make incremental commits using Conventional Commits (`feat: ...`, `fix: ...`).

## 2. The Preview Environment (`dev2preview`)

**Goal**: Validate changes on a live server connected to the Staging database before merging.

When your feature is functionally complete and you are ready to test it on the actual hardware/network:

1. Run the deployment script: 
   ```bash
   scripts/dev2preview.sh
   ```
2. **What happens under the hood?**
   * The script pushes your branch to origin.
   * It triggers the GitHub Actions `docker.yml` workflow natively via the CLI.
   * The workflow builds the Docker images (App and Migrator) and dual-tags them with both your branch name (e.g., `feat-237...`) AND the rolling `:preview` tag.
3. **Server Deployment Setup**:
   * SSH into your preview server.
   * Ensure your `.env` file contains: `IMAGE_TAG=preview`
   * Run: `docker compose pull && docker compose up -d`
   * Because of the `:preview` tag, you never need to edit your server configuration again. It will automatically pull your newest feature branch build.

## 3. QA Testing & Validation

**Goal**: Ensure stability.

1. **Manual Testing**: Visit your preview URL and physically test the feature. Check for regressions and verify UI logic. 
2. **Database Verification**: The preview server ALWAYS points to the **Staging Supabase** project. If data looks empty, check if the staging project was auto-paused due to inactivity.

## 4. The Pull Request & E2E Smoke Tests

**Goal**: Automated validation and Code Review.

1. **Open a PR**: Once manual testing on the preview server is successful, open a Pull Request from your feature branch to `main`.
2. **Artifact Sync**: *Crucial step.* Ensure you have run `/sync-artifacts` to commit the AI logbook updates (`master-walkthrough.md`, etc.) to your branch *before* opening the PR.
3. **Automated E2E Tests**: Opening a PR triggers the Playwright E2E smoke tests in GitHub Actions.
   * The tests run against an isolated staging container.
   * You must have a green checkmark (passing tests) before proceeding.

## 5. Release & Deployment (Merge to `main`)

**Goal**: Ship to Production.

1. **Generate Release Notes**: Before merging, ask the AI to generate a clean end-user summary of the changes. 
   * *Example prompt*: `"Generate a user-facing release summary for Issue #237 based on our work. Format it consistently with our previous semver release notes."*
2. **Squash and Merge**: Merge the PR into `main`.
3. **What happens under the hood?**
   * Pushing to `main` triggers the production Docker build.
   * The image is tagged with `latest` and a specific SHA.
   * (If you tag a release e.g., `v1.6.1`, it will tag the Docker image with that explicit semver version).
4. **Deploy**: Update the production server to pull the new specific semver tag (as per the "No Latest Tag in Production" rule) and restart the containers.
