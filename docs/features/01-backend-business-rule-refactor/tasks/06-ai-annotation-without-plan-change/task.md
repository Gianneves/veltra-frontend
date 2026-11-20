# 06: Anotação de IA sem mudança de plano

**Status:** em andamento

**Objetivo:** o caminho que grava foco, notas do plano e dicas do coach produz apenas esses três campos; nenhuma anotação de IA altera distância, pace, dia, tipo ou conclusão de uma sessão.

**Escopo:** extrair do enriquecimento do plano um construtor puro que devolve as atualizações de foco, notas e dicas, mantendo os limites atuais de 120 caracteres para foco, 1.200 para notas do plano e 500 para notas da sessão; aplicar o resultado no service; spec do construtor provando que só os três campos são produzidos. Ficam de fora mudanças de prompt, de modelo e do fluxo de propostas.

**Bloqueada por:** Nenhuma (pode começar imediatamente).

**LLD de origem:** §8.2 — Geração do plano, passo 11; ADR-0002; HLD §9 — Invariantes arquiteturais, item 7.

**LLD a atualizar:** §8.2 — Geração do plano.

## Critérios de aceite

- [ ] **CA1** · O construtor puro recebe a revisão da IA e o plano e devolve somente foco, notas do plano e notas de sessão.
- [ ] **CA2** · Nenhuma atualização produzida toca distância, pace, dia, tipo ou conclusão.
- [ ] **CA3** · Os limites de tamanho atuais continuam valendo para foco, notas do plano e notas da sessão.
- [ ] **CA4** · O service aplica o resultado e o comportamento visível do plano não muda quando não há IA.
- [ ] **CA5** · O spec novo prova a garantia da ADR-0002 e passa junto com os demais specs tocados.
- [ ] **CA6** · `npx jest` nos specs tocados, `npx eslint` nos arquivos alterados e `npm run build` passam.
