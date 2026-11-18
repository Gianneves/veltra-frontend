# 02: Limites de idade na edição

**Status:** em andamento

**Objetivo:** editar uma sessão ou a semana inteira aplica os mesmos limites de idade da geração — distância por sessão, volume semanal e quantidade de qualidade — no estado final, dentro de uma transação que trava o plano; o total planejado é recalculado depois de cada edição aceita e depois do ajuste de volume.

**Escopo:** transação e trava pessimista na linha do plano nas duas rotas de edição, na ordem plano → sessões; simulação do estado final para dia, volume e qualidade; avaliação pura em `age-policy` para `maxWeeklyKm` e `maxQualitySessions`, com recusas `AGE_POLICY` e sem sobreposição por ciência; manutenção do `acknowledgeAgePolicy` apenas para distância; recálculo de `plannedWeeklyKm` após edição e após o corte do ajuste de volume. Ficam de fora a interface, a análise semanal, a ingestão e a anotação de IA.

**Bloqueada por:** 01 — Descanso nunca concluído.

**Decisões consumidas de outras tarefas:** 01 — Descanso nunca concluído: semântica e unidade de `plannedWeeklyKm`, normalização de descanso e limpeza de realizados.

**LLD de origem:** §8.8 — Edição de sessão; §8.10 — Ajuste de volume por excesso; §13.2 — Ajustes de plano; HLD §9 — Invariantes arquiteturais, itens 3 e 8.

**LLD a atualizar:** §8.8 — Edição de sessão; §8.10 — Ajuste de volume por excesso; §13.2 — Ajustes de plano; §20 — Lacunas e cuidados conhecidos.

## Critérios de aceite

- [ ] **CA1** · Editar a distância de uma sessão de modo que o volume da semana passe de `maxWeeklyKm` é recusado com `AGE_POLICY` e a mensagem em pt-BR cita volume e limite; nada é gravado.
- [ ] **CA2** · Editar a semana de modo que a contagem de `interval`, `tempo` e `fartlek` passe de `maxQualitySessions` é recusado com `AGE_POLICY` e a mensagem cita qualidade e limite; nada é gravado.
- [ ] **CA3** · `acknowledgeAgePolicy` continua aceitando apenas a distância acima do limite; volume e qualidade continuam recusados mesmo com a ciência.
- [ ] **CA4** · O lote continua atômico e o swap de dias válido continua passando; o dia único é verificado no estado final, incluindo sessões fora do lote.
- [ ] **CA5** · Duas edições concorrentes no mesmo plano não deixam duas sessões no mesmo dia; a segunda enxerga o estado da primeira.
- [ ] **CA6** · `plannedWeeklyKm` é recalculado após edição individual, após lote e após o ajuste de volume por excesso.
- [ ] **CA7** · Sem `birthDate`, nenhum limite de idade é aplicado, como hoje.
- [ ] **CA8** · A avaliação pura de volume/qualidade tem teste em `age-policy.spec.ts`; o service e o lote provam a recusa no estado final.
- [ ] **CA9** · `npx jest` nos specs tocados, `npx eslint` nos arquivos alterados e `npm run build` passam.
