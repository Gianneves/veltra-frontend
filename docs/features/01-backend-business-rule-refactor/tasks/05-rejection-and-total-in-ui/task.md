# 05: Recusa e total na interface

**Status:** a fazer

**Objetivo:** quando o servidor recusa uma edição, a pessoa vê o motivo em pt-BR no próprio cartão da sessão ou da proposta; o plano e o dashboard mostram o mesmo total planejado da semana, com o realizado separado.

**Escopo:** leitura do corpo JSON de erro pelo client HTTP, com `message` e `code`; resultado com motivo em edição individual e em lote; exibição da recusa no cartão da sessão; uso de `plannedWeeklyKm` no cabeçalho da semana do plano e no planejado do dashboard; exibição da mensagem real no cartão de proposta do coach. Ficam de fora componentes, páginas e itens de sidebar novos, cálculo de limite no cliente e mudança de rota.

**Bloqueada por:** 01 — Descanso nunca concluído; 02 — Limites de idade na edição.

**Decisões consumidas de outras tarefas:** 01 — Descanso nunca concluído: normalização de descanso, semântica de `plannedWeeklyKm` e código `REST_SESSION`. 02 — Limites de idade na edição: corpo de erro de volume/qualidade (`AGE_POLICY`) e total recalculado.

**LLD de origem:** §2 — Convenções transversais; §17.3 — Client HTTP; §17.4 — Chat do coach; §17.6 — Páginas e dados; §20 — Lacunas e cuidados conhecidos.

**LLD a atualizar:** §2 — Convenções transversais; §17.3 — Client HTTP; §17.6 — Páginas e dados; §20 — Lacunas e cuidados conhecidos.

## Critérios de aceite

- [ ] **CA1** · Um 400 com `{ code, message }` chega ao chamador como `{ status, message, code }` com o texto do servidor; um corpo não JSON mantém o fallback atual.
- [ ] **CA2** · A página do plano exibe a mensagem da recusa ao editar distância ou pace, sem alterar a semana e sem recarregar com estado divergente.
- [ ] **CA3** · O chat do coach exibe a mensagem real quando uma proposta é recusada ao aplicar, no lugar do texto genérico.
- [ ] **CA4** · O planejado do dashboard e o cabeçalho da semana do plano usam `plannedWeeklyKm` e exibem o mesmo valor; o realizado continua vindo de `/analytics/weekly` e rotulado como realizado.
- [ ] **CA5** · Nenhuma rota, campo, componente de `ui` ou item de sidebar novo é criado.
- [ ] **CA6** · `npx tsc --noEmit` passa e o roteiro manual de tela da spec é executado.
