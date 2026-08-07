# features

One folder per domain pillar (tasks, goals, habits, calendar, notes, ...),
each following the anatomy defined in `docs/12_Folder_Architecture.md` §3:

```
/features/{domain}
  /components
  /hooks
  /types.ts
  /repository.ts
  /mock/
  /utils.ts
  index.ts
```

Intentionally empty in this milestone — no domain UI or business logic has
been built yet. Other code must only ever import a feature via its
`index.ts` public surface once features exist (enforced by the
`no-restricted-imports` rule in `eslint.config.js`).
