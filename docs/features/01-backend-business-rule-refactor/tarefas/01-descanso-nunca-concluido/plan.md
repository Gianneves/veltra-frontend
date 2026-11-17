# Plano da F01-T01: Descanso nunca concluído

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dado um atleta com uma sessão concluída, com atividade pareada, realizados e score, quando ele converte a sessão em descanso pela edição individual ou pelo lote, então a sessão fica com `completed = false`, `activityId` nulo, realizados, score, método e data do pareamento nulos, distância e pace zero, e deixa de contar como treino feito.

**Teste previsto:** `training-plans.service.spec.ts` (service): "converte sessão concluída em descanso limpando conclusão, vínculo e realizados" (edição individual) e "lote converte sessão concluída em descanso limpando conclusão e realizados".

### CA2

**Marca:** teste de unidade

**Cenário:** Dado um plano com uma sessão de descanso normalizada, quando o atleta envia tipo de treino, distância e pace, então a sessão volta ao estado planejado com os valores enviados, sem conclusão e sem realizados.

**Teste previsto:** `training-plans.service.spec.ts`: "converter descanso em treino devolve a sessão planejada, sem conclusão".

### CA3

**Marca:** teste de unidade

**Cenário:** Dado um plano com uma sessão de descanso, quando o atleta tenta vincular uma atividade pela edição de vínculo manual, então recebe `400` com `code: "REST_SESSION"` e nem a sessão nem a atividade mudam; e quando uma corrida chega pelo pareamento automático, então a sessão de descanso continua fora dos candidatos.

**Teste previsto:** `activity-matcher.service.spec.ts`: "recusa vínculo manual com sessão de descanso" (novo) e "não vincula corrida em dia de descanso" (existente).

### CA4

**Marca:** teste de unidade

**Cenário:** Dado um plano legado com sessão de descanso concluída, com vínculo e realizados, quando o atleta lê o plano por `current`, pela lista de planos ou por semana, então a sessão sai sem conclusão, com distância/pace zero e realizados nulos, e nada é gravado.

**Teste previsto:** `training-plans.service.spec.ts`: "normaliza descanso legado nos três caminhos de leitura".

### CA5

**Marca:** teste de unidade

**Cenário:** Dado um plano com sessões de treino e de descanso cujo `plannedWeeklyKm` gravado está desatualizado, quando o atleta lê o plano por `current`, pela lista de planos ou por semana, então o campo devolvido é a soma das distâncias planejadas das sessões não-descanso, em metros.

**Teste previsto:** `training-plans.service.spec.ts`: "devolve plannedWeeklyKm como a soma das distâncias planejadas não-descanso, em metros".

### CA6

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa confere o resumo de verificação, então `npx jest` nos specs tocados, `npx eslint` nos arquivos alterados e `npm run build` passaram, sem suíte nova falhando.

## Contrato

### `PUT /api/v1/training-plans/:planId/sessions/:sessionId/activity` · alterada

| Item | Contrato |
| --- | --- |
| Autenticação | Protegida pela sessão do atleta (`AuthSessionService.resolveUserId`); plano, sessão e atividade escopados pelo usuário. |
| Parâmetros de caminho | `planId` (uuid, obrigatório) e `sessionId` (uuid, obrigatório). |
| Corpo da requisição | `activityId` (uuid anulável, obrigatório no corpo; `null` desvincula). Sem mudança. |
| Cabeçalhos de entrada | Cookie de sessão (`user_session` ou `veltra_auth`). Sem mudança. |
| Resposta de sucesso | `200` com a sessão; `200` com corpo vazio quando plano, sessão ou atividade não são encontrados. Sem mudança. |
| Cabeçalhos de resposta | Nenhum além dos padrões. Sem mudança. |
| Erros | **Novo:** `400` com `{ code: "REST_SESSION", message }` quando a sessão é de descanso e `activityId` não é nulo; nada é alterado. Mensagem: “Sessão de descanso não recebe atividade. Escolha um treino da semana para vincular a corrida. Nada foi alterado.” `401` sem sessão válida (guard global). |

### `PUT /api/v1/training-plans/:planId/sessions/:sessionId` e `PUT /api/v1/training-plans/:planId/sessions/batch` · alteradas

A forma não muda: mesmo corpo, mesma resposta `200` com a sessão (ou a lista) e os mesmos erros (`AGE_POLICY`, `DAY_COLLISION`, `EMPTY_CHANGES`, `401`). O que muda é o efeito de `type: "rest"`: além de distância e pace zero, limpa conclusão, vínculo e realizados; e a conversão de descanso em treino não cria conclusão.

### `GET /api/v1/training-plans/current`, `GET /api/v1/training-plans` e `GET /api/v1/training-plans/by-week?weekStart=` · alteradas

A forma não muda: mesmos campos, tipos e status (`200`; `401` sem sessão válida). O que muda é o conteúdo: descanso normalizado e `plannedWeeklyKm` como soma das distâncias planejadas não-descanso, em metros, sem persistir a normalização.

### Tabelas e eventos

Nenhuma tabela criada, alterada ou removida e nenhuma migration. A semântica de `training_plans.plannedWeeklyKm` e das colunas de vínculo de `training_sessions` em descanso muda no LLD §4.1/§4.2, sem DDL. Nenhum evento de WebSocket, fila ou Server Action.

## Verificação do contrato

- `400 REST_SESSION` no vínculo manual: `CA3`.
- `200` do vínculo manual nos demais casos e das duas edições com descanso limpo: `CA1`.
- `200` da edição convertendo descanso em treino: `CA2`.
- `200` das três leituras com descanso normalizado: `CA4`.
- `200` das três leituras com `plannedWeeklyKm` em metros: `CA5`.
- `401` das rotas protegidas: nenhum critério; é o guard global, inalterado, e não precisa de teste novo aqui.
- Forma (campos, tipos, status e a ausência de migration): conferida no fim da tarefa, coberta por `CA6`; a coluna continua a mesma e o que muda é a unidade, registrada no LLD.

## Decisões

- Helper puro novo `training-session-state.ts`, com o nome que a spec §3.1 já reserva: `clearSessionMatchState`, `applyRestState`, `sumPlannedVolumeMeters` e `normalizePlanReadState`; edição, leitura e total usam a mesma fonte. Motivo: CA5 e o objetivo de um único helper.
- A leitura normaliza em memória e não grava; plano inexistente continua `null`. Motivo: a spec §2.5 dispensa script e migration, e a leitura não escreve.
- `plannedWeeklyKm` da resposta é sempre o valor calculado pelo helper, mesmo que o gravado exista e divirja. Motivo: CA5 e a normalização de planos antigos.
- Nenhum recálculo no momento da escrita nesta tarefa; recalcular depois da edição e do ajuste é a F01-T02 (CA6). Motivo: fronteira entre as tarefas na spec §7.
- O vínculo manual recusa `rest` antes de qualquer escrita e `linkSession` repete a guarda; desvincular (`activityId: null`) continua permitido. Motivo: HLD §9.4 e CA3; desvincular não cria vínculo.
- A recusa usa status `400` e apenas `{ code, message }`, com o texto da spec §2.8. Motivo: spec §6.3.
- `ActivityMatcherService.clearSessionMatch` passa a delegar ao helper e o baseline de `VolumeAdjustmentService` usa `sumPlannedVolumeMeters` no lugar de `sumDistance`. Motivo: mesma soma em um único lugar, sem mudança de comportamento.
- O helper não ganha spec próprio; é provado pelos testes do service. Motivo: `.opencode/rules/tests.md` prefere o ponto mais alto e o menor número de pontos.
- Converter descanso em treino sem `plannedDistance`/`plannedPace` no corpo deixa a sessão com distância e pace zero; a API não recusa e não inventa um treino padrão. Motivo: o contrato aceita corpo parcial, o cliente atual sempre envia os valores e o LLD não define distância padrão.

## Arquivos e interfaces

- `veltra-backend/src/training-plans/training-session-state.ts` (novo): `clearSessionMatchState(session)` limpa vínculo e realizados; `applyRestState(session)` zera distância/pace e aplica `clearSessionMatchState`; `sumPlannedVolumeMeters(sessions)` soma as distâncias planejadas das sessões não-descanso; `normalizePlanReadState(plan)` normaliza descanso e recalcula `plannedWeeklyKm` em memória.
- `veltra-backend/src/training-plans/training-plans.service.ts`: `findCurrent`, `findAll` e `findByWeek` aplicam `normalizePlanReadState`; `updateSession` e `updateSessionsBatch` aplicam `applyRestState` quando o tipo final é `rest`; a geração usa `sumPlannedVolumeMeters` no lugar da soma inline.
- `veltra-backend/src/training-plans/activity-matcher.service.ts`: `linkActivityToSession` recusa `rest` com `BadRequestException({ code: "REST_SESSION", message })`; `linkSession` repete a guarda antes de escrever; `clearSessionMatch` delega ao helper.
- `veltra-backend/src/training-plans/volume-adjustment.service.ts`: baseline usa `sumPlannedVolumeMeters`; `sumDistance` deixa de existir.
- `veltra-backend/src/training-plans/training-plans.service.spec.ts`, `activity-matcher.service.spec.ts`: casos do contrato e dos critérios.

## Testes existentes que mudam

- `training-plans.service.spec.ts`, "converte treino em descanso zerando distância e pace": passa a usar uma sessão concluída, com vínculo e realizados, e a conferir a limpeza completa; os dublês do lote ganham os campos de vínculo/realizados. Motivo: a tarefa estende o que a conversão limpa.
- `volume-adjustment.service.spec.ts`, "usa baseline calculado quando plannedWeeklyKm está ausente": continua passando com o helper, sem mudança no caso.
- `activity-matcher.service.spec.ts`, "não vincula corrida em dia de descanso": continua passando; é uma das provas de CA3.

## Mudança de dados

Nenhuma. Sem seed, backfill ou migration; planos antigos são normalizados apenas na leitura.

## Documentos atualizados

- `docs/lld.md`, §4.1 "Entidades e colunas": `plannedWeeklyKm` documentado como volume em metros, derivado e normalizado; `completed` e `activityId` de `training_sessions` marcados como nunca preenchidos em descanso.
- `docs/lld.md`, §4.2 "Observações de modelagem": unidade de `plannedWeeklyKm` e normalização de descanso na leitura, sem corrigir o banco.
- `docs/lld.md`, §8.1 "Endpoints": leitura normaliza descanso e devolve o total em metros; vínculo manual com descanso recusado com `REST_SESSION`.
- `docs/lld.md`, §8.8 "Edição de sessão": limpeza completa na conversão para descanso, no individual e no lote; conversão de descanso em treino sem conclusão.
- `docs/lld.md`, §8.9 "Pareamento de atividades": recusa do vínculo manual com descanso e guarda no ponto que grava o vínculo.
- `docs/lld.md`, §20 "Lacunas e cuidados conhecidos": descanso legado normalizado só na leitura e risco da unidade de `plannedWeeklyKm`.
