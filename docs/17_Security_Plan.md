# 17 — Security Plan

## 1. Phase-Appropriate Scope

There is no backend, database, authentication, or payment processing in this phase, so there is no server attack surface to secure yet. This document covers (a) the hygiene practices that apply even to a static, mock-data frontend, and (b) the security architecture LifyQ commits to for the phases where real risk begins, so that decisions made now (data shapes, auth touchpoints, third-party choices) don't foreclose the right security posture later.

## 2. This Phase: Frontend Security Hygiene

- **No secrets in the repository.** Even though there's no real API key yet, `.env` files are gitignored from day one, `.env.example` documents required variables with placeholder values, and CI includes a secret-scanning step (e.g., gitleaks) so the habit is established before any real secret ever exists.
- **XSS prevention.** React's default JSX escaping is relied upon; `dangerouslySetInnerHTML` is disallowed by lint rule except in one explicitly reviewed location (the rich-text Note renderer), which sanitizes content through a vetted library (e.g., DOMPurify) even though content is currently self-authored and mock-persisted — this is the exact code path that will accept real user/AI-generated content later, so it is hardened now.
- **Dependency hygiene.** `pnpm audit` / Dependabot (or Renovate) runs in CI; no dependency is added without a quick provenance check (maintenance activity, download counts) given the supply-chain risk of npm packages.
- **Local-storage discipline.** Only non-sensitive, UI-preference-shaped data (theme, onboarding flag, mock entity data the user themselves entered) is ever written to `localStorage`. This is a forward-looking rule: it prevents the habit of treating `localStorage` as a general-purpose store, which would be actively wrong once real tokens/session data exist (see §4).
- **Content Security Policy.** A baseline CSP is configured at the Vercel edge/headers level even in this phase (default-src 'self', restricting inline scripts, no unexpected third-party origins), both as good practice and so the policy doesn't need to be invented under pressure once real third-party calls (Supabase, Stripe, an LLM API) are added — it is extended, not created from scratch, at that point.
- **Clickjacking / basic headers.** `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` set via Vercel headers config now.

## 3. Committed Future Architecture: Authentication (Phase 4)

- **Supabase Auth**, supporting email/password, magic link, and OAuth (Google at minimum, given the target audience's likely provider) — chosen because it is the given backend and avoids running a second, separate identity system.
- **Session tokens stored via httpOnly, secure, sameSite cookies** where Supabase's client patterns allow it, rather than raw `localStorage` token storage, to reduce XSS-driven session theft risk. Where Supabase's SPA client defaults to browser storage, the risk is mitigated by the XSS-hardening practices in §2 being already in place by that point, not introduced reactively.
- **AuthLayout** (already scaffolded per [15_Routing_Strategy.md](15_Routing_Strategy.md) §5) becomes the single enforcement point for session checks — no ad-hoc auth checks scattered through feature code.

## 4. Committed Future Architecture: Data Isolation (Phase 4)

- **Row-Level Security (RLS)** enabled on every Supabase/Postgres table from the first migration, policy: a row is readable/writable only when `auth.uid() = user_id` — matching the `userId` field already present on every entity in [16_Data_Model_Plan.md](16_Data_Model_Plan.md) §2, meaning no data-model rework is needed to support isolation, only policy definition.
- **No service-role key ever ships to the client.** All privileged operations (if any are ever needed) go through Supabase Edge Functions, never embedded in frontend code.

## 5. Committed Future Architecture: Payments (Phase 5)

- **Stripe Billing + Customer Portal.** LifyQ never collects, transmits, or stores raw card data — Stripe Checkout/Elements handles all PCI-scoped data entry, keeping LifyQ's own PCI compliance burden minimal (SAQ A). Subscription status is synced into LifyQ's database via Stripe webhooks, verified with the webhook signing secret, never trusted from client-side state alone (preventing a client from spoofing "premium" status).

## 6. Committed Future Architecture: AI Assistant (Phase 5)

- Real LLM API calls are proxied through a server-side function (Supabase Edge Function or equivalent), never called directly from the browser with an embedded API key. User-provided content sent to the model is scoped to what's necessary for the request; the assistant's data access respects the same RLS-backed user isolation as every other domain.

## 7. Privacy Posture (applies now, at the level of intent)

- The Settings → Data & Privacy panel scaffolded in this phase (per [02_Product_Requirements_Document.md](02_Product_Requirements_Document.md) §3.8) exists specifically to establish, from day one, that users will have visible control over their data (export, delete) once those are real operations — the UI commitment is made before the backend exists, not bolted on after.
- Given the sensitivity of domains like Finance, Health, and Journal, LifyQ commits to **never using user content to train models** without explicit, separate opt-in, and to encrypting sensitive fields at rest once a real database exists (Supabase supports column-level encryption via `pgsodium` for fields like financial account details if/when linked-account features are ever considered — currently out of scope).

## 8. Security Review Cadence (once real systems exist)

A lightweight security review (dependency audit, RLS policy review, auth flow review) is a required gate before each of Phase 4 (auth/data) and Phase 5 (payments/AI) ships, not an annual afterthought — flagged here so it is planned, not forgotten, in [23_Development_Roadmap.md](23_Development_Roadmap.md).
