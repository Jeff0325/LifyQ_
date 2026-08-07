# 36 — UX Philosophy

This document states the interaction principles the AI-first repositioning ([01_Product_Vision.md](01_Product_Vision.md) §7) imposes on every screen in LifyQ, not just Jarvis's own chat surface. [08_Design_System.md](08_Design_System.md) and [09_Brand_Guidelines.md](09_Brand_Guidelines.md) remain the visual-language authority (color, type, motion, tone of voice); this document is about *interaction defaults* — what the first, easiest path through any task should be.

## 1. Jarvis-Primary, Modules as Destinations

**Modules are not the primary experience — Jarvis is.** Tasks, Bills, Health, Calendar, and every other pillar are destinations structured data lives in and can be browsed, filtered, and bulk-edited from — not the place a user is steered to first. The default entry point for getting something into LifyQ, or asking anything about it, is talking to Jarvis. This is a stronger claim than "conversation is offered alongside forms" — it means Jarvis, not a module grid, is what a returning user reaches first ([37_Dashboard_Design_Philosophy.md](37_Dashboard_Design_Philosophy.md)'s Home/Jarvis convergence), and every module's own entry point is reached *from* Jarvis or navigation, not the reverse.

This does not mean forms are removed or demoted to hard-to-find. Every domain's "New Task" / "New Bill" / "New Reminder" dialog stays exactly as built (docs/30–33), fully functional, and remains the fastest path for a power user who already knows exactly what they want and would rather type into fields than talk. What changes is **which one a user meets by default**:

- A collection screen's explicit "New X" action is unchanged — still there, still one tap away, for precision or batch entry.
- The primary way most users reach that data, most of the time, is Jarvis understanding what they said and routing it — they never had to know a "New X" button existed.
- A module is never *hidden* — a user who exclusively uses manual forms still has a complete, unchanged product, and every domain is still fully reachable via navigation (docs/06 §2–3). What's removed is the *assumption* that navigating to a module is the normal way in.

**The confirmation screen (docs/35 §7) is where these two paths converge** — it *is* a form, pre-filled by ICE instead of started blank. This is deliberate: LifyQ does not need two different editing UIs, one for "AI-assisted" and one for "manual." There is one editing UI per domain; ICE is simply the default way to arrive at it, pre-filled, with the manual "New X" button as the always-available alternative route to the same form.

## 2. Progressive Disclosure, Generalized

Progressive disclosure was previously scoped narrowly to empty states and onboarding ([05_User_Journeys.md](05_User_Journeys.md) Journey F). It now generalizes to two more surfaces:

- **The confirmation screen** ([35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) §7) shows the fields ICE was confident about first; low-confidence or optional fields are present but visually secondary, not hidden — the user isn't asked to review ten fields to confirm a task title and due date.
- **The Dashboard** ([37_Dashboard_Design_Philosophy.md](37_Dashboard_Design_Philosophy.md)) shows only what's urgent or time-relevant *right now* by default; the full module-by-module breakdown that used to be the Dashboard's primary content is still there, one level down, not deleted.

The underlying rule: **show the smallest correct answer first, make "more" one predictable action away.** Never force a user to scan past information that isn't relevant to the current moment to find what is.

## 3. Never Auto-Save — a UX Law, Not Just an AI Rule

[34_AI_Architecture.md](34_AI_Architecture.md) §2 states this architecturally (no mutation call exists until confirmation). At the UX level, the consequence is a consistent, learnable pattern across the entire app: **nothing the user didn't explicitly confirm is ever written.** This was already true of every existing manual form (a dialog's Cancel button discards cleanly, per [11_Component_Library.md](11_Component_Library.md)'s `ResponsiveFormSheet`); ICE extends the identical guarantee to AI-originated data, so a user never has to wonder "did Jarvis already save that, or do I still need to confirm it?" The answer is always the same: if it isn't on a confirmation screen you actively dismissed with Save, it isn't saved.

## 4. Trust Through Transparency, Not Magic

Every ICE proposal states, in plain language, what it understood and where it's going ("Jarvis understood this as a bill, due the 15th of every month" — docs/35 §7) before asking for confirmation. The same rule governs the *read* side: when Jarvis answers a question by reasoning across more than one domain, it briefly states which domains it drew from before giving the answer ("Checking your medicines against your upcoming appointments — ..." — [38_Context_Engine.md](38_Context_Engine.md) §5), rather than presenting a synthesized answer as if it simply, invisibly knew it. LifyQ does not present AI output — written or reasoned — as unquestionably correct; the product earns trust by showing its work at exactly the moment the user has the power to correct it, not by hiding the reasoning and hoping it's right. This is consistent with the brand's existing "calm, not clever" tone ([09_Brand_Guidelines.md](09_Brand_Guidelines.md)) — confidence expressed plainly, never overclaimed, and a stated "I don't know" (docs/38 §6) preferred over a confident guess.

## 5. Jarvis Is a Companion, Not a Destination Page

**Added by docs/39 addendum.** §1 established Jarvis-primacy in principle; the floating-companion pattern is what makes it literal. Jarvis is never a page the user navigates *to* and then *away from* — it's a persistent, minimizable presence (a small chat-head bubble) that survives every navigation, expandable from the same distinctive button no matter what screen is currently open. Minimizing is not closing: the conversation is exactly where it was when reopened, even after visiting three other domains in between. This replaces an earlier "docked panel + dedicated full page" plan (docs/10 §4) before either shipped — a page-based Jarvis would have meant leaving whatever the user was doing to "go talk to Jarvis"; the floating companion means Jarvis is present *alongside* whatever the user is doing instead.

## 6. What Does Not Change

- **Visual design language** — tokens, motion, empty/loading/error states, and the existing `ResponsiveFormSheet`/`Card`/`StatTile` component vocabulary are reused, not reinvented, for every ICE-related surface (docs/34 §3, docs/35 §7).
- **Every existing domain's manual CRUD flows** — unchanged, unshipped-around, and still the ground truth for "what does a Task look like."
- **Accessibility posture** — the confirmation screen and Jarvis's conversation surface meet the same WCAG 2.1 AA bar as every other screen ([19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md)); voice input in particular must have a fully-equivalent typed-text path, never voice-only.
