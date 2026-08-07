# 09 — Brand Guidelines

## 1. Brand Essence

**Name:** LifyQ
**Tagline:** "Your life, intelligently organized."
**One-line positioning:** The personal operating system that replaces the app-sprawl of tasks, goals, habits, calendar, finance, and more with one considered, AI-aware system.

## 2. Brand Personality

| We are | We are not |
|---|---|
| Calm, considered | Loud, gamified |
| Intelligent, quietly capable | Gimmicky "AI-everywhere" |
| Premium, refined | Ornate, maximalist |
| Warm, human | Clinical, corporate |
| Trustworthy custodian of personal data | Casual about privacy |
| Confident, understated | Shouty, sales-y |

The closest personality analogue is the intersection of Apple (restraint, craft), Linear (speed, precision), and a warm human layer neither of those two fully has — because LifyQ holds emotionally weighty data (goals, journal, finances) that pure productivity tools don't.

## 3. Voice & Tone

- **Voice traits:** Clear, warm, direct, never cutesy, never corporate-jargon. Second person ("your day," "you completed"), never "the user."
- **Tone shifts by context**, voice does not:
  - *Onboarding:* Welcoming, brief, confident — no lengthy explanations.
  - *Empty states:* Encouraging, action-oriented, one sentence of context max.
  - *Errors:* Calm, specific, never blame the user, always state the next step.
  - *Celebrations (streak, goal complete):* Warm and genuine, brief — a single well-placed moment, not an interruption.
  - *Paywall/upgrade moments:* Honest and transparent about value, never guilt-based ("Don't lose your progress!" is disallowed; "Unlock unlimited projects" is preferred).
- **Writing rules:** Sentence case for all UI text (not Title Case), oxford commas, no exclamation points except in genuine celebratory micro-copy (streaks/milestones), numerals for all numbers in UI (not spelled out).

## 4. Logo & Mark (direction, for future design execution)

- **Concept direction:** An abstract geometric mark, not a literal object (no checkmarks-in-a-box, no literal calendar icon) — reinforcing "operating system" over "to-do app." Direction: a mark built from the same rounded-corner geometry as the design system's radius scale, so the logo and the UI feel like they were drawn by the same hand.
- **Wordmark:** "LifyQ" set in a slightly customized/tightened Inter (or a geometric companion display face if budget allows), medium-bold weight, the "Q" treated as the mark's opportunity for a distinguishing detail (a subtlety, not a gimmick).
- **Do not:** stretch, recolor outside the approved palette, place on low-contrast backgrounds, or add drop shadows/bevels to the logo.
- **This phase's scope:** A placeholder wordmark-only logo (styled text lockup using brand tokens) is sufficient for the frontend build; commissioning a final mark is a parallel, non-blocking workstream.

## 5. Color Usage in Brand Contexts

Marketing/brand surfaces (landing/onboarding) may use the full brand-indigo-to-accent-coral gradient as a hero moment (see §2.5 glass/gradient policy in [08_Design_System.md](08_Design_System.md)); in-product UI restricts gradients to rare, intentional moments (premium upsell surfaces, onboarding, achievement celebrations) — never as default background treatment across ordinary screens, to preserve the "calm by default" principle.

## 6. Imagery & Illustration Style

No stock photography of people. All illustrative content is the line-based, brand-toned illustration system defined in [08_Design_System.md](08_Design_System.md) §9. This keeps the brand consistent, avoids the generic-SaaS-stock-photo trap, and scales cheaply across many empty states without commissioning photography.

## 7. Naming Conventions Within Product

- Domain names are always capitalized as proper nouns in UI when referring to the section itself ("Open Goals"), lowercase when used generically in copy ("set a new goal").
- Consistent verb choices per action across the whole product: **Create**, not "Add" in some places and "New" in others (exception: the universal capture action is always labeled **Quick Add**, a fixed proper term). **Complete**, not "Finish" or "Done" as a verb (the status itself may display as "Done"). **Delete**, not "Remove," for destructive removal; "Remove" is reserved for non-destructive unlinking (e.g., removing a Task from a Project without deleting the Task).

## 8. Brand Application Checklist (for every new screen)

1. Does it use only design-system tokens (colors, type, spacing, radius, motion) — no one-off values?
2. Does the copy follow voice/tone rules in §3?
3. If it's an empty/error/celebration state, does it follow the tone-shift guidance?
4. Does it work in both light and dark themes?
5. Would this screen look at home next to Linear, Notion, or Arc — or does it read as a generic admin dashboard? If the latter, it is not ready to ship.
