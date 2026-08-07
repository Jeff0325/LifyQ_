# 21 — Monetization Strategy

## 1. Model: Freemium Subscription

LifyQ monetizes via a **freemium subscription model** — a genuinely useful free tier that establishes daily-use habit and demonstrates the cross-domain value proposition, with a paid Premium tier unlocking the depth and breadth that make LifyQ a full app-stack replacement. This model is chosen over one-time-purchase (doesn't fund continuous AI inference cost or ongoing development), pure ad-supported (incompatible with a trustworthy-custodian-of-personal-data brand position, per [09_Brand_Guidelines.md](09_Brand_Guidelines.md)), and hard paywall/no-free-tier (too much friction for the target audience's evaluate-before-committing behavior, per [03_Target_Audience.md](03_Target_Audience.md)).

## 2. Tier Definition (directional — see §6 on numbers)

### Free Tier
- Full access to: Tasks, Goals, Habits, Calendar, Notes (the MVP core-loop domains)
- AI Assistant: limited daily queries (e.g., 10/day)
- Reasonable-but-real limits that don't cripple the core experience: e.g., up to 3 active Goals, unlimited Tasks/Habits/Notes — limits are placed on the dimensions that scale with product cost (AI queries) or that create natural upgrade motivation (Goals, since a highly organized/ambitious user outgrows 3 quickly) rather than on dimensions that would make the free product feel broken
- Single-device use; no cross-device Cloud Sync

### Premium Tier (subscription, monthly or annual with a discount for annual)
- Unlimited AI Assistant usage
- Unlimited Goals, and access to Phase 2–3 domains as they ship (Finance, Journal, Projects, Health, Documents, Analytics)
- Cross-device Cloud Sync
- Priority support
- Advanced Analytics and cross-domain insight views

### (Future consideration, not committed) Family/Team tier
Explicitly deferred — LifyQ is single-player by design per [01_Product_Vision.md](01_Product_Vision.md) §4; a shared/family tier would be a distinct, later product decision requiring its own data-model and permission-model work, not assumed in this architecture.

## 3. Why Finance/Health/Analytics Are Premium-Leaning

These are the domains with the highest perceived personal value and the domains competitors (YNAB, Apple Health, dedicated analytics tools) already charge for standalone — gating them behind Premium aligns price with willingness-to-pay while keeping the free tier genuinely useful for the core organizational loop (Maya, Daniel, and Priya's day-to-day driver, per [04_User_Personas.md](04_User_Personas.md)).

## 4. UI Requirements in This Phase (mock/stub only)

Per [02_Product_Requirements_Document.md](02_Product_Requirements_Document.md) §3.11, this phase builds the **visual and interaction layer** of monetization without real enforcement:

- A `useEntitlements()`-shaped mock hook returns a static mock plan (`'free'` | `'premium'`), toggleable in Settings → Subscription for demo/testing purposes, standing in for the real entitlement check Phase 5 will wire to Stripe subscription status.
- Locked-feature UI states (per [05_User_Journeys.md](05_User_Journeys.md) Journey E and [09_Brand_Guidelines.md](09_Brand_Guidelines.md) §3): clear, non-punitive, always explains the value and the path to upgrade, never a dead-end disabled control.
- A static Pricing/Upgrade screen exists in Settings, presenting tier comparison — content is real (actual planned pricing/features), interaction (the "Upgrade" button) is inert/mocked in this phase with a clear "Coming soon" or demo-mode affordance rather than a broken checkout flow.

## 5. Committed Future Architecture (Phase 5)

- **Stripe Billing** for subscription management (checkout, plan changes, cancellation) and the **Stripe Customer Portal** for self-service billing management — avoids building custom billing UI/logic for a solved problem.
- Subscription status syncs to LifyQ's database via Stripe webhooks (source of truth for entitlement, never trusted from client state alone) — see [17_Security_Plan.md](17_Security_Plan.md) §5.
- Free-tier limits (§2) become server-enforced (via Supabase RLS/Edge Function checks) at the same time real persistence lands (Phase 4), not deferred further — meaning the UI-level limit messaging built in this phase is validated against real enforcement almost immediately after backend integration, minimizing drift risk.

## 6. Numbers Are Placeholders

Specific limits (query counts, Goal counts) and price points are intentionally directional in this document. They should be finalized closer to Phase 5 using real AI-inference cost data (once a model/provider is chosen) and competitive pricing research at that time — treating them as fixed now would be premature given zero usage data exists yet. This is flagged as an explicit open item in the founder review (see final implementation roadmap document).
