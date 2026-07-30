## Context

This is the initial frontend for Veltra — an AI-powered running coach. The UI was designed in Stitch with a "Kinetic Precision" design system (Sora headlines, Geist body, orange primary, high-contrast surfaces). The frontend must be fully standalone with all API calls abstracted behind environment variables, since the backend will be built separately later.

## Goals / Non-Goals

**Goals:**
- Scaffold a production-ready Next.js 15 project with App Router and TypeScript
- Implement the complete "Kinetic Precision" design system as Tailwind CSS variables and shadcn/ui theme
- Build all 10 pages matching the Stitch screen designs: Login, Dashboard, Training Plan, Activities, Analytics, Comparison, My Goal, Achievements, Coach Insights, Coach Chat
- Create an API client layer (`lib/api/`) that reads `NEXT_PUBLIC_API_URL` from `.env.local`
- Use shadcn/ui primitives as the foundation for all interactive components
- Support both desktop (1280px+) and mobile responsive layouts per the Stitch specs

**Non-Goals:**
- No backend implementation or database integration
- No real authentication provider (UI stubs only)
- No SSR data fetching from real APIs — all data is mocked client-side
- No PWA/service worker setup
- No E2E tests (unit tests for utilities only)

## Decisions

1. **Next.js 15 App Router over Pages Router**
   - Chosen for its server components, layout nesting, and modern React patterns. App Router's layout system maps directly to the app shell + page structure needed.
   - Alternative considered: Pages Router (rejected — less flexible for nested layouts, deprecated trajectory).

2. **shadcn/ui over a full component library (MUI, Chakra)**
   - shadcn/ui provides unstyled, accessible primitives that are copied into the project and fully customizable with Tailwind. This lets us match the exact "Kinetic Precision" look without fighting framework styles.
   - Alternatives considered: MUI (too opinionated, hard to restyle), Chakra (too heavy for mostly display pages), hand-rolling everything (too slow).

3. **Tailwind CSS v4 with CSS variables for design tokens**
   - Token values from the Stitch theme (colors, spacing, typography) become `:root` CSS custom properties and a Tailwind preset. This gives both declarative Tailwind classes and access to tokens in plain CSS.
   - Alternative considered: CSS Modules + style dictionary (more tooling, less ergonomic for shadcn compatibility).

4. **API client as a thin fetch wrapper, not a full SDK**
   - A simple `api.ts` module exports typed functions (`api.get`, `api.post`) that prepend `NEXT_PUBLIC_API_URL` and handle JSON parsing/errors. The backend team can later replace the stubs.
   - Alternative considered: tRPC or GraphQL (backend doesn't exist yet, over-engineering at this stage).

5. **Recharts for charts**
   - Lightweight, composable, works well with React Server Components for static charts and client components for interactive ones.
   - Alternative considered: D3 (too low-level), Chart.js (less React-native).

### Image Assets

Custom SVG images were created for the project, stored in `public/images/`:

- **Logo & Branding**: `logo.svg` (full wordmark with V-icon), `logo-icon.svg` (V-icon only), `favicon.svg`
- **AI Coach Avatar**: `avatar-coach.svg` — stylized abstract coach face with spark accents
- **Achievement Badges**: `badge-{first-step,century,marathoner,consistent,sprinter}.svg`
- **Training Type Icons**: `icon-training-{easy,interval,long,rest,recovery}.svg`
- **Page Illustrations**: `illustration-{analytics,goal,comparison}.svg`
- **Decorations**: `hero-bg.svg` (login background), `dashboard-streak.svg`, `map-placeholder.svg`

All SVGs follow the "Kinetic Precision" style: #aa3000 primary, 2px sharp strokes, geometric/linear aesthetic.

## Risks / Trade-offs

- **Stub data divergence**: Mock data in `lib/api/` may drift from the real backend schema → Mitigation: define TypeScript interfaces (`lib/api/types.ts`) that are the source of truth and must be agreed upon with the backend team.
- **No real auth**: Login page will be purely cosmetic until auth provider is integrated → Mitigation: build auth as a hook (`useAuth`) with a stub provider that can be swapped later.
- **shadcn/ui upgrades**: shadcn components are copied locally — they won't auto-update → Mitigation: acceptable trade-off for full styling control.
- **Tailwind v4 migration**: Tailwind v4 is very new and may have API instability → Mitigation: pin the exact version and plan for minor bumps.
- **Coach Chat streaming**: A real-time chat UI without a backend is speculative → Mitigation: build the UI with a message list + input, mock responses with a delay function.
