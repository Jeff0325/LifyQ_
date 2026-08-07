# 22 — MVP Definition

## 1. What "MVP" Means in This Context

Because this engagement builds frontend-only, mock-data software, "MVP" here means: **the smallest set of domains that, built to full production-quality polish, demonstrably prove the core product thesis** — that unifying life domains into one coherent, AI-aware system is more valuable than the sum of separate best-in-class point solutions. It is not "the smallest set of features that technically works"; polish is not cut to hit MVP faster (per [01_Product_Vision.md](01_Product_Vision.md) §6, this is the permanent UI layer, not a throwaway prototype).

## 2. MVP Domain Set

1. **Dashboard / Home** — the unifying surface; proves cross-domain synthesis
2. **AI Assistant** — the differentiator; proves the AI-first thesis even on mock/scripted responses
3. **Tasks** — the baseline expectation of any productivity tool; table stakes
4. **Goals** — the "why" layer that differentiates LifyQ from a plain to-do app
5. **Habits** — the consistency/behavior-change layer
6. **Calendar** — the time-unification layer, pulling Tasks/Habits into one temporal view
7. **Notes** — the capture/reference layer
8. **Onboarding** — the first-impression flow (per [05_User_Journeys.md](05_User_Journeys.md) Journey A)
9. **Settings** (Profile, Appearance, Notification prefs, Subscription stub, Data & Privacy) — the trust/control layer

## 3. Why Finance and Health Are Excluded from MVP

This is a deliberate deviation-consideration flagged for founder awareness, not an oversight:

- **Data sensitivity and correctness bar is higher.** Getting a Task list "pretty good" is acceptable for a v1; getting Finance or Health data *shapes* wrong (e.g., a budget model that doesn't match how the eventual real bank-sync integration will need to work) is costlier to unwind later, and both benefit from more dedicated design research than the current phase's timeline allows.
- **They are not required to prove the core thesis.** The plan → act → reflect loop (Goals → Tasks/Habits → Calendar → Notes, synthesized on the Dashboard) is fully demonstrable without them. Adding them to MVP would increase build time without proportionally increasing validation of the central "unified life OS" idea.
- **They remain fully IA-planned** (routes, data shapes, and navigation slots reserved per [06_Information_Architecture.md](06_Information_Architecture.md), [16_Data_Model_Plan.md](16_Data_Model_Plan.md)) so adding them in Phase 2/3 is additive, not disruptive.

**If the founder disagrees** and considers Finance or Health non-negotiable for the initial demoable product, the recommendation is to add **at most one** of the two (Finance is the more universally-relevant of the two for this audience) rather than both, to protect the polish bar — flagged explicitly as an open decision in the final implementation roadmap.

## 4. MVP Acceptance Criteria

The MVP is complete when, for every domain in §2:

- Full responsive implementation across the breakpoint/device matrix in [20_Responsive_Design_Guidelines.md](20_Responsive_Design_Guidelines.md) §8
- All component states designed and built: loading, empty, populated, error (per [11_Component_Library.md](11_Component_Library.md) §6)
- Light and dark theme parity
- All journeys in [05_User_Journeys.md](05_User_Journeys.md) are executable end-to-end on mock data
- Lighthouse and accessibility targets met ([18_Performance_Strategy.md](18_Performance_Strategy.md), [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md))
- Built against the repository-pattern data layer, not inline/hardcoded data (per [13_Technical_Architecture.md](13_Technical_Architecture.md)) — non-negotiable, since this is what preserves the "no rewrite later" guarantee
- Automated test coverage per [25_Testing_Strategy.md](25_Testing_Strategy.md) for critical logic and golden-path flows

## 5. MVP Is Not a Separate Codebase or Branch Strategy

The MVP domain set is simply "Phase 1" of the single ongoing codebase (see [07_Feature_Roadmap.md](07_Feature_Roadmap.md), [23_Development_Roadmap.md](23_Development_Roadmap.md)) — there is no throwaway MVP build that gets replaced later. Every architectural decision in this document set is made specifically so that Phase 2/3 domains are additive extensions of the exact same patterns established at MVP.
