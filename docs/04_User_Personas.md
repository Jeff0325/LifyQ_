# 04 — User Personas

Three personas drive design and prioritization decisions throughout this document set. Each is referenced by name in [05_User_Journeys.md](05_User_Journeys.md) and in feature trade-off discussions elsewhere.

---

## Persona 1: Maya Chen — "The Consolidator"

- **Age:** 29 · **Role:** Senior Product Designer at a mid-size tech company · **Location:** Austin, TX

**Context:** Maya currently uses Things 3 for tasks, Notion for notes and project docs, a separate habit tracker app, and Apple Calendar. She's tried and abandoned two other "all-in-one" apps because they felt cluttered or looked dated. She pays for software without hesitation when it's good.

**Goals:**
- Replace her 4-app stack with one tool without losing capability in any single area
- Feel a sense of calm/control at a glance, not another inbox to manage
- Track progress on longer-term goals (career, a half-marathon) alongside daily tasks

**Frustrations:**
- Existing all-in-one tools ask her to build her own system (Notion) instead of giving her one
- Most task apps look "fine" but not considered — she notices bad spacing, inconsistent icons, janky animations
- Switching between four apps means re-entering context constantly

**How LifyQ wins her:** A single, gorgeous surface that already knows how tasks, goals, habits, and calendar relate to each other, with zero setup required to feel organized on day one.

**Design implication:** Opinionated, pre-structured domains (not a blank canvas); exceptional visual polish is a conversion requirement, not a nice-to-have; fast cross-domain navigation.

---

## Persona 2: Daniel Osei — "The Builder in Progress"

- **Age:** 34 · **Role:** Freelance software contractor · **Location:** Toronto, ON

**Context:** Daniel has ADHD and has cycled through more productivity apps than he can count. He does best with low-friction capture (get it out of his head fast) and strong defaults. He's rebuilding his financial habits after an inconsistent freelance income period and wants his tasks, calendar, and money to feel like one picture instead of three sources of anxiety.

**Goals:**
- Capture a task or thought in under five seconds from anywhere
- See "what matters today" without having to build the view himself
- Eventually bring finance tracking into the same place he manages tasks, so money stops being a separate, dreaded mental category

**Frustrations:**
- Apps that require heavy setup lose him before he gets value
- Too many choices/fields on a simple "add task" flow causes him to abandon the action entirely
- Notification overload from apps that don't respect his attention

**How LifyQ wins him:** Quick-add is always one tap away; the Dashboard synthesizes "today" for him; the AI Assistant can offload planning decisions he finds effortful.

**Design implication:** Minimal required fields on all creation flows, strong smart defaults, prominent low-friction capture (FAB, command palette, quick-add), notification settings that default to calm.

---

## Persona 3: Priya Sharma — "The Systems Optimizer"

- **Age:** 38 · **Role:** Marketing Director, two kids · **Location:** London, UK

**Context:** Priya runs a tight schedule across work and family. She already uses Apple Health, a budgeting app, and a shared family calendar. She's less interested in a beautiful interface for its own sake and more interested in a system that reliably surfaces what needs her attention without her having to check five apps every morning. She evaluates new tools skeptically and churns fast if a tool doesn't prove its value in the first week.

**Goals:**
- One morning check-in that tells her what matters today across work, health, and home
- Reliable calendar and reminder behavior — she cannot afford a tool that drops something
- Long-term: analytics that show her where her time and money actually go, not just where she planned for them to go

**Frustrations:**
- Tools that look impressive in a demo but feel unreliable in daily use
- Onboarding flows that take too long before showing value
- Notification fatigue from apps competing for attention

**How LifyQ wins her:** A trustworthy, fast Dashboard that becomes her single morning stop; onboarding that gets her to a personalized, populated view in under two minutes; consistent, dependable interaction patterns (nothing flashy that undermines trust).

**Design implication:** Onboarding must produce visible personalized value almost immediately (see [05_User_Journeys.md](05_User_Journeys.md)); reliability and consistency of interaction patterns take priority over novel UI experiments; analytics domain matters more to this persona than the other two — informs its priority in [07_Feature_Roadmap.md](07_Feature_Roadmap.md).

---

## Cross-Persona Design Principles

1. **Zero-to-value must be fast for all three** — none of them tolerates a long setup process, even though their reasons differ (Maya wants immediate polish, Daniel wants immediate low-friction capture, Priya wants immediate proof of reliability).
2. **The Dashboard is the single most important screen in the product** — it is the shared "morning stop" for all three personas.
3. **Design quality is a trust signal, not decoration**, most explicitly for Maya but present for all three given the personal, high-trust nature of the data (tasks, money, health, journal).
4. **Low-friction capture is universally required**, most acutely for Daniel — quick-add patterns are a first-class navigation element, not buried in a menu (see [10_Navigation_Architecture.md](10_Navigation_Architecture.md)).
