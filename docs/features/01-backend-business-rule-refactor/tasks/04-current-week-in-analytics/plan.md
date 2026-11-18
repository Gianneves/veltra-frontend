# Plano da F01-T04: Semana atual da análise

Tarefa: [task.md](task.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dado que hoje é quarta-feira no fuso local do servidor, quando o atleta pede a análise semanal, então o limite inferior da consulta é a segunda-feira 00:00 local, o limite superior é a segunda seguinte 00:00 local e o `weekStart` devolvido é essa segunda em ISO.

**Teste previsto:** `analytics.service.spec.ts` (service): "monta a janela da semana atual entre segunda 00:00 e a segunda seguinte, no horário local", com o relógio fixado em quarta-feira, 16/09/2026, 10:00 local (`jest.useFakeTimers().setSystemTime(new Date(2026, 8, 16, 10, 0, 0))`, como em `volume-adjustment.service.spec.ts`, com `jest.useRealTimers()` no `afterEach`) e os dois limites conferidos contra as segundas escritas à mão no teste — `new Date(2026, 8, 14)` e `new Date(2026, 8, 21)` —, sem repetir o cálculo do service.

### CA2

**Marca:** teste de unidade

**Cenário:** Dado que existe uma corrida exatamente na segunda 00:00 local e outra exatamente na segunda seguinte 00:00 local, quando o atleta pede a análise semanal, então a primeira é incluída pelo limite inferior (`>=`) e a segunda é excluída pelo limite superior (`<`), de modo que a virada pertence a uma única semana.

**Teste previsto:** `analytics.service.spec.ts`: "usa intervalo semiaberto e conta a corrida da virada em uma única semana", no mesmo relógio fixo de CA1, com o dublê devolvendo a corrida da segunda 00:00 e o `where` capturado provando o limite inferior inclusivo (operador `moreThanOrEqual` com `new Date(2026, 8, 14)`) e o superior exclusivo (operador `lessThan` com `new Date(2026, 8, 21)`).

### CA3

**Marca:** teste de unidade

**Cenário:** Dado um atleta com uma corrida e uma pedalada na mesma semana, quando ele pede a análise semanal, então a consulta restringe `sport_type` a `RUN_SPORTS` e distância, tempo e contagem somam apenas a corrida.

**Teste previsto:** `analytics.service.spec.ts`: "filtra apenas corridas e ignora atividade que não é corrida", conferindo que o `where` capturado restringe `sport_type` a `RUN_SPORTS` (importada de `src/activities/run-sports.ts`) e que os totais correspondem só à corrida devolvida pelo dublê.

### CA4

**Marca:** teste de unidade

**Cenário:** Dado dois atletas com corridas na mesma semana, quando o atleta A pede a análise semanal, então a consulta filtra `user: { id: 'user-1' }` e os totais não incluem a corrida do atleta B.

**Teste previsto:** `analytics.service.spec.ts`: "filtra pelo usuário da sessão e não soma atividade de outro atleta" (substitui o caso atual, que já confere o filtro de usuário).

### CA5

**Marca:** teste de unidade

**Cenário:** Dado uma semana com corridas, quando o atleta recebe a análise, então o corpo tem exatamente `totalDistance` em metros, `totalTime` em segundos, `runCount` e `weekStart` em ISO, sem campo novo nem removido.

**Teste previsto:** `analytics.service.spec.ts`: "devolve totalDistance, totalTime, runCount e weekStart no mesmo formato".

### CA6

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa confere o resumo de verificação, então `npx jest src/analytics/analytics.service.spec.ts`, `npx eslint src/analytics/analytics.service.ts src/analytics/analytics.service.spec.ts` e `npm run build` passaram, sem suíte nova falhando e sem tocar nas suítes de DI pré-existentes.

## Contrato

O contrato não muda.

`GET /api/v1/analytics/weekly` continua protegida pela sessão do atleta, sem parâmetro de caminho, de consulta ou cabeçalho além do de autenticação, e devolve `200` com `totalDistance`, `totalTime`, `runCount` e `weekStart` no mesmo formato. Os status de erro continuam os da sessão (`401` sem sessão). O que muda é apenas quais linhas entram no agregado — a janela e o conjunto de esportes —, uma regra de negócio registrada no LLD §14 e provada pelos critérios, não uma mudança de contrato.

## Verificação do contrato

Nenhum item: a tarefa não cria, altera nem remove rota, evento ou tabela, então não há resposta, status ou restrição de banco a provar. A forma da resposta é conferida por CA5 e o resumo de verificação por CA6; o corpo e os status da rota continuam iguais, conforme a ADR-0001.

## Decisões

- A consulta troca `Between(weekStart, weekEnd)` por `And(MoreThanOrEqual(weekStart), LessThan(weekEnd))`. Motivo: `Between` inclui os dois extremos e contaria a corrida da segunda seguinte 00:00 também na semana anterior; a janela da spec §2.7 é `[segunda 00:00, segunda seguinte 00:00)`, provada por CA1 e CA2.
- A janela continua calculada com os setters locais de `Date` (segunda 00:00 local) e o limite superior é obtido somando 7 dias de calendário local, não `7 * 24h` em milissegundos. Motivo: o invariante do HLD §9, item 6, fala do horário local do servidor; somar milissegundos erraria a segunda 00:00 local em uma semana com mudança de horário de verão, e o teste existente que compara a diferença em milissegundos passa a conferir o horário de parede.
- O filtro de esporte usa `sport_type: In(RUN_SPORTS)`, com `RUN_SPORTS` importada de `src/activities/run-sports.ts`. Motivo: a ingestão resolve o esporte efetivo por `sport_type ?? type` (`LLD §7.3`), `sport_type` é obrigatório na entidade `Activity`, e o conjunto `Run`/`TrailRun`/`VirtualRun` é exatamente o da constante compartilhada que a tarefa manda reutilizar; filtrar por `type` legado reduziria `TrailRun` e `VirtualRun` a `Run` e não expressaria o mesmo conjunto.
- O `AnalyticsController` e o `AnalyticsModule` não mudam. Motivo: a rota já resolve o usuário com `AuthSessionService.resolveUserId` e já passa o `userId` ao service (CA4), e o módulo já injeta o repositório de `Activity`; não há entidade nem dependência nova.
- Nenhum helper novo de janela ou de esporte: o cálculo fica no `AnalyticsService`. Motivo: a spec §2.7 trata a mudança como consulta do service existente, sem arquivo de domínio novo, e o cálculo só tem um consumidor.
- CA2 é provado no nível da consulta gerada (operadores de limite inferior inclusivo e superior exclusivo), não em Postgres real, porque o CI não tem suíte de integração (`spec.md` §8). Motivo: é o ponto de teste mais alto que a spec define para a análise; a semântica de banco é a dos operadores do TypeORM, não uma regra escrita à mão.
- `weekStart` continua devolvido como `weekStart.toISOString()`. Motivo: CA5 exige o mesmo formato, e a conversão já existe.

## Arquivos e interfaces

- `veltra-backend/src/analytics/analytics.service.ts`: `getWeeklyStats(userId: string)` mantém assinatura e retorno; a consulta passa a usar `And(MoreThanOrEqual(weekStart), LessThan(weekEnd))` sobre `start_date`, `user: { id: userId }` e `sport_type: In(RUN_SPORTS)`; imports `And`, `In`, `LessThan`, `MoreThanOrEqual` e `RUN_SPORTS`, e deixa de importar `Between`.
- `veltra-backend/src/analytics/analytics.service.spec.ts`: dublê de repositório que captura o `where`; casos de janela local, virada semiaberta, filtro de corrida, filtro de usuário e formato do retorno.
- Sem mudança: `veltra-backend/src/analytics/analytics.controller.ts` e `veltra-backend/src/analytics/analytics.module.ts`.

## Testes existentes que mudam

- `analytics.service.spec.ts`, caso "filters by user and by the current week only": é dividido nos casos de CA1 a CA5. A asserção de `start_date` deixa de ler `Between` (`.value` como par de datas) e passa a conferir os dois operadores da janela semiaberta; a diferença em milissegundos deixa de ser comparada a `7 * 24 * 60 * 60 * 1000` e passa a conferir segunda 00:00 local nos dois limites; o filtro `user` e o formato do retorno continuam cobertos. Motivo: `Between` inclusivo e a diferença fixa em milissegundos não representam a regra nova.

## Mudança de dados

Nenhuma. Sem seed, backfill ou migration: as colunas usadas (`start_date`, `sport_type` e o dono) já existem e nenhuma atividade é regravada; só muda a seleção das linhas na leitura.

## Documentos atualizados

- `docs/lld.md`, §14 "Analytics": janela `[segunda 00:00 local, segunda seguinte 00:00 local)` com `start_date` e o motivo de não usar `start_date_local`; filtro por usuário e por `sport_type` em `RUN_SPORTS`; remoção da frase "Sem filtro por tipo: conta todas as atividades do período".
- `docs/lld.md`, §20 "Lacunas e cuidados conhecidos": remoção da lacuna resolvida "`GET /analytics/weekly`: não filtra por tipo de atividade" e registro de que a análise usa o horário local do servidor, não o fuso do atleta.
