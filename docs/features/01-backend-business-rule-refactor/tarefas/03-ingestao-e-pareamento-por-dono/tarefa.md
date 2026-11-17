# 03: Ingestão e pareamento por dono

**Status:** a fazer

**Objetivo:** uma atividade importada só alcança o plano e os dados do próprio atleta; apagar no Strava desfaz só o pareamento do dono. A lista de esportes de corrida deixa de viver só no webhook e vira uma constante compartilhada.

**Escopo:** resolução da atividade por `activityStravaId` **e** dono na exclusão e no upsert; `upsert` que não atualiza registro de outro atleta; desvínculo de sessões escopado pelo plano do atleta; constante compartilhada de corridas (`Run`, `TrailRun`, `VirtualRun`) usada pelo webhook. Ficam de fora a análise semanal (04), a assinatura/rate limit do webhook (F03) e o pareamento automático em si.

**Bloqueada por:** Nenhuma (pode começar imediatamente).

**LLD de origem:** §6.2 — ActivitiesService; §7.3 — Webhook; HLD §9 — Invariantes arquiteturais, itens 1 e 5.

**LLD a atualizar:** §6.2 — ActivitiesService; §7.3 — Webhook; §20 — Lacunas e cuidados conhecidos.

## Critérios de aceite

- [ ] **CA1** · Um evento de exclusão cujo `owner_id` não é o dono da atividade não apaga a atividade nem desvincula sessão alguma.
- [ ] **CA2** · Um evento de criação/atualização cujo `owner_id` não é o dono não sobrescreve a atividade existente de outro atleta.
- [ ] **CA3** · Excluir uma corrida do dono desfaz o pareamento apenas das sessões do plano daquele atleta e remove a atividade.
- [ ] **CA4** · A constante de corridas usada pela ingestão passa a ser compartilhada e o webhook a utiliza; a análise semanal poderá reutilizá-la.
- [ ] **CA5** · O vínculo manual continua recusando atividade de outro atleta.
- [ ] **CA6** · `npx jest` nos specs tocados, `npx eslint` nos arquivos alterados e `npm run build` passam.
