# AGENTS.md — Veltra

Monorepo: `veltra-frontend` (Next.js 15, porta 3000) e `veltra-backend` (NestJS + Postgres/Redis, porta 3001). A raiz versiona o frontend e a documentação; `veltra-backend/` é ignorado no root e tem `.git` próprio — ao commitar (só com pedido explícito), use o repositório correto.

## Arquitetura (contrato)

- `docs/hld.md` e `docs/lld.md` são a fonte de verdade sobre arquitetura, fluxos, modelo de dados, API e invariantes.
- Leia o HLD e o LLD antes de mudanças transversais (novo endpoint/entidade, alteração de contrato, regra de plano, IA, auth ou dados).
- Implemente de acordo com esses documentos. Se a tarefa exigir divergir, atualize **HLD e LLD na mesma alteração** e explique o motivo no resumo final.
- Nunca viole as invariantes do HLD (escopo por usuário, dia único no plano, `rest` nunca concluído, IA não grava direto, limites por idade, `analytics/weekly` seg–dom, API `snake_case` → `camelCase`).
- Se código e documento divergirem, trate o código como estado real, confirme o comportamento e corrija o documento — sem “corrigir” o código por conta própria quando a divergência não for o objetivo da tarefa.
- Use `/hld` e `/lld` para revisar/atualizar os documentos. Mudanças nesses arquivos também entram no resumo final.

## Ambiente e servidores

- Padrão: o usuário é dono dos processos nas portas 3000/3001 e dos containers `veltra_db`/`veltra_cache`. O agente não inicia, reinicia, encerra nem mata nada por conta própria.
- Exceção: com pedido explícito ("suba o frontend", "inicie o backend"), o agente pode iniciar somente o serviço pedido, em background, com log em `/tmp/opencode/<servico>.log` (ex.: `nohup npm run dev > /tmp/opencode/frontend.log 2>&1 &`).
- Com pedido explícito para subir o projeto/servidores ("suba o projeto", "inicie os servidores"), o agente também pode subir as dependências em `veltra-backend/` com `docker compose up -d db redis` (containers `veltra_db` e `veltra_cache`), antes de iniciar frontend/backend. Verifique `docker ps`, as portas 5432/6379 e se os containers já estão rodando; não recrie se estiverem de pé.
- Sem pedido explícito, o agente não gerencia containers: não cria, não reinicia e não remove `veltra_db`/`veltra_cache` nem volumes.
- Antes de iniciar, verifique a porta (`lsof -i :3000` / `:3001`). Se já estiver em uso, não suba outro processo: informe que já está rodando e pergunte se pode reiniciar.
- O backend precisa de Postgres/Redis de pé; se o banco estiver indisponível ele esgota os retries e aborta. Nesse caso, suba os containers e reinicie apenas o backend iniciado pelo agente.
- O agente só encerra/reinicia processos que ele mesmo iniciou nesta sessão, e apenas com pedido explícito. Nunca mate processos do usuário nem containers que ele não tenha pedido para iniciar.
- Frontend `.env`: `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`.

## Verificação

- Frontend: `npx tsc --noEmit`. Não use `npm run lint` (sem ESLint configurado; `next lint` é interativo).
- Frontend: nunca rode `next build` no diretório real com o dev server ativo (sobrescreve `.next`). Para validar build, copie para `/tmp/opencode` com `node_modules` simbólico.
- Backend: `npx jest <paths>` (só o tocado), `npx eslint <paths>` e `npm run build`; `npm test` apenas quando necessário.
- Falhas pré-existentes de DI no backend: `auth.service.spec`, `auth.controller.spec`, `users.service.spec`, `insights.service.spec` (baseline ~4 suítes). Não corrigir sem pedido explícito.
- Há WIP não commitado do usuário: nunca reverter alterações não relacionadas às suas mudanças.

## Backend (NestJS)

- Toda rota autenticada resolve o usuário via `AuthSessionService.resolveUserId(req)` e escopa queries por `user: { id: userId }` / `userId`. Nunca retorne dados sem filtro de usuário.
- `AuthSessionService` vive em `src/auth/session.module.ts` (`SessionModule`). Módulos com ciclo (`UsersModule -> ActivitiesModule`) devem importar `SessionModule`, não `AuthModule`.
- `/analytics/weekly` considera apenas a semana atual (seg–dom, hora local).
- Sessões `type: "rest"` nunca são concluídas. “Próximo treino” ignora `rest`, usa `dayOrder` (Seg=0 … Dom=6) e busca a semana seguinte se não houver treino.
- O coach só propõe; validação e persistência acontecem no servidor e exigem ação do atleta.

## Frontend (Next.js)

- Design system: tokens em `src/app/globals.css`; fontes Sora (títulos) e Geist (corpo); use `surface-*`, `on-surface*`, `primary*`.
- Reutilize `src/lib/training-display.ts` (`typeColors`, `typeLabels`, `typeIcons`, `DAY_ORDER`) em vez de duplicar constantes.
- O client (`src/lib/api/client.ts`) converte `snake_case` → `camelCase`; tipos em `src/lib/api/types.ts`.
- Páginas são client components com dados em `useEffect`; trate carregamento, vazio e erro, e reutilize helpers de `src/lib/format.ts`.

## Git, branches e commits

- Nunca commitar sem pedido explícito. Antes de commitar, rode `git status`, `git diff` e `git log --oneline -10`; faça stage apenas do que é intencional.
- A raiz e `veltra-backend/` são repositórios distintos: commit no repo correto e nunca inclua `veltra-backend/` em commit da raiz.
- Branches: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`, `refactor/<slug>` ou `test/<slug>`, em kebab-case. Crie a branch antes de começar uma mudança; não trabalhe direto em `main`.
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`), assunto curto em inglês, como no histórico. Um commit por mudança lógica; não misture refactor/formatação com comportamento.
- Não faça `--amend`, rebase interativo ou force-push sem pedido explícito. Se um hook falhar, corrija e crie um novo commit.
- Nunca commite `.env`, tokens, chaves ou segredos; confira o diff antes.

## CI/CD

- Pipelines GitHub Actions:
  - `.github/workflows/frontend-ci.yml` no repo `veltra-frontend`.
  - `veltra-backend/.github/workflows/backend-ci.yml` no repo próprio do backend.
- Frontend no CI: `npm ci`, `npx tsc --noEmit` e `npm run build` em runner efêmero. Não rode `next build` localmente com o dev server ativo; no CI não há dev server.
- Backend no CI: `npm ci`, lint apenas dos arquivos TS alterados (o baseline atual tem erros de lint pré-existentes), `npm run build` e `npx jest` ignorando as 4 suítes de DI conhecidas. `npm test` completo só quando justificável.
- Não iniciar `npm run dev` em CI. Postgres/Redis, quando necessários, devem ser efêmeros (services do CI), nunca os containers locais do usuário.
- Segredos de CI/CD vêm de secrets/variáveis do provedor. Nunca hardcode `OPENAI_API_KEY`, `STRAVA_CLIENT_SECRET`, `SECRET_KEY_JWT` etc.
- Deploy não pode usar `DB_SYNCHRONIZE=1`; produção deve usar migrations. O CD/deploy automático ainda depende da definição do alvo de hospedagem.
- Se criar ou alterar o pipeline, atualize o HLD/LLD (RNFs) e o README quando o fluxo mudar.
- PRs devem passar no CI antes do merge e descrever mudança, riscos, testes executados e docs atualizados.

## Comunicação

- Responder em português (pt-BR); textos de UI em pt-BR.
