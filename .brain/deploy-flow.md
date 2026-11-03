# Deploy Flow (User's "Deploy" Command)

When user says "deploy" or uses a ship trigger:

1. **sacred-fire-songs (SFS):** Create PR, merge to `main`
2. **<parent-project> (SR):** Point `.gitmodules` `engine` submodule to `main` branch, update the submodule commit, create PR, merge to `main`
3. **Close** the issue with a comment linking the PR
4. **Cleanup:** Delete feature branches from both repos (local + remote)
