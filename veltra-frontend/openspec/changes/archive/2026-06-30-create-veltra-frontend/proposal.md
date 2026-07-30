## Why

Build the initial frontend for Veltra — an AI-powered running coach — turning Stitch UI designs into real Next.js code with shadcn/ui and Tailwind CSS. This establishes the entire client-side application so users can track runs, follow training plans, and interact with an AI coach, while keeping the backend fully decoupled behind environment‑configurable API endpoints.

## What Changes

- Scaffold a Next.js 15 (App Router) project with TypeScript, Tailwind CSS v4, and shadcn/ui
- Implement a custom design system based on the Veltra "Kinetic Precision" tokens (colors, typography, spacing, shapes)
- Build a shared component library: layout shell, navigation, buttons, cards, metric chips, data displays
- Create the API client abstraction layer (`lib/api/`) reading the base URL from `NEXT_PUBLIC_API_URL`
- Pages (all server‑rendered with client interactivity where needed):
  - **Login** — authentication screen
  - **Dashboard** — overview landing after login
  - **Training Plan** — weekly/monthly running plan view
  - **Activities** — historical run log
  - **Analytics** — charts and performance data
  - **Comparison** — side‑by‑side run comparison
  - **My Goal** — goal setting and progress
  - **Achievements** — trophy case / badges
  - **Coach Insights** — AI generated textual insights
  - **Coach Chat** — conversational AI interface
- Implement client‑side routing with Next.js App Router
- Stub all API calls through `lib/api/` — real backend integration comes later

## Capabilities

### New Capabilities
- `auth`: User login and session management
- `dashboard`: Main overview screen with run summary, streak, and quick stats
- `training-plan`: Weekly training schedule with sessions and progress
- `activities`: List and detail views of past running activities
- `analytics`: Charts and statistical breakdowns of performance
- `comparison`: Side‑by‑side comparison of two or more runs
- `goals`: Goal creation, tracking, and achievement status
- `achievements`: Badge and trophy collection display
- `coach-insights`: AI‑generated text insights about running performance
- `coach-chat`: Real‑time conversational interface with the AI coach
- `api-client`: API abstraction layer with environment‑configurable base URL
- `shared-ui`: Reusable design system components (layout, navigation, cards, typography)

### Modified Capabilities

<!-- No existing specs to modify — this is the initial frontend build. -->

## Impact

- **Tech stack**: Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Lucide icons, Recharts (charts)
- **Dependencies added**: `next`, `react`, `tailwindcss`, `lucide-react`, `recharts`, `@radix-ui/*` (via shadcn)
- **Environment**: `NEXT_PUBLIC_API_URL` in `.env.local` for backend endpoint
- **Codebase**: New `src/` directory with `app/`, `components/`, `lib/`, `hooks/` structure
- **Design System**: Custom CSS variables and Tailwind preset matching the Stitch "Kinetic Precision" theme
- **No API implementation**: All endpoints are stubbed – the backend will be built separately and wired via the env variable
- **Not in scope**: Backend, database, authentication provider (will be added later)
