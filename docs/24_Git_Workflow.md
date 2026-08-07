# 24 — Git Workflow

## 1. Branching Model: Trunk-Based, Short-Lived Feature Branches

**Trunk-based development** off a single protected `main` branch, with short-lived feature branches (target: merged within 1–3 days), rather than GitFlow-style long-lived `develop`/`release` branches. This is chosen because: there is no need for parallel release trains at this stage (one product, one deployable, continuous deployment via Vercel preview→production), and long-lived branches accumulate merge conflicts and drift that actively hurt a fast-moving early-stage build — trunk-based keeps everyone integrating against near-current code constantly.

## 2. Branch Naming

```
feat/<short-description>      — new functionality (e.g., feat/habit-streak-heatmap)
fix/<short-description>       — bug fixes
chore/<short-description>     — tooling, deps, config, non-feature housekeeping
docs/<short-description>      — documentation-only changes
refactor/<short-description>  — internal restructuring with no behavior change
```

## 3. Commit Convention: Conventional Commits

```
<type>(<scope>): <short summary>

[optional body]
```
Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`. Scope is typically the feature/domain (`feat(tasks): add board view drag-reorder`). This is adopted because it produces a readable history, enables automated changelog generation later, and cleanly maps to semantic-version bumping if/when the project adopts release versioning (e.g., via Changesets) post-MVP.

## 4. Pull Request Requirements

Every PR, regardless of size, requires:
- Passing CI (typecheck, lint, unit/component tests, build, bundle-size check)
- A Vercel preview deployment link (automatic) — reviewed visually, not just via code diff, given the design-quality bar of this project
- At least one review approval — from another engineer if the team has one; from a self-review checklist pass (explicitly re-reading the diff against the [23_Development_Roadmap.md](23_Development_Roadmap.md) Definition of Done) if working solo, so the discipline exists regardless of team size
- No direct pushes to `main` — enforced via branch protection

## 5. PR Checklist Template

```
- [ ] Matches design tokens (no hardcoded colors/spacing) — 08_Design_System.md
- [ ] All component states implemented (loading/empty/populated/error) — 11_Component_Library.md §6
- [ ] Verified at mobile, tablet, and desktop breakpoints — 20_Responsive_Design_Guidelines.md
- [ ] Verified in both light and dark theme
- [ ] Keyboard-operable; accessible names present; axe check passing — 19_Accessibility_Guidelines.md
- [ ] Built against repository pattern, not inline mock data — 13_Technical_Architecture.md
- [ ] Tests added/updated per 25_Testing_Strategy.md
- [ ] No cross-feature deep imports (only via feature index.ts) — 12_Folder_Architecture.md
```

## 6. Merge Strategy

**Squash merge** into `main` for all feature branches — keeps `main`'s history one commit per logical change (matching the PR's conventional-commit title), avoiding noisy in-progress commit history while still preserving the granular history on the source branch until merge.

## 7. Release & Deployment

- `main` deploys automatically to production via Vercel on every merge (continuous deployment) — appropriate given no backend/data-migration risk exists yet in this phase; this policy is revisited once Phase 4 (real backend/auth) introduces migration risk, at which point a manual promotion step or feature-flag gating (see §9) is added before production deploy.
- Every open PR gets an automatic, shareable Vercel preview deployment — used for design review before merge, not just CI verification.

## 8. Protected Branch Rules

`main` requires: passing CI, at least one approval, up-to-date branch before merge (no merging stale branches), no force-push, no direct commits.

## 9. Feature Flags (introduced when needed, not preemptively)

Not required at MVP scope (all MVP domains ship together per [23_Development_Roadmap.md](23_Development_Roadmap.md)), but the config module described in [13_Technical_Architecture.md](13_Technical_Architecture.md) §9 is the designated home for simple boolean flags if a domain ever needs to be merged to `main` before being publicly visible (e.g., soft-launching a Phase 2 domain to a subset of sessions) — avoids introducing a third-party flag service prematurely.

## 10. Versioning

No semantic versioning / tagged releases are required during the frontend-only phase (continuous deployment makes "a version" a less meaningful concept than "what's live on `main`"). Tagged releases are introduced starting Phase 4, once backend/migration coordination makes "what version is this environment running" a meaningful operational question.
