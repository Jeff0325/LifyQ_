# 03 — Target Audience

## 1. Market Framing

LifyQ sits at the intersection of three existing markets: personal productivity software (Todoist, Things, TickTick), all-in-one workspace tools (Notion), and personal finance/wellness apps (YNAB, Fabulous, Streaks). It does not compete head-on with any single one — it competes with the *combination* a power user has already assembled, by replacing five to eight single-purpose apps with one coherent system.

## 2. Primary Audience

**"Digitally-organized professionals and knowledge workers, 24–45, who already pay for productivity software and are actively trying to reduce app sprawl.**

Characteristics:
- Already uses at least 2–3 productivity/organization apps (a task manager, a notes app, possibly a budgeting or habit app)
- Comfortable with — and drawn to — premium, design-forward software; will pay more for a tool that feels considered
- Values systems and structure but doesn't want to become a "productivity hobbyist" (i.e., not the Notion-template-builder power user who enjoys configuring software as a pastime)
- Has disposable income for a $10–20/month subscription and already pays for at least one other SaaS tool personally (Spotify, ChatGPT Plus, Notion, iCloud+, etc.)
- Primarily mobile-first in daily touchpoints (checking tasks, logging habits) but does deeper planning work on desktop/web

## 3. Secondary Audiences

- **Life-optimization / self-improvement enthusiasts** who currently use separate habit trackers, journals, and goal apps and want them unified.
- **Neurodivergent users (ADHD in particular)** for whom a single low-friction capture point and calendar-centric view of obligations is disproportionately valuable. This audience should quietly inform UX decisions (low friction capture, minimal required fields, strong defaults) without the product being marketed as a clinical or accessibility-specific tool.
- **Early-career professionals** building adult-life systems for the first time (budgeting, goal-setting) who want guardrails without complexity.

## 4. Explicitly Not the Initial Target

- **Enterprise/team buyers.** No procurement motion, no admin/IT requirements, no SSO expectations in this phase.
- **Power-user tinkerers** who want infinite customization, plugins, or API access (Notion/Obsidian's audience). LifyQ's value proposition is coherence and opinionated defaults, not configurability.
- **Users seeking a free, ad-supported product.** LifyQ's quality bar and AI costs require a paid model from day one of monetization; the audience must be willing to pay.

## 5. Why This Audience Validates the Design Direction

The "premium, Apple/Linear/Notion-grade" design mandate in the founding brief is not an aesthetic preference in isolation — it is the audience-fit decision. This audience already lives inside beautifully designed software daily and treats visual/interaction quality as a signal of trustworthiness and longevity, especially for something as personal as their tasks, goals, finances, and journal. A mediocre-looking life-management app reads as a risk (will this company still exist in two years? will my data be safe?) regardless of feature completeness.

## 6. Platform Implications

- **Mobile-first, but not mobile-only.** This audience plans on larger screens (desktop/tablet) and captures/checks on the phone throughout the day. Both experiences must be first-class; see [20_Responsive_Design_Guidelines.md](20_Responsive_Design_Guidelines.md).
- **Cross-device continuity is a baseline expectation**, not a differentiator — hence Cloud Sync is a core pillar even though it is UI-stubbed in this phase (see [21_Monetization_Strategy.md](21_Monetization_Strategy.md)).
- **Dark mode is a first-class expectation**, not an afterthought, for this demographic and this design language.

Personas derived from this audience are detailed in [04_User_Personas.md](04_User_Personas.md); their concrete flows are in [05_User_Journeys.md](05_User_Journeys.md).
