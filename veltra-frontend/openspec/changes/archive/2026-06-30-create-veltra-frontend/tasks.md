## 1. Project Scaffolding

- [x] 1.1 Initialize Next.js 15 project with TypeScript and App Router
- [x] 1.2 Install dependencies: tailwindcss, lucide-react, recharts, @radix-ui/* (via shadcn)
- [x] 1.3 Configure Tailwind CSS v4 with content paths and plugins
- [x] 1.4 Create `.env.local` with `NEXT_PUBLIC_API_URL` placeholder
- [x] 1.5 Set up `src/` directory structure: `app/`, `components/`, `lib/`, `hooks/`

## 2. Design System

- [x] 2.1 Define CSS custom properties for colors (primary, surface, on-surface, etc.) in `app/globals.css`
- [x] 2.2 Define CSS custom properties for typography (Sora headlines, Geist body)
- [x] 2.3 Define spacing scale (8px base, container margins, card gap)
- [x] 2.4 Define border radius tokens (sm, DEFAULT, md, lg, xl, full)
- [x] 2.5 Create Tailwind CSS v4 preset extending the design tokens
- [x] 2.6 Initialize shadcn/ui with the custom theme variables

## 3. Shared UI Components

- [x] 3.1 Create app layout shell with sidebar navigation
- [x] 3.2 Build sidebar component with nav links (Dashboard, Plano de Treino, Atividades, Análises, Comparação, Meta, Conquistas, Coach)
- [x] 3.3 Build top header bar with user avatar and logout button
- [x] 3.4 Build `PerformanceCard` component (white card, 1px border, header label)
- [x] 3.5 Build `MetricChip` component for secondary stats (cadence, elevation, etc.)
- [x] 3.6 Build `PrimaryButton` component with orange gradient and hover glow
- [x] 3.7 Build `DataDisplay` component for large metrics with `data-mono` typography
- [x] 3.8 Build `ProgressBar` component with segmented interval styling

## 4. API Client Layer

- [x] 4.1 Create `lib/api/client.ts` with generic fetch wrapper (get, post, put, delete)
- [x] 4.2 Create `lib/api/types.ts` with shared TypeScript interfaces (User, Activity, TrainingPlan, Goal, etc.)
- [x] 4.3 Create `lib/api/auth.ts` — endpoints: `/auth/strava/connect`, `/auth/strava/callback`, `/auth/me`, `/auth/logout`
- [x] 4.4 Create `lib/api/activities.ts` — endpoints: `/activities`, `/activities/:id`
- [x] 4.5 Create `lib/api/training.ts` — endpoints: `/training-plans`, `/training-plans/:id`
- [x] 4.6 Create `lib/api/analytics.ts` — endpoints: `/analytics`, `/analytics/comparison`
- [x] 4.7 Create `lib/api/goals.ts` — endpoints: `/goals`, `/goals/:id`
- [x] 4.8 Create `lib/api/achievements.ts` — endpoints: `/achievements`, `/achievements/:id`
- [x] 4.9 Create `lib/api/coach.ts` — endpoints: `/coach/insights`, `/coach/chat`
- [x] 4.10 Add stub/mock data for all endpoints returning realistic running data

## 5. Auth

- [x] 5.1 Create login page (`/login`) with Veltra branding, tagline, and "Entrar com Strava" button
- [x] 5.2 Create `useAuth` hook and `AuthProvider` context
- [x] 5.3 Implement auth state: loading / authenticated / unauthenticated
- [x] 5.4 Implement redirect to `/api/v1/auth/strava/connect` on button click
- [x] 5.5 Create authenticated root layout that wraps all app pages
- [x] 5.6 Implement route guard: unauthenticated users redirected to `/login`

## 6. Dashboard

- [x] 6.1 Create dashboard page (`/dashboard`) with welcome header and user name
- [x] 6.2 Build streak card (current streak, best streak)
- [x] 6.3 Build weekly summary card (distance, time, runs this week)
- [x] 6.4 Build last run highlight card with key metrics
- [x] 6.5 Build upcoming training session card
- [x] 6.6 Build quick-stat chips row (pace, heart rate, cadence)

## 7. Training Plan

- [x] 7.1 Create training plan page (`/training-plan`) with weekly calendar view
- [x] 7.2 Build day-by-day session cards with run type (easy, interval, long run, rest)
- [x] 7.3 Build current week navigation (prev/next week arrows)
- [x] 7.4 Build session detail with planned distance, pace, and notes

## 8. Activities

- [x] 8.1 Create activities list page (`/activities`) with sortable/filterable list
- [x] 8.2 Build activity row component (date, distance, pace, duration, elevation)
- [x] 8.3 Create activity detail page (`/activities/[id]`) with full metrics
- [x] 8.4 Build activity map placeholder area

## 9. Analytics

- [x] 9.1 Create analytics page (`/analytics`) with date range selector
- [x] 9.2 Build weekly distance bar chart (Recharts)
- [x] 9.3 Build pace trend line chart
- [x] 9.4 Build heart rate zone distribution chart
- [x] 9.5 Build elevation gain summary card

## 10. Comparison

- [x] 10.1 Create comparison page (`/comparison`) with activity selector
- [x] 10.2 Build side-by-side metric comparison table
- [x] 10.3 Build overlay chart for pace comparison across two runs

## 11. Goals

- [x] 11.1 Create my goal page (`/goal`) with current goal display
- [x] 11.2 Build goal progress ring/chart component
- [x] 11.3 Build goal edit form (distance target, date, discipline)
- [x] 11.4 Build milestone breakdown within goal

## 12. Achievements

- [x] 12.1 Create achievements page (`/achievements`) with trophy grid
- [x] 12.2 Build achievement card component (icon, name, earned/locked state)
- [x] 12.3 Build category filters (distance, speed, consistency, etc.)

## 13. Coach Insights

- [x] 13.1 Create coach insights page (`/coach/insights`) with insight cards
- [x] 13.2 Build insight card with AI coach avatar, text, and timestamp
- [x] 13.3 Build topic filter chips (performance, recovery, form, nutrition)

## 14. Coach Chat

- [x] 14.1 Create coach chat page (`/coach/chat`) with message thread
- [x] 14.2 Build message bubble component (user vs coach styling)
- [x] 14.3 Build chat input with send button
- [x] 14.4 Implement mock response with simulated delay
- [x] 14.5 Add auto-scroll to bottom on new messages
