# AGENTS.md — Veltra

Monorepo: `veltra-frontend` (Next.js 15, porta 3000) e `veltra-backend` (NestJS + Postgres/Redis, porta 3001).

- Repositórios: o repo raiz versiona apenas `veltra-frontend`; `veltra-backend/` é ignorado no root e tem `.git` próprio. Ao commitar (só com pedido explícito), usar o repo correto.

## Ambiente

- NUNCA iniciar, reiniciar, encerrar ou matar `npm run dev` do frontend ou do backend. O usuário mantém os dois rodando em terminais paralelos do VS Code e cuida disso.
- Nunca encerrar processos do usuário nas portas 3000 (frontend) e 3001 (backend).
- Não matar/derrubar containers Docker (`veltra_db`, `veltra_cache`) — o usuário os mantém para desenvolvimento.
- `veltra-frontend/.env`: `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`.

## Verificação

- Frontend:
  - Typecheck: `npx tsc --noEmit` (não existe script `typecheck`).
  - `npm run lint` não roda (sem config de ESLint no projeto; `next lint` fica interativo). Não usar.
  - `next build` NUNCA no diretório real com o dev server rodando: sobrescreve `.next` e quebra o dev do usuário. Para validar build, copiar o projeto para `/tmp/opencode` (com `node_modules` simbólico) e buildar lá.
- Backend: `npm test`, `npx jest <paths>` (só o que foi tocado), `npx eslint <paths>`, `npm run build`.
- Falhas pré-existentes conhecidas nos specs do backend (DI incompleta): `auth.service.spec`, `auth.controller.spec`, `users.service.spec`, `insights.service.spec`. Baseline ~4 suítes falhando; não corrigir sem pedido explícito.
- O working tree tem WIP não commitado do usuário. Nunca reverter alterações não relacionadas às suas mudanças.

## Backend (NestJS)

- Toda rota autenticada resolve o usuário via `AuthSessionService.resolveUserId(req)` e escopa as queries por `user: { id: userId }`. Nunca criar endpoint que retorne dados sem filtro de usuário.
- `AuthSessionService` vive em `src/auth/session.module.ts` (`SessionModule`). Módulos que não podem importar `AuthModule` (ciclo `UsersModule -> ActivitiesModule`) devem importar `SessionModule`.
- `/analytics/weekly` considera apenas a semana atual (domingo a sábado, hora local).
- Sessões de treino `type: "rest"` nunca são marcadas como `completed`. Lógica de "próximo treino" deve ignorar `rest` e usar `dayOrder` (Dom=0 … Sáb=6) comparando com o dia de hoje; se não houver treino na semana, buscar a semana seguinte.

## Frontend (Next.js)

- Design system: tokens em `src/app/globals.css`; fontes Sora (títulos) e Geist (corpo); usar as cores `surface-*`, `on-surface*`, `primary*`.
- Constantes visuais de treino compartilhadas em `src/lib/training-display.ts` (`typeColors`, `typeLabels`, `typeIcons`, `DAY_ORDER`). Reutilizar em vez de duplicar.
- O client de API (`src/lib/api/client.ts`) converte snake_case → camelCase automaticamente; tipos em `src/lib/api/types.ts`.
- Páginas são client components que buscam dados em `useEffect`; sempre tratar estados vazios e evitar duplicar helpers de formatação entre páginas quando houver equivalente compartilhado.

## Comunicação

- Responder em português (pt-BR); textos de UI em pt-BR.
- Nunca commitar sem pedido explícito.
