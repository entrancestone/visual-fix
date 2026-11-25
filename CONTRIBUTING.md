# Contributing

Thanks for wanting to contribute.
One rule up front:

**Human-authored pull requests targeting `main` must be raised through [`pr-guardian`](https://github.com/entrancestone/pr-guardian).**
We require this to reduce the maintainer's burden of reviewing and merging contributions.

`pr-guardian` puts a local git proxy in front of your real remote.
Pushing through it runs an AI-driven review/test/lint pipeline in an isolated worktree, forwards the push upstream only after every check passes, and opens a clean PR automatically.

A GitHub Actions check (`Require pr-guardian`) runs on PRs targeting `main` and fails if the body is missing the deterministic signature that pr-guardian writes.
It also requires the machine-readable pipeline attestation that pr-guardian writes next to that signature: the `review`, `test`, and `document` steps must all be recorded as `completed`, and the attested `head_sha` must be the PR's current head.
The check runs on opened, edited, synchronize, and reopened, including pushed commits. That is safe because pr-guardian writes the attestation before it pushes, so a pipeline-pushed head already has a matching body; a commit pushed outside the pipeline still fails until you `git push pr-guardian` again so the body carries an attestation for the new head.
The release and dependency bots are exempt so their automation keeps working, but regular contributor PRs without the signature and a current attestation will not be reviewed or merged.

`.github/workflows/pr-guardian-required.yml` is a thin caller of the shared `entrancestone/pr-guardian` composite action, pinned to an immutable commit SHA and never `@main`.
Enforcement logic and its tests live upstream. Change them there, and bump this repo's pin in a deliberate separate PR.
This repo still owns its `on:`, `paths-ignore`, `concurrency`, `permissions`, job name, and author-exemption `if:`.

## Workflow

Workflow requires `pr-guardian`.
Earlier versions can route pushes to a fork, but they do not write the pipeline attestation required by this repository's PR gate.

1. Fork the repo, then clone the parent repo or set your local `origin` back to the parent repo (`git@github.com:entrancestone/visual-fix.git`).
2. Create a branch and make your changes.
3. Initialize or refresh the gate with your fork as the push target: `pr-guardian init --fork-url git@github.com:<you>/visual-fix.git`.
4. Commit your changes.
5. Push through the gate instead of pushing to `origin`:

   ```sh
   git push pr-guardian
   ```

6. Run `pr-guardian` to attach to the pipeline, watch findings, and auto-fix or review as needed.
7. Once the pipeline passes, it pushes the branch to your fork and opens the PR against this parent repo for you.

See the [pr-guardian quick start](https://github.com/entrancestone/pr-guardian#readme) for the full first-run walkthrough.

## Repo Conventions

- Node 22+, ESM-only JavaScript, and TypeScript `checkJs` validation.
- Run `pnpm run check` before pushing.
- Do not reformat repo-provided `.agents/` skill content; `.prettierignore` excludes it intentionally.
- Do not hand-edit `CHANGELOG.md` or `.release-please-manifest.json`.
- This fork has no telemetry. Do not add analytics or any remote usage reporting.

## Questions

Open an issue.
