# Plano da F01-T03: Ingestão e pareamento por dono

Tarefa: [task.md](task.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dado que a atividade `999` está gravada para o atleta B e chega um evento `delete` daquela atividade com `owner_id` do atleta A, quando o webhook processa o evento, então ele resolve a atividade pelo par `activityStravaId` + atleta A, não encontra nada, não desvincula sessão alguma e não remove a atividade do atleta B.

**Teste previsto:** `strava-webhook.service.spec.ts` (service): "não apaga atividade nem desvincula sessão quando o dono do evento é outro atleta", com um dublê de `findByStravaId` que filtra por `activityStravaId` e dono e devolve `null` para o atleta A.

### CA2

**Marca:** teste de unidade

**Cenário:** Dado que a atividade `999` pertence ao atleta B, quando chega um evento de criação/atualização dessa atividade com `owner_id` do atleta A e o detalhe é uma corrida, então o `upsert` não grava nada e devolve `null`, o webhook interrompe o fluxo sem parear nem gerar insight, e o registro do atleta B mantém os campos anteriores.

**Teste previsto:** `activities.service.spec.ts`: "não atualiza atividade de outro atleta e devolve null"; `strava-webhook.service.spec.ts`: "interrompe o fluxo quando o upsert não devolve atividade do dono".

### CA3

**Marca:** teste de unidade

**Cenário:** Dado que a corrida do atleta A está vinculada a uma sessão do plano dele e a uma sessão de outro atleta, quando chega o evento `delete` da corrida com `owner_id` do atleta A, então só a sessão do plano do atleta A volta a ficar não concluída, a corrida é removida e a sessão do outro atleta continua vinculada.

**Teste previsto:** `activity-matcher.service.spec.ts`: "desvincula apenas as sessões do plano do atleta"; `strava-webhook.service.spec.ts`: "desvincula e remove atividade no delete" (existente, atualizado para passar o dono).

### CA4

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa procura a lista de esportes de corrida, então encontra `RUN_SPORTS` exportada apenas em `src/activities/run-sports.ts`, importada pelo webhook, e nenhuma cópia local da lista no serviço do webhook.

### CA5

**Marca:** teste de unidade

**Cenário:** Dado que a atividade `activity-1` pertence ao atleta B, quando o atleta A tenta vincular essa atividade a uma sessão sua pelo vínculo manual, então o vínculo é recusado com resposta vazia, a sessão do atleta A continua sem atividade e nada é gravado.

**Teste previsto:** `activity-matcher.service.spec.ts`: "não vincula atividade de outro atleta e nada muda", com dublê de `activityRepository.findOne` que respeita o filtro `user: { id }`.

### CA6

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa confere o resumo de verificação, então `npx jest` nos specs tocados, `npx eslint` nos arquivos alterados e `npm run build` passaram, sem suíte nova falhando e sem tocar nas suítes de DI pré-existentes.

## Contrato

O contrato não muda.

Nenhuma rota, campo, evento ou tabela é criado, alterado ou removido. `POST /strava/webhook` continua com o mesmo corpo, os mesmos status e a mesma resposta; o que muda é o processamento interno do evento, escopado pelo dono, registrado no LLD §7.3. `GET /activities`, `POST /activities` e as leituras por semana também não mudam.

## Verificação do contrato

Nenhum item: a tarefa não cria, altera nem remove rota, evento ou tabela, então não há resposta, status ou restrição de banco a provar. A conferência do fim da tarefa olha apenas que o corpo e os status do webhook continuam iguais, coberta por `CA6`.

## Decisões

- `ActivitiesService.findByStravaId(activityStravaId, userId)` passa a exigir o dono e filtra `{ activityStravaId, user: { id: userId } }`; o webhook chama com o usuário resolvido de `event.owner_id`. Motivo: spec §2.6 e CA1.
- `upsert` resolve a atividade pelo par `activityStravaId` + dono e, quando não encontra para o dono, confere se o `activityStravaId` existe para outro atleta; nesse caso devolve `null` sem gravar. Motivo: CA2 e a coluna `activities.activityStravaId` ser única — criar outro registro estouraria a restrição e atualizar o registro alheio é o que a tarefa fecha.
- `upsert` passa a devolver `Promise<Activity | null>` e quem chama trata o `null`: o webhook encerra o fluxo daquela atividade e o resync (`strava-sync.controller`) pula a atividade. Motivo: nenhum desses caminhos tem o que fazer com uma atividade de outro dono, e lançar erro mandaria o evento para a lista de falhas e gastaria as três tentativas.
- `create` mantém a checagem de duplicidade por `activityStravaId` sem escopo de usuário, e o `POST /activities` continua recusando um ID já gravado com o mesmo erro genérico de hoje. Motivo: a coluna é única e não há critério que peça mudar essa rota; escopar a checagem transformaria a duplicata em erro de banco.
- `ActivityMatcherService.unlinkSessionsForActivity(activityId, userId)` filtra `{ activityId, plan: { userId } }`, e todos os chamadores passam o dono (`handleEvent`, `matchActivity` e `linkActivityToSession`). Motivo: CA3 e spec §2.6 — a atividade é do dono, e o desvínculo em cascata não pode alcançar o plano de outro atleta.
- O evento de dono divergente é ignorado em silêncio, sem log novo e sem ir para `strava:events:failed`; o caso fica registrado no LLD §20. Motivo: não é falha de processamento, é um evento que não se aplica a nenhum registro do dono, e o código só loga erro.
- `RUN_SPORTS` sai do webhook para `src/activities/run-sports.ts`, exportado como `string[]` (sem `as const`), para servir ao `includes` do webhook e ao `In(...)` da análise semanal na F01-T04. Motivo: CA4 e spec §2.6.
- O webhook e o backfill de atividades do `TrainingPlansService` importam a mesma constante. Motivo: o backfill usa hoje uma terceira cópia da lista; unificar mantém o mesmo conjunto em toda a ingestão, sem mudança de comportamento.

## Arquivos e interfaces

- `veltra-backend/src/activities/run-sports.ts` (novo): `RUN_SPORTS` com `Run`, `TrailRun` e `VirtualRun`.
- `veltra-backend/src/activities/activities.service.ts`: `findByStravaId(activityStravaId, userId)` escopado pelo par; `upsert` devolve `Activity | null`, resolve pelo par e devolve `null` quando o `activityStravaId` pertence a outro atleta; `create` e `remove` sem mudança.
- `veltra-backend/src/strava-webhook/strava-webhook.service.ts`: importa `RUN_SPORTS`; `handleDelete(userId, stravaActivityId)` resolve a atividade pelo par; o upsert e a remoção de não-corridas usam o dono; o `null` do upsert encerra o fluxo antes de parear e gerar insight.
- `veltra-backend/src/strava-webhook/strava-sync.controller.ts`: pula a atividade quando o `upsert` devolve `null`.
- `veltra-backend/src/training-plans/training-plans.service.ts`: o backfill de atividades recentes usa `RUN_SPORTS` no lugar da lista inline.
- `veltra-backend/src/training-plans/activity-matcher.service.ts`: `unlinkSessionsForActivity(activityId, userId)` com o filtro por dono do plano; `matchActivity` e `linkActivityToSession` passam o dono.
- `veltra-backend/src/strava-webhook/strava-webhook.service.spec.ts`, `veltra-backend/src/activities/activities.service.spec.ts`, `veltra-backend/src/training-plans/activity-matcher.service.spec.ts`: casos e dublês dos critérios.

## Testes existentes que mudam

- `strava-webhook.service.spec.ts`: o dublê de `findByStravaId` e as expectativas de `unlinkSessionsForActivity` passam a receber o dono (`'user-1'`) nos casos de exclusão e de atividade que deixou de ser corrida. Motivo: as duas chamadas agora são escopadas pelo usuário do evento.
- `activities.service.spec.ts`, casos de `upsert`: montam o registro existente no dublê de `findOne` com o filtro por dono, em vez de `findOneBy` sem escopo, e o dublê ganha o `findOneBy` da checagem de atividade de outro atleta. Motivo: a resolução passou a ser pelo par `activityStravaId` + dono.
- `activity-matcher.service.spec.ts`, "limpa vínculo e marca como não concluído": chama `unlinkSessionsForActivity('activity-1', 'user-1')` e o dublê de `find` passa a receber o filtro por plano; os casos de `matchActivity` seguem passando, porque o dublê ignora o segundo argumento. Motivo: a assinatura ganhou o dono.
- `strava-sync.controller.spec.ts`: sem mudança; o dublê de `upsert` continua devolvendo uma atividade.

## Mudança de dados

Nenhuma. Sem seed, backfill ou migration: nenhuma coluna nova, e a única restrição que a tarefa usa (`activities.activityStravaId` único) já existe.

## Documentos atualizados

- `docs/lld.md`, §6.2 "ActivitiesService": `findByStravaId` resolvido pelo par `activityStravaId` + dono; `upsert` escopado pelo dono, devolvendo `null` para atividade de outro atleta; `create` com a checagem global de duplicidade justificada.
- `docs/lld.md`, §7.3 "Webhook": `RUN_SPORTS` em `src/activities/run-sports.ts`, usada pelo webhook e pelo backfill da geração de plano; exclusão, upsert e desvínculo escopados pelo dono do evento; evento de dono divergente não altera nada.
- `docs/lld.md`, §20 "Lacunas e cuidados conhecidos": evento de atividade com dono divergente é ignorado em silêncio, sem re-tentativa nem lista de falhas.
