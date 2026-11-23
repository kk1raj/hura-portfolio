# Project Rules & Architecture Contract (`AGENTS.md`)

This document defines mandatory engineering, architectural, security, and verification rules for all tasks in this repository. Every contributor and AI agent must follow these rules strictly.

---

## 1. Tech Stack

- **Framework:** Next.js (App Router, `src/` directory). Do not introduce the Pages Router.
- **Language:** TypeScript with `"strict": true`. Never use `any`, `@ts-ignore`, or `@ts-expect-error` as shortcuts; use `unknown` + narrowing, Zod inference, or explicit domain types.
- **Styling:** Tailwind CSS.
- **Icons:** `lucide-react`.
- **Internationalization:** `next-intl`.
- **Validation:** `zod` for all untrusted boundaries (forms, API payloads, route/query params, env vars, DB/external inputs).
- **Backend & Storage:** Supabase (`@supabase/supabase-js` for PostgreSQL DB and Storage).
- **Admin Session Auth:** `jose` for signing/verifying JWT stored in `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookies.

---

## 2. Site & Section Architecture

### Public Portfolio & CV
- Unified top navigation across public pages with the following primary tabs and contacts entry:
  - `Design` — design portfolio works (future migration target for legacy design portfolio content).
  - `Websites` — web development / websites showcase.
  - `CV` — resume / curriculum vitae.
  - `Contacts` — contact details and contact form / Telegram submission trigger.

### Admin Panel (`/admin`)
- The admin panel **MUST** reside strictly at `/admin` (`src/app/admin/...`), **WITHOUT** any locale prefix (never `/en/admin`, `/uk/admin`, `/pl/admin`, `/ru/admin`).
- Exclude `/admin` and `/api` from `next-intl` locale prefixing and middleware redirects.
- The admin panel mirrors the site structure with tabs:
  - `Design`
  - `Websites`
  - `CV`
  - `Settings`

---

## 3. Internationalization (i18n)

- Supported locales: `en`, `uk`, `pl`, `ru`.
- **All** public UI text must come from `next-intl` translation dictionaries (`src/messages/en.json`, `src/messages/uk.json`, `src/messages/pl.json`, `src/messages/ru.json`). Do not hardcode user-facing strings in components.
- Ensure parity of translation keys across all four locales (`en`, `uk`, `pl`, `ru`).

---

## 4. Security & Secrets Management

- Sensitive secrets belong **exclusively** in `.env.local` (never committed to Git) and **exclusively** in server-only runtime code (`import 'server-only'` where appropriate):
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_PASSWORD`
  - `ADMIN_JWT_SECRET`
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`
- Never expose server secrets via `NEXT_PUBLIC_*` variables, client components, serialized props, API error responses, or logs.
- Use `.env.example` (with empty values) to document all required environment variables.
- Validate environment variables on the server before use and fail fast with clear diagnostics if required keys are missing when an authenticated/server-only flow runs.
- Protect all `/admin` mutations and private endpoints by verifying the `jose` JWT session cookie on the server. Never rely on client-side checks alone.

---

## 5. UI Policy (Current Phase)

- While building the foundation, database layer, APIs, and admin functionality, keep the UI **clean, semantic, accessible, and minimalist (wireframe-style)**.
- Do not invest in decorative styling or heavy visual polish yet — final visual design will be applied in a dedicated design phase later.

---

## 6. Mandatory Verification After Every Task

After completing **every** task (once the Next.js project is initialized), you **MUST** run both commands and confirm zero errors before reporting completion:

```bash
npx tsc --noEmit
npm run build
```
