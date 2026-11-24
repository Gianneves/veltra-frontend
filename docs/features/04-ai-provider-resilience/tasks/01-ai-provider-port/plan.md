# Plano da F04-T01: Porta de fornecedor de IA

Tarefa: [task.md](task.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dado cada caminho de texto que existe hoje — insight de corrida, análise do plano,
chat com e sem streaming, desempate de pareamento e o `generateInsight` genérico —, quando o
`AiService` é chamado com um dublê da porta, então o pedido entregue à porta traz a tarefa, a
temperatura, o teto de tokens e o timeout da tabela do LLD §12, as mensagens trazem o prompt de
sistema do caminho e o contexto recebido como mensagem de usuário, e o diff não altera o texto dos
prompts.

**Teste previsto:** unidade, `src/ai/ai.service.spec.ts`, "pede cada tarefa ao fornecedor com o
prompt, a temperatura, o teto e o timeout do LLD".

### CA2

**Marca:** teste de unidade

**Cenário:** Dado que o tier cheap devolve texto que não passa no parser, quando a tarefa é
chamada, então o mesmo fornecedor recebe uma segunda chamada no tier premium, sem trocar de
adaptador; e no streaming, quando a falha acontece antes do primeiro token, a resposta é repetida
no premium, e quando acontece depois do primeiro token, o texto parcial é devolvido sem nova
chamada.

**Teste previsto:** unidade, `src/ai/ai.service.spec.ts`, "escala para o premium quando o texto do
cheap não passa no parser", "repete no premium quando o streaming falha antes do primeiro token" e
"devolve o texto parcial quando o streaming falha depois do primeiro token".

### CA3

**Marca:** teste de unidade

**Cenário:** Dado um atleta com corrida importada, quando `AiService.createEmbedding` é chamado,
então o vetor vem de `OpenAiProvider.createEmbedding`, a porta não recebe chamada nenhuma e a
exceção de falha continua subindo para o `try/catch` do `activities.service`, que não muda.

**Teste previsto:** unidade, `src/ai/ai.service.spec.ts`, "gera o embedding pelo adaptador do
OpenAI sem passar pela porta".

### CA4

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa procura `@langchain` e `new ChatOpenAI` fora
de `src/ai/`, então não encontra ocorrência; e em `insights`, `coach`, `training-plans` (incluindo
`activity-matcher`) e `activities` os únicos métodos de IA chamados continuam sendo os do
`AiService`.

### CA5

**Marca:** teste de unidade

**Cenário:** Dado o repositório com a mudança aplicada, quando quem revisa roda as cinco suítes da
tarefa, o build e o lint dos arquivos alterados, então todos passam e nenhum caso existente teve a
expectativa de conteúdo alterada — só o módulo de teste do `ai.service.spec` ganha os dublês.

**Teste previsto:** unidade, `npx jest src/ai src/coach src/insights src/training-plans` (as cinco
suítes da tarefa), mais `npm run build` e `npx eslint src/ai`. As três suítes de DI conhecidas
(`auth.service.spec`, `auth.controller.spec`, `users.service.spec`) ficam fora, como no baseline.

## Contrato

O contrato não muda. Nenhuma rota, evento ou tabela nasce, muda ou sai nesta tarefa: a porta é
interna ao backend. `GET /activities/:id/insight`, `POST /activities/:id/insight`, `GET
/training-plans`, `GET /training-plans/current`, `POST /training-plans/regenerate`, `POST
/coach/chat`, `POST /coach/chat/stream` e `GET /coach/chat` devolvem o mesmo corpo e os mesmos
status de hoje. Não há chave de Redis nesta tarefa (`ai:provider:primary:down`,
`ai:provider:notice:<userId>` e `ai:plan-review:attempt:<planId>` nascem na `F04-T02`, `T03` e
`T04`) e nenhuma variável de ambiente nova.

## Verificação do contrato

Nenhum item: a tarefa não cria, muda nem remove rota, evento, tabela ou chave, então não há
contrato a provar aqui. A paridade das respostas existentes é provada por `CA1` (o pedido que cada
caminho monta) e por `CA5` (as suítes que já cobrem as rotas).

## Decisões

- A porta é a classe abstrata `AiProvider` em `src/ai/ai-provider.ts`, registrada no `AiModule` com
  `{ provide: AiProvider, useExisting: OpenAiProvider }`: o Nest resolve por token, e a `F04-T02`
  troca a implementação registrada sem tocar no `AiService`.
- `decide(request)` é separado de `complete`/`stream`, que recebem o tier explícito: o escalonamento
  por parsing e o fallback premium do streaming precisam saber o tier **antes** da primeira
  chamada, e a decisão continua no adaptador.
- O embedding fica fora da porta, em `OpenAiProvider.createEmbedding`, e
  `AiService.createEmbedding` só delega, mantendo assinatura e exceção: o DeepSeek não oferece
  endpoint de embedding e vetores de fornecedores diferentes não são comparáveis (spec §2.2).
- O timeout sai do `Promise.race` do `AiService` para o `AbortController` do adaptador, que usa o
  `timeoutMs` do pedido (`<= 0` desliga): o controle passa a ser de quem faz a chamada, e a duração
  de cada tarefa continua a da tabela do LLD §12.
- `MAX_TOKENS_BY_TASK` continua em `model-router.ts` e passa a ser exportado; o `AiService` envia o
  teto no pedido e o adaptador o aplica ao `ChatOpenAI`, sem uma segunda tabela de limites.
- `hasPlanChangeIntent` e `hasHealthSignal` passam a existir também como funções exportadas em
  `model-router.ts`, e os métodos da classe continuam delegando nelas: o `AiService` monta
  `routing` sem injetar o router, e `model-router.spec.ts` segue verde.
- `buildRoutedRunnable` é removido: com o tier explícito no pedido, o adaptador monta o modelo com
  `createModel` e o `RunnableBranch` vira código morto.
- O adaptador devolve o texto como veio, inclusive vazio: hoje uma resposta vazia cai no parser e
  escala para o premium, e classificar vazio como indisponibilidade é decisão da `F04-T02`, onde o
  alternativo existe.
- `AiProviderUnavailableError` carrega `provider`, `reason` (`http`, `transport` ou `timeout`),
  `status` e `cause`: a `F04-T02` decide qual falha troca de fornecedor sem refazer a tradução do
  erro no adaptador.
- O `AiService` mantém os gates `if (!process.env.OPENAI_API_KEY) return null` desta tarefa: a
  regra "qualquer fornecedor configurado" é da `F04-T02` (spec §3.1) e mudá-la aqui alteraria o
  comportamento observável.
- Mensagens trafegam como `{ role, content }` e a conversão para `SystemMessage`/`HumanMessage`/
  `AIMessage` fica no adaptador: o `AiService` deixa de importar SDK e concentra prompt, sinais,
  parsing, escalonamento e log.
- A prova de `CA1` não compara o prompt de sistema palavra a palavra: o teste confere tarefa,
  roles, contexto, temperatura, teto e timeout, e a revisão do diff confere que os literais de
  prompt não mudaram. Um snapshot dos prompts duplicaria o texto no spec e apodreceria a cada
  ajuste de prompt sem provar nada além disso.

## Arquivos e interfaces

- `src/ai/ai-provider.ts` (novo): tipos `AiProviderMessage` (`{ role, content }`),
  `AiProviderRequest` (`task`, `messages`, `temperature`, `maxTokens`, `timeoutMs`, `routing`),
  `AiProviderResult` (`text`, `decision`, `usage`), `AiProviderFailureReason` (`http`,
  `transport`, `timeout`), a classe `AiProviderUnavailableError` e a classe abstrata `AiProvider`
  com `decide`, `complete`, `stream` (com `onToken`) e `canEscalate`.
- `src/ai/openai-provider.ts` (novo): `OpenAiProvider extends AiProvider`, sobre o
  `AiModelRouter`/`ChatOpenAI`, com conversão de mensagens, `AbortController` para o timeout,
  tradução de falha para `AiProviderUnavailableError` e `createEmbedding(text)` fora da porta.
- `src/ai/model-router.ts` (alterado): `MAX_TOKENS_BY_TASK` exportado; `createModel` recebe o teto
  do pedido (padrão da tabela); `hasPlanChangeIntent` e `hasHealthSignal` exportados como funções,
  com os métodos delegando; `buildRoutedRunnable` removido.
- `src/ai/ai.service.ts` (alterado): passa a depender de `AiProvider` e de `OpenAiProvider` (só
  para o embedding); monta `AiProviderRequest`, decide o tier pela porta, faz o escalonamento e o
  fallback de streaming, loga o uso e mantém prompts, parsing e assinaturas públicas
  (`createEmbedding`, `generateInsight`, `generateCoachReplyStream`, `generateActivityInsight`,
  `generatePlanReview`, `classifyActivityMatch`).
- `src/ai/ai.module.ts` (alterado): provê `AiModelRouter`, `OpenAiProvider` e `AiProvider`
  (`useExisting`); continua exportando só `AiService`.
- `src/ai/ai.service.spec.ts` (alterado): dublês de `AiProvider` e `OpenAiProvider` no lugar do
  `AiModelRouter`, mais os casos de `CA1`, `CA2` e `CA3`.

## Testes existentes que mudam

- `src/ai/ai.service.spec.ts`: o módulo de teste troca `AiModelRouter` pelos dublês da porta e do
  adaptador; `should be defined` e os casos de `splitCoachReply` continuam com a mesma expectativa.
- Nenhum outro: `coach`, `insights`, `training-plans`, `activity-matcher` e `activities` já recebem
  o `AiService` por dublê, e `model-router.spec.ts` continua provando `decide`, `modelName` e
  `escalationEnabled` sem mudança de comportamento.

## Mudança de dados

Nenhuma. Sem seed, backfill, migration ou chave de Redis nesta tarefa.

## Documentos atualizados

- `docs/lld.md`, §12 "AI service": a lista de arquivos passa a incluir `ai-provider.ts` e
  `openai-provider.ts`, entra o bloco da porta (pedido, resultado, erro tipado, onde ficam mensagens,
  teto, timeout, log e embeddings) e o registro no `AiModule`.
- `docs/lld.md`, §12.1 "Roteamento de modelos": o `AiModelRouter` passa a ser usado só pelo
  adaptador; `MAX_TOKENS_BY_TASK` exportado e aplicado pelo adaptador; sinais disponíveis como
  funções exportadas; `RunnableBranch` sai da descrição junto com `buildRoutedRunnable`.
- `docs/lld.md`, cabeçalho: "Última atualização".
