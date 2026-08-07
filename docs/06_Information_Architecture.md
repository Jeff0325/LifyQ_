# 06 — Information Architecture

## 1. Architectural Principle

LifyQ's information architecture is **entity-linked, not folder-based**. Every domain is a first-class collection of typed entities, and entities reference each other directly (a Task can belong to a Project which ladders to a Goal; a Calendar Event can be generated from a Task or a Habit reminder). The navigation system exposes domains as top-level destinations, but the data model underneath is a graph, not a hierarchy. This is what allows the product to feel unified rather than like fifteen bolted-together apps. Full entity relationships are defined in [16_Data_Model_Plan.md](16_Data_Model_Plan.md).

**Under the AI-first repositioning** ([01_Product_Vision.md](01_Product_Vision.md) §7), this graph is formally the **Relationship Graph** (§4) — what the Intelligent Capture Engine routes writes into (every node is a `CaptureDomain` in [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) §3) and what the **Context Engine** traverses to answer cross-domain reads ([38_Context_Engine.md](38_Context_Engine.md)). The sitemap below (§2) and navigation tiering (§3) are unchanged by this — every domain is still reached the same way when browsed directly, as a destination. What's added is a primary, conversational path to the same entity graph that doesn't require knowing which destination to open first (§5's Quick Add, redefined).

## 2. Top-Level Sitemap

```
LifyQ
├── Dashboard (Home)                         [MVP — redesign target: 37_Dashboard_Design_Philosophy.md]
├── Jarvis (AI Assistant)                     [MVP — conversational surface of ICE, see 34/35]
├── Tasks                                     [MVP]
│   └── Task Detail
├── Goals                                     [MVP]
│   └── Goal Detail
│       └── linked Projects / Tasks / Habits
├── Habits                                    [MVP]
│   └── Habit Detail (streak history)
├── Calendar                                  [MVP]
│   └── Event Detail
├── Notes                                     [MVP]
│   └── Note Editor
├── Projects                                  [Phase 2]
│   └── Project Detail (Kanban / list of Tasks)
├── Finance                                   [Phase 2]
│   ├── Overview
│   ├── Transactions
│   └── Budgets
├── Bills                                     [Phase 2]
│   └── Bill Detail (payment history)
├── Subscriptions                             [Phase 2]
│   └── Subscription Detail (billing history)
├── Life Records                              [Phase 2]
│   └── Record Detail (attached documents, expiration)
├── Documents                                 [Phase 2]
│   └── Document Viewer
├── Grocery Lists                             [Phase 2]
│   └── List Detail
├── Journal                                   [Phase 2]
│   └── Entry Detail
├── Reminders                                 [Phase 2]
├── Health                                    [Phase 3]
│   ├── Overview
│   ├── Medicines / Prescriptions
│   ├── Vaccinations / Doctor Visits
│   └── Vitals (blood pressure, weight)
├── Analytics                                 [Phase 3]
├── Notifications (Inbox)                     [Phase 4]
├── Settings
│   ├── Profile
│   ├── Appearance
│   ├── Notifications Preferences
│   ├── Subscription / Billing                [stub in MVP]
│   ├── Data & Privacy
│   └── Connected Devices / Sync               [stub in MVP]
```

Phase labels correspond to [07_Feature_Roadmap.md](07_Feature_Roadmap.md). **Documents moved from Phase 3 to Phase 2**: Life Records and Bills both need to attach a photo/file (per §3.13 of the PRD), so the shared storage/attachment module has to exist before the modules that depend on it, not after.

**Life Records, Bills, Subscriptions, Grocery Lists** are additions to the original IA, made to expand LifyQ from a productivity tool into a life-management platform (household administration alongside the existing plan/act/reflect loop). They follow the exact same three-level depth pattern (§6) and repository/types/schema/hooks/components shape as every other domain — no new architectural pattern was introduced for them.

## 3. Navigation Tiering

**Tier 1 — Primary domains (always reachable from main navigation):** Dashboard, Jarvis, Tasks, Goals, Habits, Calendar, Notes (MVP set), expanding to include Projects, Finance, Journal as they ship. Jarvis is Tier 1 by reachability, not by being a routed `NavItem` — per docs/39 addendum it's a distinctive, always-present button (BottomNav center / Sidebar row / TopBar trigger) that opens a floating companion, not a page you navigate to.

**Tier 2 — Secondary/contextual (reachable from Dashboard, Settings, or search, not primary nav):** Reminders, Documents, Health, Analytics, Notifications, Bills, Subscriptions, Life Records, Grocery Lists. These graduate to Tier 1 if usage data (post-launch) shows daily engagement comparable to Tier 1 domains — starting all four new administrative modules in Tier 2 avoids repeating the nav-crowding problem already solved once for Habits/Calendar/Profile/Notes (see [30_Core_Feature_Implementation.md](30_Core_Feature_Implementation.md) §3.3).

**Tier 3 — System (Settings and its children).**

Full navigation shell and responsive behavior in [10_Navigation_Architecture.md](10_Navigation_Architecture.md).

## 4. Cross-Domain Relationships — the Relationship Graph

This table is now a formal architectural concept, not just narrative documentation: it *is* the **Relationship Graph** [38_Context_Engine.md](38_Context_Engine.md) §1 specifies — the record of which domains relate to which, and how. Each row is marked **structural** (stored as an explicit reference, `EntityRef`-shaped) or **inferred** (never stored; computed at query time by the Context Engine by comparing attributes across two domains). This is what the Context Engine traverses to answer cross-domain questions without the user naming a module ("Which medicines expire before my doctor's appointment?"), and what Analytics aggregates across.

| From | Relationship | To | Kind |
|---|---|---|---|
| Goal | is broken down into | Project(s) | Structural |
| Goal | is broken down into | Habit(s) (e.g., "Run 3x/week" habit under "Run a marathon" goal) | Structural |
| Project | contains | Task(s) | Structural |
| Task | can appear on | Calendar (via due date) | Structural |
| Habit | can appear on | Calendar (via reminder time) | Structural |
| Task / Event / Habit | can be referenced from | Notes | Structural (`EntityRef`) |
| Journal Entry | can reference | Task / Goal / Habit / mood tag | Structural (`EntityRef`) |
| Transaction | can be tagged to | Budget category, optionally a Goal (e.g., "Save for house") | Structural |
| Reminder | can be standalone or attached to | any entity | Structural (`EntityRef`) |
| Note | can be linked to | any entity | Structural (`EntityRef`) |
| Document | can be attached to | Life Record, Bill, Health record, or any entity | Structural (`EntityRef`) |
| Life Record | can generate | Reminder (as expiration approaches) | Structural |
| Bill | can generate | Reminder (ahead of due date) | Structural |
| Subscription | can generate | Reminder (ahead of renewal) | Structural |
| Medicine / Health Event | can generate | Reminder (refill, appointment, booster) | Structural |
| Grocery List | can be created from | Jarvis / ICE (voice- and text-generated, functional this phase against the mock provider — docs/35 §5) | Structural |
| Bill | relates to | Budget (matching category) | **Inferred** — [38_Context_Engine.md](38_Context_Engine.md) §1 |
| Subscription | relates to | Transaction / recurring spending | **Inferred** — cost-impact only; see [38_Context_Engine.md](38_Context_Engine.md) §6 for the usage-data gap |
| Medicine | relates to | Health Event (doctor visit/appointment) | **Inferred** — expiry-vs-appointment-date comparison |
| Life Record (passport) | relates to | Calendar Event | **Inferred** — stands in for "future travel" until Travel is a real pillar; see [38_Context_Engine.md](38_Context_Engine.md) §6 |

## 5. Global Systems (present on every domain)

- **Global Search / Command Palette** — searches across all entity types simultaneously, grouped by domain in results. Every new module (Life Records, Bills, Subscriptions, Documents, Health, Grocery Lists) is indexed the same way — no per-module search UI.
- **Quick Add / ICE entry point** — superseded from a single lightweight-parsing text field into the primary entry point for the Intelligent Capture Engine (docs/01 §7): reachable from anywhere, accepting typed text, voice, clipboard, shared text, and (UI-stubbed this phase) photo/PDF/email capture — see [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) §2 for per-source scope. It can now route to **any** domain in §4's relationship table, not just Task/Note/Reminder/Journal.
- **Reminder Engine** — the shared scheduling service every module with a future-relevant date (expiration, due date, renewal, appointment) registers into, rather than each module managing its own scheduling. The Reminders domain (Tier 2) is its user-facing surface; Calendar and Notifications Inbox both render what it generates. See [13_Technical_Architecture.md](13_Technical_Architecture.md) §10.
- **Notifications Inbox** — a single place all cross-domain alerts land, regardless of which domain generated them.
- **Jarvis / AI Engine (ICE)** — accessible from anywhere, contextually aware of the domain the user is currently in. Every domain's repository (including the new modules) is a sanctioned data source the assistant can query — the same pattern already used for Tasks/Goals/Habits/Calendar — and, per the AI-first repositioning, a sanctioned **write target** too, always mediated by the confirm-before-save flow in [34_AI_Architecture.md](34_AI_Architecture.md) §2.
- **Context Engine** — the cross-domain reasoning layer Jarvis's `converse()` calls into for any question touching more than one domain, traversing §4's Relationship Graph to answer without the user naming a module. Full spec: [38_Context_Engine.md](38_Context_Engine.md).

## 6. Content Model Depth per Domain (List vs. Detail vs. Sub-detail)

Every MVP domain follows the same three-level depth pattern for consistency:

1. **Collection view** (list/board/grid — domain-appropriate) with filter/sort/search
2. **Detail view** (full entity view, edit-in-place where possible)
3. **Related-entity drill-in** (e.g., from a Goal detail into a linked Project's Task list)

No domain should introduce a fourth navigational depth level in this phase — this constraint keeps the mobile experience shallow and fast, per [20_Responsive_Design_Guidelines.md](20_Responsive_Design_Guidelines.md).

## 7. URL Structure (maps to Routing Strategy)

```
/                          → Dashboard
/assistant                 → Redirects to Dashboard and opens the floating Jarvis companion (docs/39 addendum) — kept as a deep-linkable URL, no longer its own page
/capture                   → Same redirect as /assistant — quick capture now happens inside the floating companion, not a dedicated route
/tasks                     → Tasks collection
/tasks/:taskId              → Task detail
/goals                     → Goals collection
/goals/:goalId              → Goal detail
/habits                    → Habits collection
/habits/:habitId            → Habit detail
/calendar                  → Calendar (default month view)
/calendar/:view/:date        → Calendar with explicit view/date
/notes                     → Notes collection
/notes/:noteId               → Note editor
/life-records              → Life Records collection
/life-records/:recordId      → Life Record detail
/bills                     → Bills collection
/bills/:billId                → Bill detail
/subscriptions             → Subscriptions collection
/subscriptions/:subId         → Subscription detail
/documents                 → Documents collection
/documents/:documentId       → Document viewer
/health                    → Health overview
/health/:section             → Medicines / Vaccinations / Vitals, etc.
/grocery-lists              → Grocery Lists collection
/grocery-lists/:listId        → List detail
/settings/*                → Settings section tree
```

Full rationale in [15_Routing_Strategy.md](15_Routing_Strategy.md).
