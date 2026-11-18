# 04: Semana atual da análise

**Status:** concluída

**Objetivo:** `GET /analytics/weekly` conta a semana atual de segunda a domingo no horário local do servidor, em intervalo semiaberto, e só as corridas do atleta; uma corrida na virada pertence a uma única semana.

**Escopo:** consulta do `AnalyticsService` com janela `[segunda 00:00, segunda seguinte 00:00)`, filtro por usuário e por `Run`/`TrailRun`/`VirtualRun`, usando a constante compartilhada; totais de distância, tempo e quantidade; spec do service. Ficam de fora o dashboard e o plano (05), o filtro “Semana” da lista de atividades e o horário local do atleta.

**Bloqueada por:** 03 — Ingestão e pareamento por dono.

**Decisões consumidas de outras tarefas:** 03 — Ingestão e pareamento por dono: constante compartilhada de corridas.

**LLD de origem:** §14 — Analytics; HLD §9 — Invariantes arquiteturais, item 6.

**LLD a atualizar:** §14 — Analytics; §20 — Lacunas e cuidados conhecidos.

## Critérios de aceite

- [x] **CA1** · A janela começa na segunda-feira 00:00 local e termina na segunda seguinte 00:00 local, sem incluir o limite final.
- [x] **CA2** · Uma corrida exatamente na virada é contada em uma única semana.
- [x] **CA3** · Atividade que não é corrida não entra em distância, tempo nem contagem.
- [x] **CA4** · A consulta filtra pelo usuário da sessão e nunca soma atividade de outro atleta.
- [x] **CA5** · Os campos devolvidos continuam `totalDistance`, `totalTime`, `runCount` e `weekStart`, com o mesmo formato.
- [x] **CA6** · `npx jest` no spec tocado, `npx eslint` nos arquivos alterados e `npm run build` passam.
