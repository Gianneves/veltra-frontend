# Plano da F01-T02: Limites de idade na edição

Tarefa: [task.md](task.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dado um atleta de 12 anos com uma semana que soma 18 km planejados, quando ele edita a distância de uma sessão para 5 km e a semana passaria a 23 km, então recebe `AGE_POLICY` com a mensagem de volume citando 23,0 km e o limite de 20 km, e nem as sessões nem o `plannedWeeklyKm` do plano mudam.

**Teste previsto:** `training-plans.service.spec.ts` (service): "recusa edição individual que estoura o volume semanal da idade sem gravar nada".

### CA2

**Marca:** teste de unidade

**Cenário:** Dado um atleta de 15 anos com uma sessão `tempo` e volume abaixo do limite, quando ele edita a semana em lote transformando duas sessões em `interval` e `fartlek`, então o lote inteiro é recusado com `AGE_POLICY`, a mensagem cita 3 sessões de qualidade e o limite de 1, e nada é gravado.

**Teste previsto:** `training-plans.service.spec.ts`: "lote recusa qualidade acima do limite da idade sem gravar nada".

### CA3

**Marca:** teste de unidade

**Cenário:** Dado um atleta de 12 anos com a semana em 5 km, quando ele edita uma sessão para 8 km com `acknowledgeAgePolicy: true`, então a sessão de 8 km é aceita apesar do teto de longão de 6 km; quando a mesma edição levaria a semana a 23 km com `acknowledgeAgePolicy: true`, então continua recusada com `AGE_POLICY` de volume e nada é gravado; e quando um atleta de 15 anos tenta pôr duas sessões de qualidade na semana com `acknowledgeAgePolicy: true`, então também é recusado com `AGE_POLICY` de qualidade.

**Teste previsto:** `training-plans.service.spec.ts`: "aceita distância acima do teto com acknowledgeAgePolicy" e "mantém as recusas de volume e qualidade mesmo com acknowledgeAgePolicy".

### CA4

**Marca:** teste de unidade

**Cenário:** Dado um plano com duas sessões, quando o atleta envia o lote com o swap de dias dos dois, então as duas trocam de dia e de `dayOrder`; e quando o lote move uma sessão para o dia de uma sessão que não está no lote, então recebe `DAY_COLLISION` e nenhuma sessão muda.

**Teste previsto:** `training-plans.service.spec.ts`: "aplica swap de dias em lote de forma atômica" (existente, segue passando) e "rejeita lote que criaria dia duplicado sem aplicar nada" (existente, atualizado para a validação dentro da transação).

### CA5

**Marca:** teste de unidade

**Cenário:** Dado um plano com duas sessões em dias distintos, quando duas edições no mesmo plano disputam o mesmo dia ao mesmo tempo, então a segunda edição lê o estado já gravado pela primeira — porque a leitura das sessões só acontece depois de a transação travar a linha do plano — e termina recusada com `DAY_COLLISION`, deixando uma sessão por dia. O mesmo comportamento em Postgres real é conferido pelo roteiro manual da spec §8, item 1 (duas requisições `PUT` simultâneas).

**Teste previsto:** `training-plans.service.spec.ts`: "serializa duas edições concorrentes no mesmo plano e a segunda vê o estado da primeira", com um dublê de `dataSource.transaction` que enfileira as transações e compartilha o mesmo store.

### CA6

**Marca:** teste de unidade

**Cenário:** Dado um plano com `plannedWeeklyKm` desatualizado, quando o atleta edita uma sessão, quando edita a semana em lote e quando o ajuste de volume corta sessões, então o plano é gravado com `plannedWeeklyKm` igual à soma das distâncias planejadas das sessões não-descanso do estado final, em metros.

**Teste previsto:** `training-plans.service.spec.ts`: "grava plannedWeeklyKm com o volume do estado final após edição individual e após lote"; `volume-adjustment.service.spec.ts`: "recalcula plannedWeeklyKm depois do corte".

### CA7

**Marca:** teste de unidade

**Cenário:** Dado um atleta sem `birthDate`, quando ele edita a semana para um volume e uma quantidade de qualidade que estourariam os limites de um menor de idade, então a edição é aceita e nenhuma recusa de idade é emitida.

**Teste previsto:** `training-plans.service.spec.ts`: "não aplica limites de idade na edição sem birthDate".

### CA8

**Marca:** teste de unidade

**Cenário:** Dado o avaliador puro de volume e qualidade, quando ele recebe o volume em metros, a contagem de qualidade e a idade, então aponta volume acima do limite apenas nas faixas com `maxWeeklyKm`, aponta qualidade acima do limite nas faixas com `maxQualitySessions`, devolve a mensagem correspondente em pt-BR e não aponta nada quando a idade é desconhecida; e os services provam a recusa no estado final (CA1, CA2).

**Teste previsto:** `age-policy.spec.ts`: "avalia volume e qualidade da semana pelos limites absolutos da idade".

### CA9

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa confere o resumo de verificação, então `npx jest` nos specs tocados, `npx eslint` nos arquivos alterados e `npm run build` passaram, sem suíte nova falhando e sem tocar nas suítes de DI pré-existentes.

## Contrato

### `PUT /api/v1/training-plans/:planId/sessions/:sessionId` · alterada

| Item | O que muda |
| --- | --- |
| Autenticação | Sem mudança: protegida pela sessão do atleta (`AuthSessionService.resolveUserId`); plano e sessão escopados pelo usuário. |
| Parâmetros de caminho e de consulta | Sem mudança: `planId` e `sessionId` (uuid, obrigatórios). |
| Corpo da requisição | Sem mudança: `type`, `plannedDistance`, `plannedPace`, `day`, `notes` e `acknowledgeAgePolicy`, todos opcionais (DTO atual). |
| Cabeçalhos de entrada | Sem mudança: cookie de sessão. |
| Resposta de sucesso | Sem mudança: `200` com a sessão atualizada; `200` com corpo vazio quando plano ou sessão não existem. |
| Cabeçalhos de resposta | Sem mudança. |
| Erros | **Novo:** `400` com `{ code: "AGE_POLICY", message }` quando a semana, no estado final, passa de `maxWeeklyKm`: “A semana ficaria com {volume} km de volume planejado; para a sua idade o limite é {limite} km. Reduza a distância de uma das sessões e tente de novo. Nada foi alterado.” **Novo:** `400` com o mesmo `code` quando a contagem de `interval`, `tempo` e `fartlek` no estado final passa de `maxQualitySessions`: “A semana ficaria com {quantidade} sessões de qualidade; para a sua idade o limite é {limite}. Transforme uma delas em treino leve ou descanso e tente de novo. Nada foi alterado.” Ambos independem de `acknowledgeAgePolicy`, que segue valendo só para a distância. Sem mudança: `400 AGE_POLICY` da distância (com `recommendedMaxKm`, `recommendedMinAge` e `disclaimer`), `400 DAY_COLLISION` e `401`. |

### `PUT /api/v1/training-plans/:planId/sessions/batch` · alterada

| Item | O que muda |
| --- | --- |
| Autenticação | Sem mudança: protegida e escopada pelo usuário. |
| Parâmetros de caminho e de consulta | Sem mudança: `planId` (uuid, obrigatório). |
| Corpo da requisição | Sem mudança: `items` com 1 a 7 itens, cada um com `sessionId` e os mesmos campos do individual. |
| Cabeçalhos de entrada | Sem mudança: cookie de sessão. |
| Resposta de sucesso | Sem mudança: `200` com a lista de sessões atualizadas; `200` com corpo vazio quando o plano não existe. |
| Cabeçalhos de resposta | Sem mudança. |
| Erros | **Novo:** `400 AGE_POLICY` de volume e de qualidade do estado final, com as mesmas mensagens da rota individual, sem sobreposição de `acknowledgeAgePolicy`. Sem mudança: `400 AGE_POLICY` da distância por item, `400 DAY_COLLISION` sobre o estado final inteiro, `400 EMPTY_CHANGES`, `404` de sessão fora do plano e `401`. |

### Tabelas e eventos

Nenhuma tabela criada, alterada ou removida e nenhuma migration. `training_plans.plannedWeeklyKm` continua com o mesmo tipo e passa a ser **gravado** na edição (individual e lote) e no ajuste de volume, com o volume do estado final em metros; a semântica está no LLD §4.1, §8.8 e §8.10. Nenhum evento de WebSocket, fila ou Server Action.

## Verificação do contrato

- `400 AGE_POLICY` de volume na rota individual: `CA1`.
- `400 AGE_POLICY` de qualidade no lote: `CA2`.
- `400 AGE_POLICY` de volume e de qualidade com `acknowledgeAgePolicy`, e `200` da distância com ciência: `CA3`.
- `200` do swap em lote e `400 DAY_COLLISION` do estado final: `CA4`.
- `200` da edição individual: `CA1`, `CA3` e `CA7`.
- `plannedWeeklyKm` gravado sem DDL nova, nas três escritas: `CA6`.
- `400 EMPTY_CHANGES`, `404` de sessão fora do plano e `401` das rotas protegidas: nenhum critério; comportamento inalterado, já coberto pelos testes atuais e pelo guard global, e não precisa de teste novo aqui.

## Decisões

- As duas rotas de edição passam a rodar em `dataSource.transaction`, com `findOne` do plano usando `lock: { mode: 'pessimistic_write' }` e **sem** `relations`: o Postgres não aplica `FOR UPDATE` ao lado anulável de um `LEFT JOIN`, então a trava é carregada na linha do plano e as sessões são lidas em seguida, dentro da mesma transação. Motivo: spec §2.3 e CA5.
- As sessões do plano são lidas uma única vez, depois da trava, e o lote deixa de refazer `findOne` por item. Motivo: a validação precisa do estado final inteiro e a leitura anterior à trava reintroduziria a corrida que a tarefa fecha.
- `getAge` continua fora da transação, antes dela. Motivo: lê só `users.birthDate`, não disputa escrita com a edição e evita segurar a trava durante uma consulta a mais.
- O estado final é simulado em memória a partir das sessões lidas, e a validação segue a ordem da spec §2.4: dono da sessão, distância por idade (por item, no lote), dia único, volume semanal e qualidade. Motivo: CA1, CA2 e CA4; a distância continua bloqueando antes das regras de semana, como hoje.
- Volume e qualidade são avaliados em toda edição aceita, mesmo quando o campo alterado não é distância nem tipo. Consequência: um plano legado já acima do limite só aceita edições que caibam no limite (incluindo converter sessões em descanso). Motivo: spec §2.4 diz "no estado final" e trata o bloqueio como duro; o plano continua corrigível.
- O dia único da edição individual é validado só quando o corpo traz `day`; o lote continua validando o estado final inteiro, inclusive sessões fora do lote. Motivo: só uma mudança de dia cria colisão nova e um plano legado com dias duplicados, que a spec §2.5 não resolve automaticamente, não pode ficar imeditável até a feature de migrations.
- A comparação de volume é feita em metros inteiros (`Math.round(volumeMeters) > maxWeeklyKm * 1000`) e a mensagem mostra o volume em km com uma casa decimal. Motivo: `plannedWeeklyKm` e `plannedDistance` estão em metros e o limite em km; arredondar só na exibição evita erro de ponto flutuante na borda.
- A avaliação pura entra em `age-policy.ts` como `assessWeekForAge`, recebendo volume em metros, contagem de qualidade e idade; a contagem por tipo fica em `training-session-state.ts` (`countQualitySessions`, tipos `interval`, `tempo` e `fartlek` do `GLOSSARY.md`). Motivo: a spec §3.1 dá a avaliação à política de idade, que não conhece entidade de sessão, e o glossário define qualidade por tipo.
- A recusa de volume e qualidade é `400` com `{ code: 'AGE_POLICY', message }`, sem os campos de distância, e não consulta `acknowledgeAgePolicy`. Motivo: spec §2.4, §2.8 e §6.3; CA3.
- `plannedWeeklyKm` é recalculado com `sumPlannedVolumeMeters` sobre o estado final e gravado dentro da mesma transação, depois das sessões; no ajuste de volume, entra no `planRepository.update` que já marca `volumeAdjusted`. Motivo: CA6, spec §2.2 e LLD §4.1 ("recalculado em edição e no ajuste de volume").
- O ajuste de volume calcula o novo total a partir das sessões já cortadas em memória, sem reler o plano. Motivo: mesma fonte da soma e nenhuma consulta extra dentro do fluxo do pareamento.
- Nenhum spec novo para os helpers: `age-policy.spec.ts` prova a avaliação (CA8) e os testes de service provam a recusa e o total (CA1, CA2, CA6). Motivo: `.opencode/rules/tests.md` prefere o ponto mais alto e o menor número de pontos.
- A concorrência é provada por dublê que serializa `dataSource.transaction` (CA5) porque o CI não usa Postgres; a prova em banco real fica no roteiro manual da spec §8, item 1. Motivo: spec §8 e `.opencode/rules/tests.md`.

## Arquivos e interfaces

- `veltra-backend/src/health/age-policy.ts`: `assessWeekForAge(volumeMeters, qualitySessions, age?)` devolve `{ volumeExceeded, qualityExceeded, maxWeeklyKm?, maxQualitySessions?, message? }`, com as mensagens da spec §2.8; `planAgeAdjustment` continua a fonte única dos limites absolutos.
- `veltra-backend/src/training-plans/training-session-state.ts`: `QUALITY_SESSION_TYPES` (`interval`, `tempo`, `fartlek`) e `countQualitySessions(sessions)`; `sumPlannedVolumeMeters` passa a ser reusado na escrita.
- `veltra-backend/src/training-plans/training-plans.service.ts`: `updateSession` e `updateSessionsBatch` abrem a transação, travam o plano, leem as sessões, validam o estado final e gravam `plannedWeeklyKm`; métodos privados `withLockedPlan` (trava + leitura), `assertWeekAgeLimits` (volume/qualidade) e `applyFinalState`/`simulateFinalState` (estado final em memória); a consulta de ocupante por `day` sai do individual.
- `veltra-backend/src/training-plans/volume-adjustment.service.ts`: `adjustForOvershoot` grava `plannedWeeklyKm` junto de `volumeAdjusted`, `volumeAdjustedReason` e `volumeAdjustedAt`.
- `veltra-backend/src/training-plans/training-plans.service.spec.ts`: dublê de transação com trava compartilhado pelos dois caminhos, casos de volume, qualidade, ciência, swap, colisão, concorrência, total e ausência de `birthDate`.
- `veltra-backend/src/health/age-policy.spec.ts`: caso da avaliação pura de volume e qualidade.
- `veltra-backend/src/training-plans/volume-adjustment.service.spec.ts`: caso do total recalculado depois do corte.

## Testes existentes que mudam

- `training-plans.service.spec.ts`, `batchMocks`: o dublê passa a servir as duas rotas (o individual também entra em `dataSource.transaction`) e o repositório de plano dentro da transação ganha `findOne` com `lock` e `save` do plano. Motivo: a leitura e a validação agora acontecem depois da trava.
- `training-plans.service.spec.ts`, "rejeita lote que criaria dia duplicado sem aplicar nada": perde `expect(dataSource.transaction).not.toHaveBeenCalled()`, porque a validação roda dentro da transação; continua provando que nada foi salvo e que o store não mudou.
- `training-plans.service.spec.ts`, "rejeita dia duplicado no PUT individual": a ocupação do dia deixa de ser uma consulta por `day` e passa a sair do estado final em memória; a asserção de `DAY_COLLISION` continua.
- `training-plans.service.spec.ts`, casos de descanso e de leitura: seguem passando com o dublê novo, sem mudança de expectativa.
- `volume-adjustment.service.spec.ts`, casos que conferem o payload de `planRepository.update`: passam a esperar também `plannedWeeklyKm`; os casos que provam que o ajuste não age continuam iguais.

## Mudança de dados

Nenhuma. Sem seed, backfill ou migration: o `plannedWeeklyKm` desatualizado de planos antigos é recalculado na primeira edição aceita ou no próximo ajuste de volume, e a leitura continua normalizando o que não foi gravado.

## Documentos atualizados

- `docs/lld.md`, §8.8 "Edição de sessão": transação com trava `pessimistic_write` na linha do plano, ordem plano → sessões, leitura sem `relations`, validação no estado final (distância, dia único, volume e qualidade), recusa de volume/qualidade sem ciência e gravação de `plannedWeeklyKm`.
- `docs/lld.md`, §8.10 "Ajuste de volume por excesso": gravação de `plannedWeeklyKm` com o volume do plano ajustado depois do corte.
- `docs/lld.md`, §13.2 "Ajustes de plano": quais limites valem na edição (apenas `maxWeeklyKm` e `maxQualitySessions` absolutos, `volumeFactor` só na geração), como qualidade e volume são contados e que a ciência cobre só a distância.
- `docs/lld.md`, §20 "Lacunas e cuidados conhecidos": trava só nas rotas de edição, ausência de índice único de dia e a ordem de trava invertida entre edição e ajuste de volume.
