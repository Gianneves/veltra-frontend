# 02: Alternativa DeepSeek com troca e volta automáticas

**Status:** concluída

**Objetivo:** quando o OpenAI está fora do ar ou sem saldo, os quatro caminhos de texto (insight, análise do plano, chat e pareamento) continuam sendo atendidos pelo DeepSeek; assim que o principal volta a responder, o atendimento retorna a ele sozinho.

**Escopo:** adaptador do DeepSeek (API compatível com OpenAI, modelo único, streaming sem metadado de uso), classificação de falha, serviço de estado em Redis (indisponibilidade, sonda e volta), metadado de qual fornecedor atendeu, variáveis `DEEPSEEK_MODEL` e `AI_FAILOVER_COOLDOWN_SECONDS`, logs com fornecedor e a geração da revisão do plano deixando de exigir só `OPENAI_API_KEY`. Fica de fora: aviso no chat (tarefa `03`), backfill do plano (tarefa `04`), embeddings pelo alternativo e qualquer mudança de contrato.

**Bloqueada por:** `01` — Porta de fornecedor de IA.

**Decisões consumidas de outras tarefas:** `01` — Porta de fornecedor de IA: o contrato de chamada, o erro tipado de indisponibilidade e a divisão entre prompt/parsing (`AiService`) e transporte (adaptador).

**LLD de origem:** §3.3 — Variáveis de ambiente do backend; §12 — AI service; §12.1 — Roteamento de modelos; §12.2 — Onde o custo é consumido; §16 — Redis e processamento assíncrono.

**LLD a atualizar:** §3.3 (variáveis novas), §12 (porta e fallback), §12.1 (fornecedor e cooldown), §12.2 (custo por fornecedor), §16 (chave de indisponibilidade) e §20 (observabilidade). HLD §4 (diagrama), §5.2 (módulo `ai`), §6.7 (roteamento), §10 (desempenho/confiabilidade/observabilidade) e §11 (limitações).

## Critérios de aceite

- [x] **CA1** · Falha de transporte, timeout, HTTP `401/402/403/429/5xx` ou resposta vazia nas tarefas sem streaming no principal faz a mesma chamada ser atendida pelo DeepSeek, nos quatro caminhos de texto.
- [x] **CA2** · Depois da falha, as chamadas dentro de `AI_FAILOVER_COOLDOWN_SECONDS` (padrão 60 s) vão direto ao alternativo; vencido o prazo, a chamada seguinte sonda o principal e, no sucesso, a marca é limpa e ele volta a atender.
- [x] **CA3** · Texto que não passa no parser não troca de fornecedor: continua o escalonamento cheap → premium no principal e, se o premium também falhar, a tarefa falha como hoje.
- [x] **CA4** · No streaming, a troca só acontece antes do primeiro token; depois disso, o texto parcial é mantido e o fluxo termina como hoje.
- [x] **CA5** · Com principal e alternativo falhando, a tarefa devolve o erro que o fluxo já trata (insight `failed`, chat em pt-BR, anotação ausente) e a chamada seguinte volta a tentar o principal primeiro.
- [x] **CA6** · Sem `OPENAI_API_KEY` e com `DEEPSEEK_API_KEY`, o alternativo atende desde a primeira chamada — inclusive a revisão do plano, que hoje exige a chave do OpenAI; sem nenhuma das duas, o fluxo segue sem IA; com o Redis fora, a IA continua tentando o principal a cada chamada.
- [x] **CA7** · O adaptador DeepSeek usa `https://api.deepseek.com`, `DEEPSEEK_MODEL` (padrão `deepseek-chat`), a temperatura, o teto de tokens e o timeout da tarefa, e não envia metadado de uso no streaming.
- [x] **CA8** · `ai.service.spec.ts` prova CA1–CA6 com adaptadores e estado falsos, sem chamada de rede; `npm run build` e o lint dos arquivos alterados passam.
