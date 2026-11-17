# 01: Descanso nunca concluído

**Status:** concluída

**Objetivo:** em qualquer caminho, uma sessão de descanso aparece sem conclusão, com distância e pace zerados e sem atividade vinculada; converter uma sessão concluída em descanso desfaz o pareamento, e planos antigos já gravados são normalizados na leitura. O total planejado da semana passa a ser calculado por um único helper, em metros.

**Escopo:** conversão para descanso na edição individual e em lote; limpeza de `completed`, `activityId`, `actualDistance`, `actualPace`, `actualMovingTime`, `matchScore`, `matchMethod` e `matchedAt`; recusa de vínculo manual com descanso (`REST_SESSION`); guarda no ponto que grava vínculo; normalização de descanso em `findCurrent`, `findAll` e `findByWeek`; helpers puros de estado da sessão e de soma do volume planejado. Ficam de fora os limites de idade na edição, a trava de concorrência, a análise semanal, a ingestão e a interface.

**Bloqueada por:** Nenhuma (pode começar imediatamente).

**LLD de origem:** §8.1 — Endpoints; §8.8 — Edição de sessão; §8.9 — Pareamento de atividades; §4.1 — Entidades e colunas; §4.2 — Observações de modelagem.

**LLD a atualizar:** §4.1 — Entidades e colunas; §4.2 — Observações de modelagem; §8.1 — Endpoints; §8.8 — Edição de sessão; §8.9 — Pareamento de atividades; §20 — Lacunas e cuidados conhecidos.

## Critérios de aceite

- [x] **CA1** · Converter uma sessão concluída em descanso deixa `completed = false`, `activityId` nulo, realizados nulos, distância e pace zero, e a sessão deixa de contar como treino feito.
- [x] **CA2** · Converter uma sessão de descanso em treino devolve a sessão ao estado planejado, sem conclusão.
- [x] **CA3** · Vincular uma atividade a uma sessão de descanso é recusado com `REST_SESSION` e nada é alterado; o pareamento automático continua ignorando descanso.
- [x] **CA4** · Planos antigos com descanso concluído saem da leitura normalizados: descanso sem conclusão, com distância/pace zero e realizados nulos.
- [x] **CA5** · `plannedWeeklyKm` devolvido por `findCurrent`/`findAll`/`findByWeek` é igual à soma das distâncias planejadas das sessões não-descanso, em metros.
- [x] **CA6** · `npx jest` nos specs tocados, `npx eslint` nos arquivos alterados e `npm run build` passam.
