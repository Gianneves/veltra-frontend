# 03: Aviso único da troca de fornecedor

**Status:** em andamento

**Objetivo:** quando a primeira resposta de chat de um episódio de falha vem do alternativo, o atleta vê uma única linha avisando que houve uma instabilidade; o aviso não se repete nas mensagens seguintes nem volta depois que o principal retoma.

**Escopo:** acrescentar o aviso ao texto da mensagem do coach e gravá-lo junto com a mensagem, controlar a marca por atleta no Redis e apagá-la quando o principal atende uma resposta do chat. Fica de fora: campo novo no SSE ou no `done`, banner ou qualquer mudança de frontend, aviso em insight ou plano.

**Bloqueada por:** `02` — Alternativa DeepSeek com troca e volta automáticas.

**Decisões consumidas de outras tarefas:** `02` — Alternativa DeepSeek com troca e volta automáticas: o metadado de qual fornecedor atendeu cada resposta e a convenção das chaves `ai:*` no Redis.

**LLD de origem:** §11.8 — Streaming; §16 — Redis e processamento assíncrono; §17.4 — Chat do coach.

**LLD a atualizar:** §11.8 (aviso no texto da resposta), §16 (chave do aviso) e §17.4 (o chat exibe o texto, sem campo novo).

## Critérios de aceite

- [ ] **CA1** · A primeira resposta de chat do episódio atendida pelo alternativo contém, no texto salvo e no evento `done`, a linha de aviso em pt-BR definida na spec.
- [ ] **CA2** · As respostas seguintes do mesmo episódio, mesmo vindas do alternativo, não repetem o aviso.
- [ ] **CA3** · Uma resposta atendida pelo principal apaga a marca; e um novo episódio de falha volta a avisar uma vez mesmo que a marca anterior não tenha sido apagada, porque o identificador do episódio muda.
- [ ] **CA4** · Quando os dois fornecedores falham, a mensagem de erro em pt-BR não ganha aviso e a marca não é consumida.
- [ ] **CA5** · Nenhuma rota, campo de resposta, evento SSE ou componente de frontend muda; `coach.service.spec.ts` prova CA1–CA4.
