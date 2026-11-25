# 04: Backfill da anotação do plano na leitura

**Status:** concluída

**Objetivo:** o plano da semana atual que ficou sem análise, foco ou dicas por causa de uma falha de IA recebe esse conteúdo em background quando o atleta o abre, assim que um fornecedor estiver respondendo, sem atrasar nem alterar a resposta da leitura.

**Escopo:** extrair o construtor de contexto da revisão para uso compartilhado entre geração e backfill; disparar a revisão em background em `GET /training-plans/current` e `GET /training-plans` (avaliando só a semana atual) quando `focus` e `coachNotes` estiverem ausentes; trava curta por plano no Redis; aplicar somente `focus`, `coachNotes` e `notes`. Fica de fora: alterar sessões, refazer plano, mudar contrato, tocar no frontend e o insight (que já reenvia na leitura).

**Bloqueada por:** `02` — Alternativa DeepSeek com troca e volta automáticas.

**Decisões consumidas de outras tarefas:** `02` — Alternativa DeepSeek com troca e volta automáticas: a convenção das chaves `ai:*` e o tratamento de Redis indisponível.

**LLD de origem:** §8.1 — Endpoints; §8.2 — Geração do plano; §16 — Redis e processamento assíncrono; ADR-0002.

**LLD a atualizar:** §8.1 (leitura pode disparar o backfill), §8.2 (contexto compartilhado e alcance da revisão na leitura), §16 (chave da trava) e §20 (custo em leitura).

## Critérios de aceite

- [x] **CA1** · `GET /training-plans/current` com plano sem `focus` e sem `coachNotes` dispara a revisão em background e devolve a mesma resposta, no mesmo tempo, sem esperar a IA.
- [x] **CA2** · Plano com `focus` ou `coachNotes` preenchido não dispara backfill.
- [x] **CA3** · `GET /training-plans` avalia só o plano da semana atual e não bloqueia a resposta.
- [x] **CA4** · A trava por plano impede repetir a tentativa dentro de 60 s; passado o prazo, a leitura seguinte tenta de novo.
- [x] **CA5** · O backfill grava apenas `focus`, `coachNotes` e `notes`, nunca distância, pace, dia, tipo ou conclusão de sessão; `training-plans.service.spec.ts` prova CA1–CA5.
- [x] **CA6** · Sem nenhum fornecedor configurado, a leitura não dispara chamada de IA.
