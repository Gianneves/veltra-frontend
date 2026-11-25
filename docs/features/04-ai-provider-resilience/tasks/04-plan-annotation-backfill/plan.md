# Plano da F04-T04: Backfill da anotação do plano na leitura

Tarefa: [task.md](task.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dado um atleta com plano da semana atual sem `focus` e sem `coachNotes` e um fornecedor
configurado, quando ele abre a semana por `GET /training-plans/current`, então a leitura devolve o
mesmo plano antes de a revisão terminar — a chamada a `generatePlanReview` fica pendente e a resposta
já chegou — e o contexto enviado à IA cobre só essa semana, com o `weekStart` do plano, o volume, o
longão e as sessões persistidas.

**Teste previsto:** unidade, `src/training-plans/training-plans.service.spec.ts`, "dispara a revisão
da semana atual em background sem esperar a IA".

### CA2

**Marca:** teste de unidade

**Cenário:** Dado um plano da semana atual com `focus` preenchido e outro com `coachNotes`
preenchido, quando cada um é lido, então nenhuma revisão é disparada; `focus` ou `coachNotes` vazio
conta como ausente e dispara, porque o critério fala de conteúdo preenchido.

**Teste previsto:** unidade, `src/training-plans/training-plans.service.spec.ts`, "não dispara
backfill quando o plano já tem foco ou notas".

### CA3

**Marca:** teste de unidade

**Cenário:** Dado um atleta com planos de semana passada, da semana atual e de semana futura, quando
ele lista os planos por `GET /training-plans`, então só a revisão do plano da semana atual é
disparada, a resposta traz os três planos como hoje e chega antes de a revisão terminar.

**Teste previsto:** unidade, `src/training-plans/training-plans.service.spec.ts`, "avalia só o plano
da semana atual na lista e não bloqueia a resposta".

### CA4

**Marca:** teste de unidade

**Cenário:** Dado um plano sem anotação, quando duas leituras acontecem dentro de 60 s, então a
segunda não chama a IA e a chave `ai:plan-review:attempt:<planId>` foi gravada com TTL de 60 s; quando
o prazo passa, a leitura seguinte dispara a revisão de novo.

**Teste previsto:** unidade, `src/training-plans/training-plans.service.spec.ts`, "limita a tentativa
por plano a uma a cada 60 segundos", com o `AiProviderStateService` real sobre um `RedisService`
falso em memória que honra o TTL e registra a chave gravada.

### CA5

**Marca:** teste de unidade

**Cenário:** Dado um plano da semana atual sem foco e sem notas e a revisão devolvida pela IA, quando
o backfill termina, então `focus`, `coachNotes` e as `notes` das sessões são atualizados pelo mesmo
construtor `buildPlanAnnotations` da geração, e distância, pace, dia, tipo e conclusão do plano e das
sessões continuam exatamente como estavam, sem `save` em plano ou sessão.

**Teste previsto:** unidade, `src/training-plans/training-plans.service.spec.ts`, "grava só foco,
notas do plano e dicas no backfill".

### CA6

**Marca:** teste de unidade

**Cenário:** Dado que nenhum fornecedor está configurado (`AiService.isConfigured()` falso), quando
o plano da semana atual sem anotação é lido, então nenhuma chamada de IA é feita, nenhuma chave de
trava é escrita e a resposta é a mesma de hoje.

**Teste previsto:** unidade, `src/training-plans/training-plans.service.spec.ts`, "não chama a IA na
leitura sem fornecedor configurado".

## Contrato

O contrato não muda. Nenhuma rota, evento ou tabela nasce, muda ou sai: `GET
/training-plans/current` e `GET /training-plans` devolvem o mesmo corpo, os mesmos status e os mesmos
campos de hoje, mesmo quando o backfill é disparado — a revisão corre em background e a resposta
traz o estado de antes dela. Nenhum evento de WebSocket e nenhuma Server Action entram. A chave
`ai:plan-review:attempt:<planId>` é estado operacional em Redis, registrada em "Mudança de dados", e
não contrato de API.

## Verificação do contrato

Nenhum item: a tarefa não cria, muda nem remove rota, evento ou tabela, então não há contrato a
provar aqui. A resposta inalterada de `GET /training-plans/current` é provada por `CA1` e a de `GET
/training-plans` por `CA3` (a resposta chega antes da revisão e mantém os planos); os campos de plano
e sessão que o backfill não pode tocar são provados por `CA5`; a ausência de chamada de IA sem
fornecedor é provada por `CA6`.

## Decisões

- `buildPlanReviewContext` nasce em `src/training-plans/plan-review-context.ts` com o tipo
  `PlanReviewWeek`, e o `WeekSummary` interno do service é substituído por ele: a geração passa a
  montar as semanas com as sessões e o backfill monta uma única semana, sem duas cópias do JSON
  (spec §2.7; `LLD §8.2`).
- A semana do backfill leva `phase` nulo e `workouts` vazio: fase e nomes de treino de qualidade não
  são persistidos (são calculados na geração), e as sessões persistidas já levam tipo, dia, km e pace
  ao prompt; preencher por dedução seria inventar dado que o plano não guarda (spec §2.7).
- O backfill resolve a meta por `plan.goalId` com filtro `userId` e refaz o perfil com
  `{ recentOnly: true }`, como a geração; sem meta encontrada, não dispara: o contexto do prompt tem
  `meta`, `paces` e `historicoDoAtleta`, que saem dela (spec §2.7; HLD §9, item 1).
- O horizonte de paces do backfill é `max(ceil((targetDate − plan.weekStart) / 7 dias), 1)`, e
  `buildPaces` e o `assessment` são recalculados para ele: é o "horizonte que resta até a meta" da
  spec §2.7, e a meta e os paces do prompt ficam coerentes com a semana que sobrou.
- O backfill usa o mesmo `generatePlanReview` e o mesmo `buildPlanAnnotations`, com `weekOneNotes`
  vazio: as notas de padrão e de meta só existem na geração, e repeti-las no backfill inventaria
  contexto; a primeira semana do plano, quando chega a precisar de backfill, recebe `overview` +
  `rationale` como na geração sem as notas do passo 10 (spec §2.7; `LLD §8.2`).
- "Sem `focus` e sem `coachNotes`" é checado por valor falsy (`undefined`, `null` ou string vazia),
  porque a coluna aceita nulo e o conteúdo útil é texto preenchido (CA2).
- `findCurrent` e `findAll` normalizam a leitura e só então agendam o backfill sobre o plano já
  normalizado: o backfill vê volume e descanso como a resposta, e a resposta é devolvida sem
  `await` (CA1, CA3, CA5).
- `findAll` procura o plano com `weekStart` igual ao `getWeekStart(new Date())` já usado por
  `findCurrent`, na lista que já foi carregada; nenhuma consulta nova entra na leitura (CA3; spec
  §2.7).
- `GET /training-plans/by-week` não dispara backfill: a tarefa limita o gatilho às duas leituras
  nomeadas no escopo (CA1, CA3).
- `AiProviderStateService.tryStartPlanReview(planId)` usa `setNx` na chave
  `ai:plan-review:attempt:<planId>`, com valor `String(Date.now())` e TTL de 60 s; a chave pertence
  ao dono das chaves `ai:*` criado na `02` e não vira configuração de ambiente (CA4; spec §2.7, §4;
  `LLD §16`).
- Com o Redis fora, `tryStartPlanReview` devolve `true` e a tentativa acontece: a spec §4 tolera a
  repetição de um backfill como pior caso, e indisponibilidade de cache não pode impedir o conteúdo
  de ser gerado (CA4; spec §4; `LLD §16`).
- O gate de fornecedor vem antes da trava: sem `AiService.isConfigured()`, a leitura não chama IA nem
  escreve chave (CA6).
- A revisão é disparada com `void … .catch(console.error)`, como o `enrichPlanWithAi` da geração: a
  falha de IA, de banco ou de Redis fica no log, a trava expira em 60 s e a leitura seguinte tenta de
  novo, sem alterar a resposta atual (CA1, CA4).
- O tail de aplicação de `enrichPlanWithAi` vira `applyPlanAnnotations(annotations)`, usado pela
  geração e pelo backfill: um só ponto aplica `focus`, `coachNotes` e `notes`, o que sustenta a
  garantia do `CA5` (ADR-0002; `HLD §9`, item 7).

## Arquivos e interfaces

- `src/training-plans/plan-review-context.ts` (novo): `PlanReviewWeek` (`weekStart`, `phase?`,
  `weeklyKm`, `longKm`, `workouts`, `sessions`) e `buildPlanReviewContext(goal, profile, paces,
  assessment, patternNote, weeks): string`, com o JSON que hoje vive em `enrichPlanWithAi` e um
  `formatPace` local, no padrão dos módulos `insights` e `coach`.
- `src/training-plans/training-plans.service.ts` (alterado): o construtor recebe
  `AiProviderStateService`; `findCurrent` e `findAll` chamam
  `schedulePlanAnnotationBackfill(plan)`; nascem `schedulePlanAnnotationBackfill(plan): void`,
  `backfillPlanReview(plan): Promise<void>` e `applyPlanAnnotations(annotations): Promise<void>`;
  `enrichPlanWithAi` passa a montar `PlanReviewWeek[]` e usar
  `buildPlanReviewContext`/`applyPlanAnnotations`; o `interface WeekSummary` sai.
- `src/ai/ai-provider-state.service.ts` (alterado): `tryStartPlanReview(planId: string):
  Promise<boolean>`, com a chave `ai:plan-review:attempt:<planId>`, TTL de 60 s e erro de Redis
  tratado como tentativa liberada.
- `src/training-plans/training-plans.service.spec.ts` (alterado): as três construções do service
  ganham o serviço de estado; o `AiService` falso das leituras ganha `isConfigured`; entra um
  `RedisService` falso em memória com TTL e a chave gravada, e os casos de `CA1`–`CA6`.
- Nenhum módulo muda: `TrainingPlansModule` já importa `AiModule` e `AiModule` já exporta
  `AiProviderStateService` desde a tarefa `02`.
- Nenhum arquivo do frontend muda.

## Testes existentes que mudam

- `src/training-plans/training-plans.service.spec.ts`: `createMocks` e as duas construções do bloco
  de edição e do bloco de leitura passam `AiProviderStateService` sobre o Redis falso; o
  `AiService` falso de `createMocks` já tem `isConfigured`, e o bloco "leitura de plano" passa a
  receber um `AiService` falso com `isConfigured: () => false` para continuar provando que a leitura
  não grava. As expectativas existentes de normalização e `plannedWeeklyKm` não mudam.
- Nenhum outro spec muda: `ai.service.spec.ts` cobre a porta e a revisão, que não mudam, e
  `plan-annotations.spec.ts` continua provando o construtor puro.

## Mudança de dados

Nenhuma em banco, seed, backfill ou migration. Entra só estado operacional em Redis:
`ai:plan-review:attempt:<planId>` com o instante da tentativa como valor e TTL de 60 s; passado o
prazo, a chave expira e a leitura seguinte tenta de novo.

## Documentos atualizados

- `docs/lld.md`, §8.1 "Endpoints": `findCurrent` e `findAll` podem disparar o backfill da anotação em
  background para o plano da semana atual sem `focus` e sem `coachNotes`, sem alterar a resposta;
  `by-week` não dispara; `findAll` avalia só a semana corrente; a trava é
  `ai:plan-review:attempt:<planId>` e o gate é fornecedor configurado.
- `docs/lld.md`, §8.2 "Geração do plano": o contexto da revisão passa a ser montado por
  `buildPlanReviewContext` compartilhado entre geração e backfill; entra o parágrafo do backfill na
  leitura (meta por `goalId` com escopo de usuário, perfil `recentOnly`, paces recalculados para o
  horizonte restante, uma única semana, `weekOneNotes` vazio, aplicação só de anotação); o gate "sem
  `OPENAI_API_KEY`" vira "sem nenhum fornecedor configurado", que é o estado real desde a tarefa
  `02`.
- `docs/lld.md`, §16 "Redis e processamento assíncrono": entra a chave
  `ai:plan-review:attempt:<planId>`, com o instante da tentativa e TTL de 60 s, consumida pelo
  `TrainingPlansService` e tolerada pelo `AiProviderStateService` com Redis fora (a tentativa é
  liberada).
- `docs/lld.md`, §20 "Lacunas e cuidados conhecidos": entra o custo do backfill em leitura — um
  plano da semana atual sem anotação pode gerar uma revisão por minuto enquanto for aberto, limitado
  pela trava, pelo recorte da semana e pela condição de foco e notas ausentes; a leitura continua
  rápida porque o disparo não tem `await`.
- `docs/hld.md`: nenhuma seção muda; a superfície da API, o contrato e as invariantes continuam os
  mesmos.
