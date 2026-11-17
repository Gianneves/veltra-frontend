# Roadmap — Veltra

> **Papel:** dono da lista de funcionalidades, da ordem, das dependências e do status.
> PRD, spec e tarefas apontam para cá; nenhum outro documento mantém esta lista.

---

## Funcionalidades

| Nº | Funcionalidade | Status | Depende de | PRD | Spec |
|---|---|---|---|---|---|
| `F01` | Backend business-rule refactor | `em andamento` | — | [PRD](./features/01-backend-business-rule-refactor/prd.md) | [Spec](./features/01-backend-business-rule-refactor/spec.md) |
| `F02` | Next workout on the server | `planejada` | `F01` | — | — |
| `F03` | Backend security hardening | `planejada` | `F01` | — | — |

---

## Status

| Status | Significado | Quem muda |
|---|---|---|
| `planejada` | Registrada no roadmap, ainda sem PRD. | Quem cria a funcionalidade |
| `PRD pronto` | PRD escrito e aprovado. | Skill `prd` |
| `spec pronta` | Spec escrita e aprovada, com as tarefas decompostas. | Skill `to-spec` |
| `em andamento` | Primeiro plano de tarefa commitado. | Skill `plan-task` |
| `concluída` | Funcionalidade entregue no PR. | PR que entrega |

O status nunca regride: um comando só avança o status, nunca o traz de volta.

---

## Regras

- O número é global, com dois dígitos, e nunca muda depois de atribuído (`F01`, `F02`…). Uma
  funcionalidade removida deixa o número vago; ele não é reaproveitado.
- A ordem das linhas é a ordem de entrega pretendida, respeitadas as dependências.
- "Depende de" lista apenas funcionalidades deste roadmap, pelos números.
- A pasta de cada funcionalidade é `docs/features/<NN>-<titulo>/`, com o mesmo número e um título
  em kebab-case sem acento (`01-login-com-strava`).
- Antes de acrescentar uma funcionalidade, verifique se ela já existe: o roadmap é a fonte da
  numeração, e duplicar número quebra PRD, spec e tarefas.
