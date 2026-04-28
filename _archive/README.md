# `_archive/`

This directory holds code that has been removed from the live application but is preserved for historical reference, future re-use, or audit.

**Nothing under `_archive/` is shipped, imported, compiled, or routed.** The leading underscore makes Next.js's App Router skip it automatically; `tsconfig.json` also excludes it from TypeScript's program. Treat the contents as read-only artifacts.

## Layout

```
_archive/
└── onboarding-v1/            # The original pre-chat onboarding flow (~60 screens, ~25 min)
    ├── components/           # React components (assessment instruments, screening forms, etc.)
    ├── routes/               # `app/` route segments (page.tsx, layout.tsx, loading.tsx)
    ├── templates/            # Email/UI templates that were tied to v1 flows
    └── api/                  # API route handlers tied to v1 flows
```

## `onboarding-v1/`

Archived during **Sprint 2** of the onboarding restructure (see `instructions/` for the sprint plan). The goal of Sprint 2 was to compress pre-chat friction from ~60 screens / ~25 minutes down to ~10 screens / ~2 minutes. Everything pulled out of the live tree during that compression lives here.

What's archived:

- **Email verification** flow — page and route handler.
- **Safety screening** — all 6 sections, replaced by a single agreement checkbox.
- **Access Granted** screen.
- **Separate Terms of Service and Informed Consent** screens — replaced by a combined agreement checkbox.
- **Baseline assessment instruments** — Calm Core, Observer Index, Vitality Index, Focus Diagnostic, Presence Test. Replaced by a 4-question self-rating (Regulation, Awareness, Outlook, Attention) on a 0–5 scale matching the weekly check-in.
- **Mirror onboarding** screens — relocated to a Stage 2 unlock that will be built in Sprint 7. Pieces of this code may be revived there.

## Restoring code from this archive

If a piece of v1 needs to come back:

1. Find it under the matching subfolder.
2. Copy (don't move) it back into the live tree at the appropriate location.
3. Update imports — paths and aliases may have changed since archival.
4. Re-run `npx tsc --noEmit` and `npm run build`.

Do not edit files in place under `_archive/`. The point of the archive is that it reflects the code as it was when removed.
