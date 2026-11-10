# LLD — Veltra (Low-Level Design)

> **Última atualização:** 10/11/2026
> **Escopo:** frontend `veltra-frontend` + backend `veltra-backend`
> **Documento de contexto:** [HLD](./hld.md)
> **Fonte de verdade:** este documento descreve a implementação **as-built**. Divergências entre código e documento devem ser resolvidas na mesma tarefa.

---

## 1. Estrutura do repositório

```
Veltra/
├── AGENTS.md
├── README.md
├── docs/
│   ├── hld.md
│   └── lld.md
├── .github/workflows/
│   └── frontend-ci.yml
├── .opencode/commands/
│   ├── hld.md
│   └── lld.md
├── veltra-frontend/
│   ├── src/app/                 # App Router
│   ├── src/components/          # layout + design system
│   ├── src/hooks/use-auth.tsx
│   └── src/lib/                 # api, formatadores e constantes
└── veltra-backend/
    ├── .github/workflows/
    │   └── backend-ci.yml
    ├── src/<módulo>/            # controller, service, dto, entity
    └── src/utils/types.ts
```

Convenções de caminho:

- Frontend usa alias `@/*` → `src/*`.
- Backend usa imports absolutos `src/*` (mapeados no Jest por `^src/(.*)$`).
- A raiz versiona o frontend e a documentação; `veltra-backend/` tem Git próprio.

---

## 2. Convenções transversais

| Tema | Regra |
|---|---|
| Linguagem | TypeScript estrito. |
| UI | Textos em pt-BR; componentes client-side. |
| Banco/API | Colunas e JSON em `snake_case`; frontend consome `camelCase`. |
| IDs | UUID v7 gerado em `@BeforeInsert`. |
| Datas | `timestamptz` no banco; strings ISO na API. |
| Semana | Segunda a domingo, calculada em horário local do servidor. |
| Erros de regra | `BadRequestException({ code, message, ... })` no backend. O client atual propaga apenas `status` e `message` — o `code` do body ainda não chega ao frontend. |
| Autenticação | `AuthSessionService.resolveUserId(req)` em toda rota autenticada. |
| Escopo | Toda query de dados do atleta filtra por `user`/`userId`. |
| Comentários | Evitar comentários supérfluos; código existente usa comentários apenas para regras não óbvias. |

---

## 3. Backend — bootstrap e configuração

### 3.1 `main.ts`

Ordem de configuração:

1. `NestFactory.create(AppModule)`.
2. `ValidationPipe` global:
   - `whitelist: true`
   - `forbidNonWhitelisted: true`
   - `transform: false`
3. CORS:
   - `origin: process.env.FRONTEND_URL ?? "http://localhost:3000"`
   - `credentials: true`
4. `cookieParser()`.
5. Swagger em `/api-doc` somente quando `NODE_ENV !== "production"`.
6. Prefixo global `api/v1`.
7. `listen(process.env.PORT ?? 3000)`.

> O `.env.example` define `PORT=3001`; o fallback do código é `3000`, então a porta efetiva depende do ambiente.

### 3.2 `AppModule`

- `ThrottlerModule`: TTL 6000 ms, limite 60, bloqueio 5000 ms.
- `ThrottlerGuard` como `APP_GUARD`.
- `ConfigModule.forRoot({ isGlobal: true })`.
- `TypeOrmModule.forRootAsync` lendo `DB_*`:
  - `autoLoadEntities` quando `DB_AUTOLOADENTITIES === "1"`.
  - `synchronize` quando `DB_SYNCHRONIZE === "1"`.
- Módulos importados: `Users`, `Redis`, `Auth`, `Strava`, `Activities`, `Insights`, `Ai`, `Goals`, `TrainingPlans`, `Coach`, `Analytics`, `Achievements`, `StravaWebhook`, `Health`.

### 3.3 Variáveis de ambiente do backend

| Variável | Uso |
|---|---|
| `PORT` | Porta HTTP (padrão de código 3000; exemplo 3001). |
| `FRONTEND_URL` | CORS e redirect pós-login. |
| `NODE_ENV` | Cookies seguros/Swagger. |
| `DB_TYPE`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SYNCHRONIZE`, `DB_AUTOLOADENTITIES` | Conexão TypeORM. |
| `REDIS_HOST`, `REDIS_PORT` | Conexão Redis. |
| `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI` | OAuth e API Strava. |
| `STRAVA_WEBHOOK_VERIFY_TOKEN`, `STRAVA_WEBHOOK_CALLBACK_URL` | Assinatura e verificação do webhook. |
| `SECRET_KEY_JWT` | Assinatura do JWT (`insecure-dev-secret` como fallback). |
| `OPENAI_API_KEY` | IA e embeddings. |
| `ENCRYPTION_KEY` | Presente no `.env` de exemplo, mas **sem uso no código atual**. |

---

## 4. Modelo de dados

### 4.1 Entidades e colunas

#### `users`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | UUID v7. |
| `stravaId` | int unique | Identificador do atleta no Strava. |
| `name` | varchar | Nome completo. |
| `avatarUrl` | varchar nullable | Avatar do Strava. |
| `accessToken`, `refreshToken` | varchar | Tokens Strava. |
| `expiresAt` | timestamptz | Expiração do access token. |
| `birthDate` | date nullable | Usada nas políticas de idade. |
| `healthConsentAt` | timestamptz nullable | Consentimento de saúde. |
| `createdAt`, `updatedAt` | timestamptz | Auditoria. |

Relação: `users 1:N activities`.

#### `activities`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | UUID v7. |
| `activityStravaId` | bigint unique | ID da atividade no Strava. |
| `elapsed_time`, `moving_time` | int | Segundos. |
| `name`, `type`, `sport_type` | varchar | Tipo original do Strava. |
| `distance` | double precision | Metros. |
| `max_speed`, `average_speed` | double precision nullable | m/s. |
| `total_elevation_gain` | double precision nullable | Metros. |
| `average_cadence` | double precision nullable | Passos/min. |
| `start_date`, `start_date_local` | timestamptz nullable | UTC/local. |
| `timezone` | varchar nullable | Fuso do Strava. |
| `laps` | simple-json nullable | Voltas. |
| `average_heartrate`, `max_heartrate` | int nullable | bpm. |
| `max_watts` | int nullable | Potência. |
| `embedding` | vector(1563) nullable | Embedding do texto da atividade. |
| `userId` | FK users | `ON DELETE CASCADE`. |

Relação: `activities 1:N insights`; `activities 1:0..1 training_sessions`.

#### `insights`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | UUID v7. |
| `activityId` | uuid | Índice único (`@Index(['activityId'], { unique: true })`). |
| `content` | text | JSON serializado do insight. |
| `status` | varchar | `pending`, `completed`, `failed`. |
| `createdAt`, `updatedAt` | timestamptz | Auditoria. |

FK `activityId` → `activities.id` com `ON DELETE CASCADE`.

#### `goals`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | UUID v7. |
| `userId` | uuid | Escopo do atleta (sem FK explícita). |
| `title`, `discipline` | varchar | Prova e disciplina. |
| `targetDistance` | double precision | Metros. |
| `targetDate` | varchar | Data alvo em string. |
| `startDate` | varchar nullable | Início do ciclo. |
| `currentProgress` | double precision default 0 | Progresso acumulado. |
| `status` | varchar default `active` | `active`, `completed`, etc. |
| `runDays` | simple-json nullable | Dias de treino escolhidos. |
| `longRunDay` | varchar nullable | Dia do longão. |
| `daysPerWeek` | int default 3 | Derivado de `runDays` quando informado. |
| `threeKmTime` | int default 0 | Benchmark em segundos. |
| `targetTime` | int nullable | Tempo alvo em segundos. |
| `longestRunDistance`, `longestRunTime` | double/int nullable | Histórico declarado. |
| `createdAt`, `updatedAt` | timestamptz | Auditoria. |

Relação: `goals 1:N milestones` (cascade).

#### `milestones`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | UUID v7. |
| `goalId` | FK goals | `ON DELETE CASCADE`. |
| `description` | varchar | 25%, 50%, 75%. |
| `target` | double precision | Distância alvo do marco. |
| `achieved` | boolean default false | Conquistado. |
| `createdAt` | timestamptz | Auditoria. |

#### `training_plans`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | UUID v7. |
| `userId` | uuid | Escopo do atleta (sem FK explícita). |
| `weekStart` | varchar | ISO da segunda-feira. |
| `goalId` | uuid nullable | Meta que originou o plano. |
| `focus` | varchar nullable | Foco preenchido pela IA. |
| `coachNotes` | text nullable | Notas do plano. |
| `plannedWeeklyKm` | double precision nullable | Soma das sessões não-descanso. |
| `volumeAdjusted` | boolean default false | Ajuste automático aplicado. |
| `volumeAdjustedReason` | varchar nullable | Motivo. |
| `volumeAdjustedAt` | timestamptz nullable | Quando. |
| `createdAt`, `updatedAt` | timestamptz | Auditoria. |

Relação: `training_plans 1:N training_sessions` (cascade).

#### `training_sessions`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | UUID v7. |
| `planId` | FK training_plans | `ON DELETE CASCADE`. |
| `day` | varchar | `Dom`…`Sáb`. |
| `dayOrder` | int default 0 | Seg=0 … Dom=6. |
| `type` | varchar | `easy`, `interval`, `tempo`, `fartlek`, `long_run`, `rest`, `recovery`, `race`. |
| `plannedDistance` | double precision | Metros. |
| `plannedPace` | double precision | Segundos/km. |
| `notes` | varchar nullable | Descrição do treino. |
| `adjusted` | boolean default false | Ajuste de volume. |
| `adjustmentNote` | varchar nullable | Motivo do ajuste. |
| `completed` | boolean default false | Vínculo com atividade. |
| `activityId` | uuid nullable | FK activities `ON DELETE SET NULL`. |
| `actualDistance` | double precision nullable | Metros. |
| `actualPace` | double precision nullable | Segundos/km. |
| `actualMovingTime` | int nullable | Segundos. |
| `matchScore` | double precision nullable | Score do pareamento. |
| `matchMethod` | varchar nullable | `auto`, `ai`, `manual`. |
| `matchedAt` | timestamptz nullable | Quando vinculou. |

#### `coach_conversations`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | UUID v7. |
| `userId` | uuid | Escopo do atleta. |
| `title` | varchar nullable | Título automático. |
| `createdAt`, `updatedAt` | timestamptz | Auditoria. |

#### `coach_messages`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid PK | UUID v7. |
| `conversationId` | FK coach_conversations | `ON DELETE CASCADE`. |
| `role` | varchar | `user` ou `coach`. |
| `content` | text | Texto da mensagem. |
| `proposals` | jsonb nullable | Propostas validadas. |
| `rejections` | jsonb nullable | Rejeições. |
| `createdAt` | timestamptz | Auditoria. |

### 4.2 Observações de modelagem

- `goals.userId`, `training_plans.userId` e `coach_conversations.userId` são colunas UUID sem `@ManyToOne`; o filtro é feito na query.
- `activities.userId` e `training_sessions.activityId` usam `@JoinColumn`, então o nome físico da coluna é `userId`/`activityId`.
- A coluna `embedding` declara `length: 1563`, mas o modelo `text-embedding-3-small` gera 1536 dimensões. Tratar como dívida técnica.

---

## 5. Auth, sessão e usuários

### 5.1 `AuthSessionService`

Arquivo: `src/auth/auth-session.service.ts`.

Constantes:

- `SESSION_TTL = 7 dias`
- `SESSION_COOKIE = "user_session"`
- `AUTH_COOKIE = "veltra_auth"`

Fluxo de `resolveUserId(req)`:

1. Lê `req.cookies.user_session`.
2. Busca `app:session:<sessionId>` no Redis. Se existir, retorna o `userId`.
3. Se não houver sessão, lê `req.cookies.veltra_auth`.
4. Verifica o JWT (`userId` no payload).
5. Regrava a sessão no Redis com TTL de 7 dias (reutiliza o `sessionId` atual ou gera um novo).
6. Se nada funcionar, lança `UnauthorizedException("Sessão inválida ou expirada")`.

### 5.2 `SessionModule`

- Importa `RedisModule` e `JwtModule.registerAsync` com `SECRET_KEY_JWT`.
- Exporta `AuthSessionService`, `JwtModule` e `RedisModule`.
- Usado por módulos que não podem importar `AuthModule` (ciclos), como `UsersModule → ActivitiesModule`.

### 5.3 `AuthService`

Arquivo: `src/auth/auth.service.ts`.

- `generateStravaAuthUrl()` monta a URL do Strava com escopo `read,activity:read_all`.
- `handleStravaCallback(code)`:
  1. Troca o código por tokens.
  2. Chama `UsersService.createOrUpdate` (cria/atualiza usuário e sincroniza todas as atividades do Strava).
  3. Cacheia o token em `strava:token:<userId>` com TTL até a expiração.
  4. Gera `sessionId` UUID v4, grava `app:session:<id>` no Redis e assina JWT de 7 dias.
- `getUser(userId)`:
  - Busca o usuário; se não houver avatar, tenta obter do Strava.
  - Usa token do Redis, token ainda válido do banco ou refresh.
- `logout(sessionId)` remove `app:session:<id>`.

### 5.4 `AuthController`

| Rota | Comportamento |
|---|---|
| `GET /auth/strava/connect` | Redireciona ao Strava. |
| `GET /auth/strava/callback` | Grava cookies `user_session` e `veltra_auth` e redireciona ao frontend. |
| `GET /auth/me` | Resolve o usuário e retorna dados básicos. |
| `POST /auth/logout` | Remove a sessão do Redis e limpa cookies. |

Opções de cookie:

- `httpOnly: true`
- `secure: NODE_ENV === "production"`
- `sameSite: "none"` em produção, `"lax"` fora dela
- `maxAge` = TTL da sessão

### 5.5 `UsersService` / `UsersController`

| Rota | Comportamento |
|---|---|
| `GET /users/me` | Retorna perfil com `healthConsent: !!healthConsentAt`. |
| `PATCH /users/me` | Atualiza `birthDate` e `healthConsent`. |

Regras de `updateProfile`:

- `birthDate` é truncada em `YYYY-MM-DD`.
- Data inválida, anterior a 1900 ou futura → `BadRequestException`.
- `birthDate: null` ou `""` limpa o campo.
- `healthConsent` grava/limpa `healthConsentAt`.

`createOrUpdate`:

- Busca por `stravaId`; atualiza tokens/nome/avatar ou cria.
- Sempre busca as atividades do Strava e faz upsert de cada uma.
- Esse fluxo acontece no login e pode ser custoso para históricos grandes.

---

## 6. Activities

### 6.1 Endpoints

| Rota | Serviço | Regras |
|---|---|---|
| `POST /activities` | `create` | Usuário da sessão; erro se `activityStravaId` já existe. |
| `GET /activities` | `findAll` | `page` (padrão 1), `limit` (padrão 20), `period` (`week`, `month`, `year`, `all`), `year` (`YYYY`). |
| `GET /activities/years` | `findYears` | `EXTRACT(YEAR)` distinto, decrescente. |
| `GET /activities/:id` | `findOneForUser` | Aceita UUID ou ID Strava; sempre com `user.id`. |
| `GET /activities/:id/insight` | `InsightsService.getForActivity` | Exige dono da atividade. |
| `POST /activities/:id/insight` | `InsightsService.generateForActivity` | Gera/regenera. |

### 6.2 `ActivitiesService`

- `create`:
  - Verifica duplicidade por `activityStravaId` (sem escopo de usuário).
  - Salva a atividade.
  - Em background (`.catch`), gera embedding do texto e chama `insights.generateIfMissing`.
- `upsert`:
  - Se existir, atualiza campos básicos.
  - Campos que só vêm do detalhe (`laps`, `average_heartrate`, `max_heartrate`, `max_watts`) só são sobrescritos quando não são `null/undefined`.
  - Se não existir, cria sem gerar IA (`generateAI = false`).
- `findOneForUser`:
  - UUID → filtra `{ id, user: { id: userId } }`.
  - Caso contrário → `{ activityStravaId: Number(id), user: { id: userId } }`.
- `remove`: remove a atividade (cascade em insights; sessões ficam com `activityId = null`).

### 6.3 Embedding e insight

`generateInsightAndEmbedding`:

1. Monta prompt textual com nome, tipo, distância, tempos, velocidades, FC, cadência, elevação e watts.
2. `AiService.createEmbedding(prompt)` → `text-embedding-3-small`.
3. Atualiza `embedding` como JSON.
4. Gera insight se ainda não houver um `completed`.

> Não há endpoint que consulte `embedding`; a busca semântica não está exposta.

---

## 7. Integração Strava

### 7.1 `StravaService`

| Método | Integração |
|---|---|
| `exchangeCodeForTokens(code)` | `POST https://www.strava.com/oauth/token` (`authorization_code`). |
| `refreshAccessToken(refreshToken)` | `POST /oauth/token` (`refresh_token`). |
| `fetchActivityById(id, token)` | `GET /api/v3/activities/:id`; retorna `null` em 404. |
| `fetchAthleteAvatar(token)` | `GET /api/v3/athlete`. |
| `subscribePush`, `listPushSubscriptions`, `deletePushSubscription` | Subscription de webhook. |
| `fetchAllActivities(token)` | Paginação de 200 em 200; mantém apenas `type === "Run"` ou `sport_type === "Run"`. |

### 7.2 `StravaTokenService`

- Cache: `strava:token:<userId>`.
- Considera o token do banco válido se `expiresAt > agora + 60 s`.
- Renovação com lock `strava:refresh:<userId>`:
  - `SET NX EX 30`.
  - Quem não obtém o lock aguarda até 10 tentativas de 500 ms pelo token em cache.
- Após refresh, atualiza usuário e cache.
- `invalidate(userId)` remove o cache.

### 7.3 Webhook

Arquivo: `src/strava-webhook/strava-webhook.service.ts`.

Constantes:

- `QUEUE_KEY = "strava:events"`
- `FAILED_KEY = "strava:events:failed"`
- `DEDUP_TTL_SECONDS = 3600`
- `MAX_ATTEMPTS = 3`
- `WORKER_INTERVAL_MS = 1500`
- `BATCH_SIZE = 10`
- `RUN_SPORTS = ["Run", "TrailRun", "VirtualRun"]`

Fluxo:

1. `enqueue(event)` aceita apenas `object_type` `activity` ou `athlete`.
2. Deduplica por `strava:evt:<object_type>:<object_id>:<aspect_type>:<event_time>` usando `SET NX EX 3600`.
3. `LPUSH` na fila.
4. Worker `setInterval` chama `processQueue` a cada 1,5 s (não sobrepõe processamento).
5. Cada item é processado com até 3 tentativas e backoff linear (`1s × tentativa`).
6. Falha final vai para a lista de falhas.
7. `handleEvent`:
   - `athlete` + `authorized=false` → limpa tokens.
   - `activity` + `delete` → desvincula sessões e remove atividade.
   - `activity` + create/update → busca detalhe, ignora não-corridas, faz upsert, respeita vínculo manual, tenta parear e gera insight.

### 7.4 Resync e subscriptions

- `POST /strava/resync`:
  - `days` padrão 7.
  - Busca todas as atividades e filtra por `start_date >= cutoff`.
  - Para cada uma, tenta buscar detalhe somente se `has_heartrate`; caso contrário, usa o summary.
  - Faz upsert, tenta parear e gera insight se faltar.
- `GET/POST/DELETE /strava/subscription` exigem sessão, mas operam a subscription global da aplicação.

---

## 8. Training plans

Arquivo principal: `src/training-plans/training-plans.service.ts` (~2 mil linhas).

### 8.1 Endpoints

| Rota | Serviço |
|---|---|
| `GET /training-plans/current` | Plano da semana atual (segunda local). |
| `GET /training-plans` | Todos os planos do usuário. |
| `GET /training-plans/pattern` | Padrão de treino do atleta. |
| `GET /training-plans/by-week?weekStart=` | Plano de uma semana. |
| `POST /training-plans/regenerate` | Regenera a partir da meta ativa. |
| `PUT /training-plans/:planId/sessions/batch` | Atualização em lote (1–7 sessões). |
| `PUT /training-plans/:planId/sessions/:sessionId/activity` | Vínculo manual. |
| `PUT /training-plans/:planId/sessions/:sessionId` | Edição de uma sessão. |

### 8.2 Geração do plano

`regenerateForUser`:

1. Busca a meta ativa mais recente (`status = "active"`, ordenada por `createdAt DESC`).
2. Sem meta → `{ regenerated: false, reason: "no_active_goal" }`.
3. Chama `regenerateFromGoal(goal)`.

`regenerateFromGoal(goal, { startDate })`:

1. `startWeek` = segunda-feira da data de início.
2. Remove planos futuros do usuário a partir de `startWeek`.
3. `AthleteProfileService.build(userId, goal, now, { recentOnly: true })`.
4. Preferências de treino:
   - Tipos de qualidade ordenados por `pattern.typeMix`.
   - `primaryType`, `secondaryType`, repetições típicas e km principal típico (`max(1, typical.km - 3.5)`).
5. `totalWeeks = max(ceil((targetDate - startWeek) / 7 dias), 1)`.
6. `buildPaces` (detalhado em 8.3).
7. `buildVolumePlan` (detalhado em 8.4).
8. Resolve `runDays`, `longRunDay`, `daysPerWeek` e quantidade de estímulos de qualidade.
9. Para cada semana:
   - `phase = resolvePhase(...)`.
   - `isDeload = isDeloadWeek(...)`.
   - Seleciona treinos de qualidade da biblioteca, ajustados ao histórico.
   - Monta layout da semana.
   - Cria as sessões.
   - Persiste plano e sessões.
10. Junta notas da primeira semana: calibração, padrão, meta e idade.
11. Dispara enriquecimento por IA em background.
12. Faz backfill de atividades recentes (desde `startWeek - 1 dia`, até 50, só corrida, sem vínculo existente).

### 8.3 Cálculo de paces

Constantes:

- `MIN_PACE = 150` s/km
- `MAX_PACE = 600` s/km
- `MIN_EASY_KM = 3`
- `MAX_QUALITY_MAIN_RATIO = 0.2`

Passos:

1. `threeKmPace = clamp(threeKmTime / 3, 150, 420)` se houver teste.
2. `shortRef = min(threeKmPace, profile.bestShortPace)`.
3. `interval`:
   - Candidatos: `shortRef × 1.03` e `pattern.typicalQuality.interval.repPace × 1.02`.
   - Usa o menor; se não houver, default por nível:
     - beginner 340, novice 320, intermediate 295, advanced 275.
4. `threshold`:
   - `shortRef × (10/3)^0.06`.
   - Considera também `profile.bestMediumPace`, `pattern.typicalQuality.tempo.repPace` e `intervalBase + 5`.
   - Usa o maior, clamp `160..470`.
5. `interval` final = `clamp(min(intervalBase, threshold - 15), 150, 430)`.
6. `easy`:
   - Se `pattern.easyPace > threshold`, usa o pace demonstrado; senão `threshold + 65`.
   - Garante pelo menos `threshold + 35`; clamp `300..520`.
7. `recovery = clamp(easy + 20, 320, 540)`.
8. `goal`:
   - Referências: 3 km (teste), 4 km (melhor curto), 7,5 km (melhor médio), 12 km (melhor longo).
   - Escolhe a referência mais próxima em escala logarítmica.
   - `predictRacePace = ref.pace × (raceKm / ref.km)^0.06`.
   - Piso por distância da prova:
     - ≤ 11 km: `threshold - 10`
     - ≤ 22 km: `threshold + 5`
     - > 22 km: `threshold + 25`
   - Clamp entre `interval + 5` e `threshold + 120`.
9. Se houver `targetTime`:
   - `assessRaceTarget` calcula tempo previsto, melhora necessária e veredito.
   - Ganho máximo por nível: beginner 8%, novice 6%, intermediate 4%, advanced 3%, escalado por `min(1, semanas/12)`.
   - Vereditos: `conservadora`, `realista`, `agressiva`, `improvavel`.
   - `goalPace = clamp(realisticPace, interval + 5, min(threshold + 120, 600))`.

### 8.4 Volume e longão

Tabelas de pico semanal (`peakWeeklyVolume`):

| Nível | 5 km | 10 km | 21,1 km | 42,2 km |
|---|---|---|---|---|
| beginner | 18 | 25 | 35 | 45 |
| novice | 22 | 30 | 40 | 55 |
| intermediate | 25 | 35 | 50 | 65 |
| advanced | 28 | 40 | 60 | 80 |

Tetos de longão (`longRunCap`):

| Nível | 5 km | 10 km | 21,1 km | 42,2 km |
|---|---|---|---|---|
| beginner | 8 | 12 | 15 | 25 |
| novice | 10 | 14 | 18 | 28 |
| intermediate | 12 | 16 | 21 | 32 |
| advanced | 14 | 18 | 24 | 35 |

Cálculo:

1. `longStart`:
   - Longão típico do padrão, se ≤ teto.
   - Senão, maior corrida registrada, limitada ao teto.
   - Senão, `tablePeak × 0.2`.
   - Clamp mínimo 4 km e máximo `longCap`.
2. `weeklyForLong(long) = long / 0.62`.
3. `recentWeekly` = volume recente ou `max(10, tablePeak × 0.5)`.
4. `targetFromTable = min(max(tablePeak, recentWeekly × 1.15), recentWeekly × 1.5)`.
5. `demonstratedPeak` = `min(profile.peakWeeklyKm, tablePeak × 1.1)`.
6. Com ajuste de idade, o teto semanal não ultrapassa `tablePeak`.
7. `startWeekly = min(max(recentWeekly, fallback × 0.7, weeklyForLong(longStart)), weeklyCeiling)`.
8. Semana a semana:
   - Taper nas 2 últimas semanas (penúltima 0,75; última 0,55).
   - Deload quando `weekIndex % 4 === 3`, depois da primeira e antes do taper.
   - Crescimento normal de 10%; 5% na reentrada após deload; 0% na primeira semana.
   - Longão sempre limitado ao teto.

### 8.5 Fases

`resolvePhase(weekIndex, totalWeeks, fastStart)`:

- Últimas 2 semanas → `taper`.
- `baseWeeks = max(1, round(totalWeeks × (fastStart ? 0.1 : 0.25)))`.
- `peakWeeks = max(2, round(totalWeeks × 0.15))`.
- Se `weekIndex >= totalWeeks - 2 - peakWeeks` → `peak`.
- Caso contrário → `build`.

`fastStart` = perfil tem dados e nível `intermediate` ou `advanced`.

### 8.6 Quantidade de qualidade e layout

`qualitySessionsPerWeek`:

- Máximo 1 se `runDays.length <= 3`; senão 2.
- Beginner: 1.
- Outros: usa `round(pattern.qualityPerWeek)` se > 0; fallback novice 1, demais 2.
- Sempre entre 1 e o máximo; limitado por `maxQualitySessions` do ajuste por idade.

`buildWeekLayout`:

1. `trainingDays` = união de `runDays` + `longRunDay`, ordenada por `DAY_ORDER`.
2. Se exceder `daysPerWeek`, remove dias de forma determinística (seed `weekIndex × 7`), preservando o longão.
3. Escolhe o dia de qualidade preferindo maior `qualityDayRate` e espaçamento ≥ 2 dias do longão.
4. Se houver 2 qualidades, a segunda evita o dia da primeira e busca espaçamento.
5. Escolhe recuperação adjacente ao longão ou à última qualidade, com preferência histórica.
6. Demais dias de treino → `easy`; demais dias da semana → `rest`.

### 8.7 Construção das sessões

- Dia da prova (`findRaceDay`) → `race` com distância da meta.
- Véspera da prova → `easy` de 4 km.
- Dias após a prova → `rest`.
- `rest` → distância/pace zero.
- Longão → `long_run` com notas progressivas e blocos no pace da prova conforme distância.
- Qualidade → treino selecionado com aquecimento (2 km), desaquecimento (1,5 km) e volume principal; fartlek/strides usam 1,5 km/1 km.
- Easy/recovery → distribui o volume restante; mínimo 2 km por sessão arredondado a 100 m.
- Qualidade principal limitada a 20% do volume semanal (`qualityMainScale`).
- Deload reduz qualidade para 60% quando o treino não vem do histórico.
- Notas recebem zona de FC (`easy/recovery/long_run` → Z2; `tempo/fartlek` → Z3; `interval/race` → Z4) e faixa de bpm quando há FC máxima.
- Notas finais são truncadas em 500 caracteres ao receber dicas da IA.

### 8.8 Edição de sessão

`updateSession`:

1. Busca plano por `{ id: planId, userId }`.
2. Busca sessão por `{ id: sessionId, planId }`.
3. Se `plannedDistance > 0`, aplica política de idade:
   - `assessDistanceForAge`.
   - `planAgeAdjustment` (teto de longão).
   - Bloqueia com `{ code: "AGE_POLICY", ... }` se exceder e `acknowledgeAgePolicy` não vier.
4. Se mudar o dia, rejeita se o dia já tiver outra sessão no plano (`DAY_COLLISION`).
5. Aplica mudanças; se `type === "rest"`, zera distância/pace.
6. Salva.

`updateSessionsBatch`:

1. Plano escopado por usuário.
2. Aceita de 1 a 7 itens; valida que todas as sessões pertencem ao plano.
3. Valida política de idade para cada item com distância.
4. Simula o estado final de dias e rejeita qualquer duplicata (incluindo sessões fora do lote).
5. Aplica tudo em transação; se qualquer item falhar, nada é salvo.

### 8.9 Pareamento de atividades

`ActivityMatcherService`:

1. Ignora se houver vínculo manual.
2. Remove vínculos automáticos anteriores da atividade.
3. Extrai features (laps ≥ 200 m, variabilidade de pace, voltas rápidas, formato, reps no nome).
4. Carrega planos de `-7`, `0` e `+7` dias.
5. Ignora `rest`, sessões já vinculadas e dias com diferença > 2.
6. Score:
   - dia 25%, distância 20%, pace 10%, formato 30%, nome 15%.
   - Penaliza formato incompatível, distância incompatível e dia distante.
7. Auto-match se `score >= 0.6` (ou `0.55` quando formato é fortemente compatível) e margem ≥ 0,08 sobre o segundo.
8. Se `score >= 0.4`, tenta desempate por IA entre os 3 melhores.
9. Ao vincular:
   - `completed = true`
   - `actualDistance`, `actualPace`, `actualMovingTime`
   - `matchMethod` (`auto`/`ai`/`manual`)
   - `matchedAt`
   - dispara `VolumeAdjustmentService.adjustForOvershoot`.

### 8.10 Ajuste de volume por excesso

`VolumeAdjustmentService.adjustForOvershoot`:

- Só atua no plano da semana atual.
- Dispara se `actual - planned >= 1 km` e o excesso for > 15%.
- Calcula:
  - `baseline` = `plannedWeeklyKm` ou soma das sessões não-descanso.
  - `projected` = km já realizados + km restantes.
  - `ceiling = baseline × 1.05`.
- Corta o excesso nas sessões restantes, nesta prioridade:
  - `recovery` / `easy` (prioridade 0)
  - `long_run` (1)
  - `interval` / `tempo` / `fartlek` (2)
- Pisos:
  - longão: 60% do planejado, mínimo 3 km;
  - qualidade: até 10% de corte;
  - demais: mínimo 3 km.
- Marca sessões com `adjusted` e `adjustmentNote`; marca o plano com `volumeAdjusted`, motivo e data.

### 8.11 Perfil do atleta

`AthleteProfileService.build`:

- Janela de esforço: 180 dias.
- Considera apenas `Run`/`sport_type Run`, distância ≥ 1 km e `moving_time > 0`.
- **Forma recente**: 3 semanas anteriores à semana atual.
  - `hasData` se ≥ 3 corridas.
  - `weeklyKm` = mediana dos totais semanais.
- **Base de análise**:
  - Se forma recente tem dados → usa as 3 semanas.
  - Senão → usa todo o histórico.
  - Com `recentOnly` e sem forma recente → ignora histórico (plano parte do teste de 3 km e preferências).
- **Nível** por volume/maior corrida:
  - advanced: ≥ 25 km de longão ou ≥ 60 km/semana
  - intermediate: ≥ 15 km ou ≥ 35 km/semana
  - novice: ≥ 8 km ou ≥ 18 km/semana
  - beginner: caso contrário
- **Nível pelo teste de 3 km**:
  - pace ≥ 420 → beginner
  - ≥ 350 → novice
  - ≥ 290 → intermediate
  - < 290 → advanced
- Se houver teste, usa o **pior** entre nível de volume e nível do teste.
- Paces: melhor curto (3–5,5 km), médio (5,5–10,5 km), longo (> 10,5 km).
- FC máxima: maior valor observado; FC prevista por Tanaka.

### 8.12 Padrão de treino

`buildTrainingPattern`:

- Janela padrão de 12 semanas.
- Filtra corridas ≥ 1 km e pace entre 150 e 600 s/km.
- Longão de referência: `max(6, percentil 80 das distâncias)`.
- Classifica cada corrida por nome/formato.
- Calcula:
  - corridas/semana (mediana)
  - qualidade/semana (mediana)
  - taxa por dia da semana
  - dias preferidos de corrida (taxa ≥ 50%)
  - dia preferido de longão (≥ 2 ocorrências)
  - dias preferidos de qualidade
  - mix de tipos
  - qualidade típica (contagem, km, pace, pace de tiro, reps)
  - pace leve típico
  - longão típico
- Confiança:
  - high: ≥ 24 corridas, ≥ 8 semanas, lap coverage ≥ 50%
  - medium: ≥ 10 corridas e ≥ 4 semanas
  - low: caso contrário

---

## 9. Goals

`GoalsService`:

- `create`:
  - Normaliza `startDate`.
  - `status = "active"`.
  - Se `runDays` vier, `daysPerWeek = runDays.length`.
  - Cria milestones de 25%, 50% e 75% com `achieved` conforme `currentProgress`.
  - Tenta gerar plano com `startDate` do ciclo.
- `update`:
  - Busca meta escopada por usuário.
  - Aplica campos e normaliza `startDate`.
  - Regenera plano se possível:
    - `startDate` do ciclo, se futuro;
    - senão, próxima segunda se a semana atual tiver sessões concluídas;
    - senão, hoje.
- `delete`:
  - Remove meta por `{ id, userId }`.
  - Remove planos futuros daquela meta.
- `findAll` / `findOne`: sempre com `userId`, incluindo milestones.

---

## 10. Insights e aderência

`InsightsService`:

- `getForActivity(activityId, userId)`:
  - Confirma que a atividade pertence ao usuário.
  - Retorna insight da atividade ou `null`.
- `generateForActivity(activity, userId)`:
  1. Cria ou reutiliza o insight e marca `pending`.
  2. Monta contexto:
     - dados da corrida e classificação;
     - treino planejado vinculado e aderência;
     - meta ativa;
     - perfil recente;
     - idade, FC prevista, limite por idade e recomendação médica.
  3. Chama a IA (`generateActivityInsight`).
  4. Sucesso → `content = JSON.stringify`, `status = "completed"`.
  5. Falha → `status = "failed"`.
- `generateIfMissing`: só gera se não houver insight `completed`; falhas são logadas e não propagam.
- `getRecentForUser`:
  - Apenas `status = "completed"`, com `relations: ["activity"]`, ordenado por `createdAt DESC`, limite padrão 20.
  - Busca sessões vinculadas para calcular aderência.
  - Retorna dados da atividade + `verdict`.

`assessAdherence`:

| Distância | Pace | Veredito |
|---|---|---|
| ≤ 10% | ≤ 5% | `no_plano` |
| ≤ 20% | ≤ 10% | `proximo` |
| acima | acima | `diferente` |

Qualquer campo ausente/zero → `null`.

---

## 11. Coach

Arquivo: `src/coach/coach.service.ts`.

### 11.1 Limites

- Histórico: 20 mensagens.
- Atividades recentes: 10.
- Planos futuros: 3.
- Propostas por resposta: 5.
- Notas por mudança: 300 caracteres.
- Distância: ±25% (quando já há treino).
- Pace: ±10%.

### 11.2 Endpoints

| Rota | Comportamento |
|---|---|
| `GET /coach/chat` | Sem `conversationId` lista conversas; com ID retorna mensagens. |
| `POST /coach/chat` | Resposta completa (sem streaming). |
| `DELETE /coach/chat` | Apaga todas as conversas e mensagens do usuário. |
| `POST /coach/chat/stream` | SSE com `token`, `done` e `error`. |

### 11.3 Contexto enviado à IA

1. Data de hoje em pt-BR.
2. Perfil: nível, volume recente, maior corrida, corridas/semana, melhores paces.
3. Idade, FC prevista, últimas 3 semanas e limite por idade.
4. Meta ativa: distância, data, tempo alvo, pace.
5. Plano atual e próximas semanas:
   - Cada sessão futura recebe um número `[N]`.
   - Sessões passadas aparecem como `(passado)` e não podem ser alteradas.
   - Inclui dia, tipo, distância, pace e notas.
6. Próximo longão.
7. Alertas de saúde.

### 11.4 Prompt do sistema

Regras principais:

- Metodologia 80/20.
- Progressão de volume máxima de 10% por semana.
- Nunca inventar dados.
- Responder em pt-BR e markdown.
- Listar apenas sessões futuras ao apresentar o plano.
- Propostas só em bloco `<proposta>`, com até 5 itens.
- Uma sessão por item; swaps precisam incluir a contrapartida.
- Ativar descanso exige tipo, distância e pace.
- Nunca afirmar que aplicou; apenas propor.
- Segurança: sem diagnóstico, orientação de emergência em sintomas agudos, respeitar limite por idade.

### 11.5 Parsing de propostas

`AiService.splitCoachReply`:

- Regex `<proposta>([\s\S]*?)<\/proposta>`.
- Remove o bloco do texto visível.
- Remove code fences e trailing commas.
- Aceita array ou objeto único.
- Limita a 5 itens.
- `malformed = true` se JSON inválido, item sem `session` numérica ou mais de 5 itens.

### 11.6 Retentativa silenciosa

Se nenhuma proposta foi aceita e:

- o texto contém termos como `aplicar`, `proposta`, `vou ajustar`; ou
- o modelo gerou bloco malformado; ou
- havia propostas brutas, mas todas foram rejeitadas;

o backend faz uma segunda chamada pedindo **somente** o bloco `<proposta>`, sem alterar o texto já enviado.

### 11.7 Validação

Códigos de rejeição:

| Código | Motivo |
|---|---|
| `INVALID_SESSION` | Sessão não está entre as futuras listadas ou não pertence ao usuário. |
| `PAST_OR_REST` | Sessão já passou. |
| `OUT_OF_RANGE` | Distância/pace fora dos limites. |
| `AGE_CAP` | Distância acima do limite por idade. |
| `EMPTY_CHANGES` | Nenhuma mudança válida; ativação sem distância/pace. |
| `MALFORMED` | Bloco inválido, sessão repetida ou item sem número. |
| `DAY_COLLISION` | Estado final teria duas sessões no mesmo dia. |

Regras adicionais:

- Ativar descanso: distância absoluta até 100 km e pace até 900 s/km; limite por idade continua valendo.
- Desativar treino: distância/pace enviados são ignorados.
- Colisão de dia é avaliada no estado final do plano, não apenas dentro do lote.
- Sessão repetida no mesmo pedido: só a primeira é considerada.

### 11.8 Streaming

`CoachController.streamMessage`:

- Define headers `text/event-stream`, `no-cache`, `keep-alive`.
- `token` → `{ token }`.
- `done` → `{ conversationId, message, proposal, proposals, rejections }`.
- `error` → mensagem genérica.
- `res.end()` no `finally`.

No frontend, `streamCoachMessage` lê o body via `ReadableStream`, separa frames por `\n\n` e faz o parse de `event:`/`data:`.

---

## 12. AI service

Arquivo: `src/ai/ai.service.ts`.

| Função | Modelo | Temperatura | Timeout |
|---|---|---|---|
| `createEmbedding` | `text-embedding-3-small` | — | não explícito |
| `generateInsight` | `gpt-4o-mini` | 0 | não explícito |
| `generateCoachReplyStream` | `gpt-4o-mini` | 0.3 | 60 s |
| `generateActivityInsight` | `gpt-4o-mini` | 0.3 | 30 s |
| `generatePlanReview` | `gpt-4o-mini` | 0.2 | 45 s |
| `classifyActivityMatch` | modelo do serviço | — | 20 s |

Sem `OPENAI_API_KEY`, as funções retornam `null` (e o fluxo segue sem IA).

Parsing:

- `parseActivityInsight`: extrai o primeiro `{` até o último `}`, valida `summary`, `performance` e `workoutType`; `tips` vira array de até 6 strings.
- `splitCoachReply`: descrito em 11.5.
- `generatePlanReview`: JSON com `overview` e `weeks[]`.

---

## 13. Health

Arquivo: `src/health/age-policy.ts`.

### 13.1 Regras de distância por idade

| Faixa | Distância | Idade mínima | Liberação médica abaixo de |
|---|---|---|---|
| até 5 km | 0–5 km | 12 | 14 |
| 5–10 km | 5–10 km | 14 | 16 |
| 10–21,1 km | 10–21,1 km | 16 | 18 |
| acima de 21,1 km | > 21,1 km | 18 | 18 |

### 13.2 Ajustes de plano

| Idade | Ajuste |
|---|---|
| ≤ 13 | Longão ≤ 6 km, volume ≤ 20 km/semana, 1 estímulo forte. |
| 14–15 | Longão ≤ 8 km, volume ≤ 25 km/semana, 1 estímulo forte. |
| 16–17 | Longão ≤ 10 km, volume ≤ 35 km/semana, 1 estímulo forte. |
| ≥ 60 | Volume × 0,9, no máximo 2 estímulos fortes. |

### 13.3 Alertas

`GET /health/alerts` analisa até 180 dias e retorna alertas ordenados por severidade (`medical` → `attention` → `info`):

| Alerta | Regra |
|---|---|
| Distância por idade | Corridas nos últimos 30 dias acima do permitido para a idade (até 2 alertas). |
| Aumento brusco de volume | Semana atual ≥ 10 km e > 30% acima da média das até 4 semanas anteriores. |
| Salto no longão | Maior corrida dos últimos 7 dias ≥ 8 km e > 15% acima da maior das 3 semanas anteriores. |
| FC acima da prevista | Últimos 14 dias, FC máxima > FC prevista + 5 bpm. |
| Muita intensidade | Últimos 7 dias, ≥ 15 km e > 30% em intensidade forte. |
| Estímulos em dias seguidos | Dois treinos fortes em dias consecutivos nos últimos 14 dias. |
| Primeira distância | Primeira vez acima de 10 / 21,1 / 42,2 km nos últimos 30 dias. |
| Check-up | Recomendação por faixa de idade (35, 45, 60+). |

`isHardRun` = tipo `interval`, `tempo` ou `fartlek`, ou FC média ≥ 85% da FC máxima prevista.

`GET /health/policy?distanceKm=` retorna idade, FC prevista, ajuste de plano, regras de distância, avaliação da distância informada, recomendação de check-up e disclaimer.

---

## 14. Analytics

`AnalyticsService.getWeeklyStats(userId)`:

1. `weekStart` = segunda-feira da semana atual, 00:00 local.
2. `weekEnd` = segunda seguinte.
3. Busca atividades do usuário com `start_date` entre as datas.
4. Retorna:
   - `totalDistance` (metros)
   - `totalTime` (segundos)
   - `runCount`
   - `weekStart` (ISO)

Sem filtro por tipo: conta todas as atividades do período.

---

## 15. Achievements

Arquivo: `src/achievements/achievement-rules.ts`.

`AchievementsService.getAchievements(userId)` busca corridas (`type` ou `sport_type` = `Run`) ordenadas por data e retorna:

### 15.1 Troféus

| Troféu | Critério |
|---|---|
| Primeiro Passo | Primeira corrida. |
| Centenário | 100 km acumulados. |
| Maratonista | Corrida ≥ 42,195 km. |
| Consistente | 12 semanas consecutivas com corrida. |
| Velocista | 5 km abaixo de 20 minutos. |

### 15.2 Melhores tempos

- Distâncias: 3, 5, 10, 15, 21,0975 e 42,195 km.
- Considera qualquer corrida com distância ≥ alvo.
- Pace válido entre 150 e 600 s/km.
- Tempo estimado = pace × distância.

### 15.3 Previsões

- Considera corridas dos últimos 90 dias com pace válido.
- Projeta cada distância com a fórmula de Riegel: `t2 = t1 × (d2/d1)^1.06`.
- Retorna a melhor projeção por distância.

---

## 16. Redis e processamento assíncrono

| Chave | Conteúdo | TTL |
|---|---|---|
| `app:session:<sessionId>` | `userId` | 7 dias |
| `strava:token:<userId>` | access token | até expiração − 60 s |
| `strava:refresh:<userId>` | lock de refresh | 30 s |
| `strava:events` | fila de eventos | sem TTL |
| `strava:events:failed` | eventos que falharam | sem TTL |
| `strava:evt:<...>` | deduplicação de webhook | 1 h |

`RedisService` expõe `set`, `get`, `del`, `setNx`, `lpush`, `rpop` e `llen`.

---

## 17. Frontend

### 17.1 App Router

- `src/app/layout.tsx`: metadata, `lang="pt-BR"`, `globals.css`.
- `src/app/page.tsx`: entrada (redireciona/fluxo de login).
- `src/app/login/page.tsx`: botão de login com Strava.
- `src/app/(authenticated)/layout.tsx`:
  - `AuthProvider` + `AuthGuard`.
  - Sidebar fixa + `<main>` com scroll.
- Todas as páginas autenticadas são client components com `useEffect`.

### 17.2 Autenticação no frontend

`use-auth.tsx`:

- Estados: `loading`, `authenticated`, `unauthenticated`.
- `getAuthUser()` chama `GET /auth/me`.
- Se falhar, usa `localStorage.veltra_user` como fallback otimista.
- `signIn` redireciona para `NEXT_PUBLIC_API_URL/auth/strava/connect`.
- `signOut` chama `POST /auth/logout`, limpa localStorage e estado.
- `refreshUser` revalida o usuário.

`AuthGuard` redireciona para `/login` quando `unauthenticated`.

### 17.3 Client HTTP

`src/lib/api/client.ts`:

- `BASE_URL = NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1"`.
- `credentials: "include"`.
- `Content-Type: application/json` somente quando há body.
- Resposta convertida recursivamente de `snake_case` para `camelCase`.
- Erro lançado como `{ status, message }`.
- Métodos: `get`, `post`, `put`, `patch`, `del`.

Módulos por domínio:

- `activities.ts`, `training.ts`, `insights.ts`, `coach.ts`, `achievements.ts`, `analytics.ts`, `goals.ts`, `health.ts`, `users.ts`, `auth.ts`.
- Muitos métodos capturam erro e retornam `null`/`[]` para simplificar estados de página.

### 17.4 Chat do coach

`coach.ts`:

- `getConversations`, `getConversationMessages`, `deleteAllConversations`.
- `streamCoachMessage` faz `fetch` manual e parse de SSE.
- Resultado final inclui mensagem, propostas e rejeições.

`coach/chat/page.tsx`:

- Exibe mensagens em markdown (`react-markdown` + `remark-gfm`).
- Renderiza cards de proposta com diff e botões aplicar/descartar.
- Aplica uma proposta via `applySessionChange` ou todas via `applySessionsBatch`.
- Mostra rejeições e mensagens de erro.

### 17.5 Design system

`src/app/globals.css` define os tokens:

- Cores: `primary*`, `secondary*`, `tertiary*`, `surface*`, `on-surface*`, `error*`, `outline*`.
- Fontes: `--font-sora` (títulos) e `--font-geist` (corpo).
- Raios: `--radius-sm` … `--radius-full`.
- Espaçamentos: `--spacing-unit`, `--spacing-gutter`, `--spacing-card-gap`.

Componentes em `src/components/ui`:

- `button`, `performance-card`, `data-display`, `stat-item`, `metric-chip`, `progress-bar`, `alert-dialog`, `insight-sections`, `health-alerts`.

Constantes visuais:

- `training-display.ts`: `typeColors`, `typeLabels`, `typeIcons`, `DAY_ORDER`.
- `achievement-display.ts`: categorias, badges, progresso.
- `format.ts`: pace, tempo, distância, datas e números em pt-BR.

### 17.6 Páginas e dados

| Página | Fontes de dados |
|---|---|
| Dashboard | `getActivities`, `getTrainingPlan`, `getPlanByWeek`, `getWeeklyStats`, `getHealthOverview`. |
| Plano | `getAllPlans`, `regeneratePlan`, `updateSession`, `linkSessionActivity`, `getHealthPolicy`. |
| Atividades | `getActivitiesPaginated`, `getActivityYears`. |
| Detalhe | `getActivity`, `getActivityInsight`, `generateActivityInsight`, `getHealthOverview`. |
| Análises | `getAllActivities` (apenas elevação total); gráficos usam constantes estáticas. |
| Comparação | `getActivities`. |
| Meta | `getGoals`, `createGoal`, `updateGoal`, `deleteGoal`, `getHealthPolicy`, `getTrainingPattern`. |
| Conquistas | `getAchievements`. |
| Insights | `getInsightsFeed`. |
| Perfil | `getProfile`, `updateProfile`, `getHealthPolicy`. |
| Coach | `getConversations`, `getConversationMessages`, `streamCoachMessage`, `applySessionChange`, `applySessionsBatch`. |

---

## 18. Verificação, scripts e testes

### 18.1 Frontend

| Comando | Uso |
|---|---|
| `npm run dev` | Dev server (o usuário mantém rodando; não iniciar/encerrar). |
| `npx tsc --noEmit` | Typecheck. |
| `npm run build` | Build de produção (nunca no diretório real com dev server ativo). |

- Não há ESLint configurado; `npm run lint` (`next lint`) é interativo e não deve ser usado.
- Para validar build sem quebrar o `.next` do usuário, copiar o projeto para `/tmp/opencode` com `node_modules` simbólico.

### 18.2 Backend

| Comando | Uso |
|---|---|
| `npm test` | Jest completo. |
| `npx jest <paths>` | Apenas os specs tocados. |
| `npx eslint <paths>` | Lint dos arquivos alterados. |
| `npm run build` | Build Nest. |

Configuração Jest:

- `rootDir: src`
- `testRegex: .*\.spec\.ts$`
- `moduleNameMapper`: `^src/(.*)$` e `^uuid$` → mock.

Falhas pré-existentes conhecidas (DI incompleta):

- `auth.service.spec`
- `auth.controller.spec`
- `users.service.spec`
- `insights.service.spec`

Baseline: ~4 suítes falhando. Não corrigir sem pedido explícito.

### 18.3 Testes existentes

- Backend: specs unitários por módulo, com destaque para `training-plans`, `coach`, `activity-matcher`, `health`, `achievements`, `adherence` e `activity-features`.
- Frontend: não há suíte de testes automatizados no repositório.

### 18.4 Pipelines GitHub Actions

#### Frontend — `.github/workflows/frontend-ci.yml`

- Repositório: `veltra-frontend` (raiz).
- Gatilhos: `push` e `pull_request` para `main` com mudanças em `veltra-frontend/**` ou no próprio workflow; `workflow_dispatch`.
- Runner: `ubuntu-latest`, Node 20, cache `npm` por `veltra-frontend/package-lock.json`.
- Job `quality`:
  1. `npm ci`.
  2. `npx tsc --noEmit`.
  3. `npm run build`.
- `NEXT_TELEMETRY_DISABLED=1`.
- Concorrência por ref com `cancel-in-progress: true`.

#### Backend — `.github/workflows/backend-ci.yml`

- Repositório: `veltra-backend` (repo próprio).
- Gatilhos: `push` e `pull_request` para `main` e `develop`; `workflow_dispatch`.
- Runner: `ubuntu-latest`, Node 20, cache `npm`.
- Checkout com `fetch-depth: 0` para permitir o diff de lint.
- Job `quality`:
  1. `npm ci`.
  2. Lint incremental: descobre os arquivos `src/**/*.ts` e `test/**/*.ts` alterados via `git diff` contra a base do PR (ou o commit anterior no push) e roda `npx eslint` apenas neles. Se não houver base de diff, o lint é ignorado.
  3. `npm run build`.
  4. `npx jest --runInBand` ignorando as 4 suítes de DI conhecidas (`auth.service.spec`, `auth.controller.spec`, `users.service.spec`, `insights.service.spec`).
- Concorrência por ref com `cancel-in-progress: true`.

#### Regras de CI/CD

- Nenhum pipeline inicia `npm run dev`.
- Containers de Postgres/Redis, quando necessários, devem ser efêmeros (services do runner), nunca os containers locais do usuário.
- Segredos vêm de secrets/variáveis do GitHub, nunca do repositório.
- O deploy/CD automático ainda não está configurado; depende da definição do alvo de hospedagem e de migrations.

---

## 19. Receitas de extensão

### 19.1 Novo endpoint autenticado

1. Criar DTO com `class-validator` se houver body/query.
2. No controller, resolver `userId` via `AuthSessionService.resolveUserId(req)`.
3. No service, filtrar sempre por `user: { id: userId }` ou `userId`.
4. Adicionar a rota à tabela da API no HLD.
5. Documentar regras/contrato no LLD.
6. Criar/atualizar spec quando o comportamento for não trivial.

### 19.2 Nova entidade

1. Criar entity com `@PrimaryColumn("uuid")`, `@BeforeInsert` gerando `uuidv7()`.
2. Definir relações e `onDelete` coerentes.
3. Garantir que o módulo registre a entidade em `TypeOrmModule.forFeature`.
4. Atualizar o modelo de dados no HLD e LLD.
5. Se houver nova coluna sensível, não logar valores.

### 19.3 Nova página no frontend

1. Criar `src/app/(authenticated)/<rota>/page.tsx` como client component.
2. Buscar dados em `useEffect` com flag `active` para evitar updates após unmount.
3. Tratar carregamento, vazio e erro.
4. Reutilizar `Header`, `PerformanceCard`, `DataDisplay`, `StatItem` e helpers de `lib/format.ts`.
5. Adicionar o item em `components/sidebar.tsx`.
6. Reutilizar `training-display.ts` em vez de duplicar cores/labels de treino.
7. Atualizar a tabela de páginas no HLD.

### 19.4 Nova regra de IA

1. Definir o contexto em um builder puro (como `activity-insight-context.ts`).
2. Adicionar prompt e parsing em `ai.service.ts`.
3. Nunca permitir que a IA grave direto no banco.
4. Se gerar proposta, validar no service de domínio antes de expor.
5. Documentar os limites e códigos de rejeição no LLD.

---

## 20. Lacunas e cuidados conhecidos

- **Dados estáticos em Análises**: os gráficos de distância semanal, ritmo e zonas de FC ainda usam constantes de demonstração.
- **Embedding sem busca**: o vetor é gerado, mas não há consulta por similaridade.
- **Dimensão do vetor**: `1563` na entidade vs `1536` do modelo.
- **Sincronização no login**: `UsersService.createOrUpdate` importa todo o histórico; em contas grandes pode demorar.
- **Worker do webhook**: roda no processo da API; não há garantia de processamento único entre múltiplas instâncias (a fila Redis evita perda, mas não coordena concorrência).
- **Eventos falhos**: ficam em `strava:events:failed` sem painel/retry automático.
- **Consentimento de saúde**: as políticas de idade são aplicadas mesmo sem consentimento registrado.
- **`ENCRYPTION_KEY`**: variável presente no exemplo, sem uso no código.
- **Observabilidade**: apenas logs de erro; sem métricas ou tracing.
- **Testes do backend**: baseline com 4 suítes falhando por DI; o CI as ignora até serem corrigidas.
- **Lint do backend**: baseline com erros pré-existentes; o CI faz lint apenas dos arquivos TS alterados.
- **Lint do frontend**: não configurado.
- **CD/deploy**: o CI existe, mas não há deploy automático nem migrations versionadas.
- **Código de erro no frontend**: o client HTTP não lê o body de erro, então `code` (ex.: `AGE_POLICY`, `DAY_COLLISION`) não chega às telas.
- **`GET /analytics/weekly`**: não filtra por tipo de atividade, embora a UI trate como corrida.

---

## 21. Referências

- [HLD — High-Level Design](./hld.md)
- [AGENTS.md](../AGENTS.md)
- [README do frontend](../veltra-frontend/README.md)
- [README do backend](../veltra-backend/README.md)
