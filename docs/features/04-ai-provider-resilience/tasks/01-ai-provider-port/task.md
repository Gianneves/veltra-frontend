# 01: Porta de fornecedor de IA

**Status:** em andamento

**Objetivo:** todo texto gerado por IA passa a ser pedido por um contrato único de chamada, com o OpenAI atrás dele, sem mudar prompt, parsing, tier nem comportamento observável.

**Escopo:** contrato da porta (mensagens, tarefa, temperatura, teto de tokens, timeout e streaming por callback), erro tipado de indisponibilidade, adaptador do OpenAI sobre o `AiModelRouter`, refatoração do `AiService` para delegar o transporte e registro no `AiModule`. Fica de fora: DeepSeek, cooldown, aviso no chat, backfill do plano e qualquer mudança de rota, campo ou frontend.

**Bloqueada por:** Nenhuma (pode começar imediatamente).

**LLD de origem:** §12 — AI service; §12.1 — Roteamento de modelos; §12.2 — Onde o custo é consumido; §19.4 — Nova regra de IA.

**LLD a atualizar:** §12 — AI service (porta e adaptador); §12.1 — Roteamento de modelos (o roteamento passa a viver no adaptador).

## Critérios de aceite

- [ ] **CA1** · Insight de corrida, análise/foco/dicas do plano, resposta do chat (com e sem streaming) e desempate de pareamento continuam atendidos pelo OpenAI, com o mesmo prompt de sistema, contexto, temperatura, teto de tokens e timeout de cada tarefa.
- [ ] **CA2** · O escalonamento cheap → premium por parsing inválido e o fallback premium do streaming continuam valendo no principal, como hoje.
- [ ] **CA3** · O embedding continua sendo gerado pelo OpenAI e a porta não o envolve; a indisponibilidade dele segue sem efeito no fluxo.
- [ ] **CA4** · Nenhum service de domínio (`insights`, `coach`, `training-plans`, `activities`) passa a importar SDK ou a construir modelo; todos continuam falando só com o `AiService`.
- [ ] **CA5** · Os specs existentes (`ai.service.spec`, `coach.service.spec`, `insights.service.spec`, `training-plans.service.spec`, `activity-matcher.service.spec`) continuam verdes sem alterar a expectativa de conteúdo, e `npm run build` e o lint dos arquivos alterados passam.
