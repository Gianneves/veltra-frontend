# Plano da F04-T02: Alternativa DeepSeek com troca e volta automáticas

Tarefa: [task.md](task.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dado o principal e o alternativo configurados, quando um caminho de texto — insight de
corrida, análise do plano, resposta do chat e desempate de pareamento, além do `generateInsight`
genérico — falha no principal por transporte, timeout, HTTP `401`, `402`, `403`, `429` ou `5xx`, ou
devolve resposta vazia numa tarefa sem streaming, então a mesma chamada (mesmas mensagens,
temperatura, teto de tokens e timeout) é feita no alternativo, o texto atende o caminho como hoje e
o resultado informa que o alternativo atendeu; um HTTP fora dessa lista (por exemplo `400`) não
troca de fornecedor.

**Teste previsto:** unidade, `src/ai/ai.service.spec.ts`, "atende pelo alternativo quando o
principal falha, em cada caminho de texto".

### CA2

**Marca:** teste de unidade

**Cenário:** Dado que o principal falhou, quando outra chamada acontece dentro de
`AI_FAILOVER_COOLDOWN_SECONDS`, então ela vai direto ao alternativo e o principal não é chamado, e o
marcador `ai:provider:primary:down` guarda o instante de expiração e um TTL de 60 s quando a variável
não está definida; quando a marca está vencida, então a chamada seguinte tenta o principal e, se ele
responde, a marca é apagada e ele volta a atender; se a sonda falha, a marca é renovada e o
alternativo atende.

**Teste previsto:** unidade, `src/ai/ai.service.spec.ts`, "vai direto ao alternativo dentro do
cooldown e sonda o principal depois do prazo" e "volta ao principal quando a sonda responde e
renova a marca quando ela falha".

### CA3

**Marca:** teste de unidade

**Cenário:** Dado o principal atendendo com texto que não passa no parser, quando a tarefa é
chamada, então o alternativo não é chamado, o principal recebe a segunda tentativa no tier premium e,
se o premium também não passar no parser, a tarefa devolve a falha de hoje; quando o texto que não
passa no parser vem do alternativo, que não tem tier para escalar, a tarefa termina na mesma falha
sem repetir a chamada.

**Teste previsto:** unidade, `src/ai/ai.service.spec.ts`, "escala para o premium quando o texto do
cheap não passa no parser" (caso existente, com a asserção de que o alternativo não foi chamado) e
"não escala no alternativo quando o texto não passa no parser".

### CA4

**Marca:** teste de unidade

**Cenário:** Dado o streaming do chat, quando o principal falha antes de emitir o primeiro token,
então o alternativo passa a transmitir a resposta do mesmo pedido; quando a falha acontece depois do
primeiro token, então o texto parcial continua com o atleta, o alternativo não é chamado e o fluxo
termina como hoje.

**Teste previsto:** unidade, `src/ai/ai.service.spec.ts`, "troca de fornecedor no streaming só antes
do primeiro token" (os dois cenários no mesmo caso).

### CA5

**Marca:** teste de unidade

**Cenário:** Dado que o principal e o alternativo falham na mesma chamada — com o principal marcado
ou depois de uma falha nova —, quando a tarefa é chamada, então o `AiService` devolve `null` para
insight, análise do plano, pareamento e chat — e o `InsightsService` grava o insight como `failed` e
o `CoachService` responde a mensagem em pt-BR de hoje — e a chamada seguinte volta a tentar o
principal primeiro, porque a marca foi apagada.

**Teste previsto:** unidade, `src/ai/ai.service.spec.ts`, "devolve a falha do fluxo e volta a tentar
o principal quando os dois fornecedores falham"; o estado `failed` já é provado por
`src/insights/insights.service.spec.ts`, "marks the insight as failed when the AI returns nothing", e
a resposta em pt-BR por `src/coach/coach.service.spec.ts`, "responde em pt-BR quando a IA não
devolve resposta".

### CA6

**Marca:** teste de unidade

**Cenário:** Dado `DEEPSEEK_API_KEY` e sem `OPENAI_API_KEY`, quando os quatro caminhos de texto são
chamados, então o alternativo atende desde a primeira chamada sem o principal ser tentado e a
revisão do plano é gerada; dado nenhum dos dois configurado, então os caminhos devolvem `null` e a
anotação do plano não é pedida; dado o Redis indisponível, então o `AiProviderStateService` trata o
erro como ausência de marca e cada chamada tenta o principal primeiro.

**Teste previsto:** unidade, `src/ai/ai.service.spec.ts`, "atende pelo alternativo sem a chave do
OpenAI", "segue sem IA quando nenhum fornecedor está configurado" e "continua tentando o principal a
cada chamada com o Redis fora"; unidade, `src/training-plans/training-plans.service.spec.ts`, "gera a
revisão com fornecedor configurado e sem OPENAI_API_KEY".

### CA7

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa abre `src/ai/deepseek-provider.ts`, então
encontra `https://api.deepseek.com` como constante, `DEEPSEEK_MODEL` com padrão `deepseek-chat`, a
temperatura e o teto de tokens vindos do pedido, o timeout de cada tarefa aplicado pelo mesmo
`AbortController` do principal e `streamUsage: false` no modelo, sem chamada de embedding; em
`.env.example` encontra `DEEPSEEK_MODEL` e `AI_FAILOVER_COOLDOWN_SECONDS`.

### CA8

**Marca:** teste de unidade

**Cenário:** Dado o repositório com a mudança, quando quem revisa roda as suítes tocadas, o build e o
lint dos arquivos alterados, então todos passam e nenhum caso existente viu a expectativa de conteúdo
mudar — só os dublês ganharam as peças novas.

**Teste previsto:** `npx jest src/ai src/training-plans src/coach src/insights`, `npm run build` e
`npx eslint src/ai src/training-plans`. As três suítes de DI conhecidas (`auth.service.spec`,
`auth.controller.spec`, `users.service.spec`) ficam fora, como no baseline.

## Contrato

O contrato não muda. Nenhuma rota, evento ou tabela nasce, muda ou sai: `GET
/activities/:id/insight`, `POST /activities/:id/insight`, `GET /insights`, `GET /training-plans`,
`GET /training-plans/current`, `POST /training-plans/regenerate`, `POST /coach/chat`, `POST
/coach/chat/stream` e `GET /coach/chat` devolvem o mesmo corpo, os mesmos status e os mesmos campos
de hoje, mesmo quando o texto vem do alternativo. O pareamento não tem rota própria. A única chave
nova de Redis é a de estado operacional registrada em "Mudança de dados" (`ai:provider:primary:down`);
`ai:provider:notice:<userId>` nasce na `03` e `ai:plan-review:attempt:<planId>` na `04`.

## Verificação do contrato

Nenhum item: a tarefa não cria, muda nem remove rota, evento ou tabela, então não há contrato a
provar aqui. A paridade das respostas existentes é provada por `CA1` (o texto do alternativo atende
o mesmo caminho e o mesmo parser) e por `CA5` (a falha dupla cai no erro que as rotas já tratam). A
chave `ai:provider:primary:down`, que é estado operacional e não contrato de API, é provada por
`CA2`.

## Decisões

- O `AiFailoverService` é a implementação registrada no token `AiProvider`, sobre `OpenAiProvider` e
  `DeepSeekProvider`: o `AiService` continua falando só com a porta e nenhum service de domínio
  muda (spec §2.1; ADR-0003).
- A ordem e a classificação vivem no failover, não nos adaptadores: o adaptador só traduz a falha em
  `AiProviderUnavailableError` e a política decide o que troca (`http` `401/402/403/429/5xx`,
  `transport`, `timeout`, `empty`); um `4xx` fora da lista continua sem troca (spec §2.4).
- Resposta vazia é indisponibilidade só em `complete` e é classificada no failover: o adaptador
  continua devolvendo vazio como hoje, e a regra fica num lugar só (spec §2.4; LLD §12).
- `AiProviderFailureReason` ganha `empty` para a falha vazia chegar tipada ao failover e ao log, em
  vez de se disfarçar de `transport`.
- O marcador `ai:provider:primary:down` guarda o instante de expiração em milissegundos e o TTL em
  segundos; o failover compara o instante com `Date.now()` para a sonda, então o teste dispensa
  relógio falso e a regra não depende de o Redis expirar a chave (spec §2.4, §4).
- `AiProviderStateService` engole erro de Redis e devolve "sem marca": cache fora não pode derrubar a
  IA, e o principal volta a ser tentado a cada chamada (CA6).
- O alternativo só entra com a chave configurada; com apenas o principal configurado, a marca não é
  gravada nem bloqueia a chamada — senão uma chave removida deixaria o fluxo sem IA durante o
  cooldown (CA6).
- Falha dupla devolve o erro do alternativo, a última tentativa, e limpa a marca: o tipo é o mesmo que
  o fluxo já trata, e a chamada seguinte volta ao principal (CA5).
- A marca também é gravada quando a falha do principal acontece depois do primeiro token do
  streaming: a spec manda marcar depois de qualquer falha, e o texto parcial continua com o atleta
  (CA4; spec §2.4).
- `AiProviderResult.provider` e `CoachReplyResult.provider` nascem aqui: a spec §7 atribui o metadado
  à tarefa `02`, o log de uso passa a registrar quem atendeu e a `03` consome o do chat sem tocar na
  porta.
- `canEscalate(provider)` na porta: escalonamento cheap → premium e fallback premium do streaming só
  fazem sentido no principal; com o alternativo atendendo não existe tier, e responder `false` evita
  uma chamada repetida ao mesmo modelo — inclusive na falha dupla do streaming, que precisa terminar
  no erro em pt-BR (CA3, CA4, CA5).
- `AiService.isConfigured()`, delegando à porta, substitui o gate de `OPENAI_API_KEY` nos quatro
  métodos e no `enrichPlanWithAi`: a regra "qualquer fornecedor configurado" fica num lugar só e a
  revisão do plano deixa de exigir a chave do OpenAI (CA6).
- `DEEPSEEK_MODEL` e `AI_FAILOVER_COOLDOWN_SECONDS` são lidos de `process.env` a cada uso, com trim,
  padrão e validação de inteiro: é como `model-router` e o resto do módulo leem configuração hoje, e
  o valor pode mudar entre casos de teste sem reiniciar o processo (spec §5.2).
- O timeout e a tradução de falha saem do `OpenAiProvider` para `provider-runtime.ts`, usado pelos
  dois adaptadores: o DeepSeek precisa do mesmo abort e do mesmo erro tipado, e duplicar o bloco
  criaria duas regras de timeout (CA7).
- O log de decisão continua sendo o do roteador do principal e o de uso passa a trazer `provider=`:
  o tier é uma escolha do OpenAI, o alternativo ignora o tier, e quem lê o log vê quem atendeu pela
  linha de uso (LLD §20).
- `AiModule` importa `RedisModule` e exporta `AiProviderStateService`: as tarefas `03` e `04`
  consomem o estado sem repetir a ligação com o Redis (spec §3.1).
- O `CA1` foi corrigido para "resposta vazia nas tarefas sem streaming", como a spec §2.4 já
  decidia: o chat só existe em streaming, a troca por resposta vazia não se aplica a ele, e um
  stream que termina sem token continua terminando na mensagem em pt-BR.

## Arquivos e interfaces

- `src/ai/provider-runtime.ts` (novo): `runProviderCall(providerName, timeoutMs, run)` — aplica o
  `AbortController` do timeout (`<= 0` desliga) e traduz transporte, timeout e status HTTP em
  `AiProviderUnavailableError`.
- `src/ai/ai-provider.ts` (alterado): `AiProviderResult` ganha `provider`; `AiProviderFailureReason`
  ganha `empty`; a porta ganha `isConfigured()` e `canEscalate(provider)`.
- `src/ai/openai-provider.ts` (alterado): `name = 'openai'`, `provider` no resultado,
  `isConfigured()` pela chave e o timeout/erro passando por `runProviderCall`; `createEmbedding`
  continua fora da porta.
- `src/ai/deepseek-provider.ts` (novo): `DeepSeekProvider extends AiProvider`, com `ChatOpenAI`
  sobre `configuration.baseURL = 'https://api.deepseek.com'`, modelo único
  (`DEEPSEEK_MODEL`, padrão `deepseek-chat`), temperatura e teto do pedido, `streamUsage: false`,
  timeout pelo `runProviderCall` e `canEscalate() => false`.
- `src/ai/ai-provider-state.service.ts` (novo): `primaryDown(): Promise<{ until: number } | null>`,
  `markPrimaryDown(): Promise<number | null>` e `clearPrimaryDown(): Promise<void>` sobre o
  `RedisService`, com a chave `ai:provider:primary:down` e falha de Redis tratada como ausência.
- `src/ai/ai-failover.service.ts` (novo): `AiFailoverService extends AiProvider`, com a ordem
  principal → alternativo, a classificação de falha, o cooldown, a sonda, a volta e o `provider` do
  resultado; `decide` delega ao roteador do principal e `canEscalate(provider)` ao adaptador que
  atendeu ou falhou.
- `src/ai/ai.module.ts` (alterado): importa `RedisModule`, provê `DeepSeekProvider`,
  `AiProviderStateService` e `AiFailoverService`, registra `AiProvider` como
  `useExisting: AiFailoverService` e exporta `AiService` e `AiProviderStateService`.
- `src/ai/ai.service.ts` (alterado): gate por `isConfigured()`, escalonamento e fallback premium
  condicionados ao fornecedor que atendeu ou falhou, `provider` no `CoachReplyResult` e o fornecedor
  no log de uso.
- `src/training-plans/training-plans.service.ts` (alterado): `enrichPlanWithAi` troca o gate de
  `OPENAI_API_KEY` por `aiService.isConfigured()`.
- `.env.example` (alterado): `DEEPSEEK_MODEL=deepseek-chat` e `AI_FAILOVER_COOLDOWN_SECONDS=60`.

## Testes existentes que mudam

- `src/ai/ai.service.spec.ts`: os dublês da porta ganham `isConfigured`, `canEscalate(provider)` e
  `provider` no resultado, e entra o bloco do failover com `AiService`, `AiFailoverService` e
  `AiProviderStateService` reais sobre `OpenAiProvider`, `DeepSeekProvider` e `RedisService` falsos;
  os casos existentes mantêm a expectativa de conteúdo.
- `src/training-plans/training-plans.service.spec.ts`: o dublê de `AiService` ganha `isConfigured`,
  e o caso "não grava anotação quando a IA não devolve revisão" deixa de mexer em `OPENAI_API_KEY`
  para ligar e desligar a IA — o gate passa a ser o dublê.
- `src/coach/coach.service.spec.ts`: entra o caso da resposta em pt-BR quando a IA devolve `null`;
  nenhum caso existente muda.

## Mudança de dados

Nenhuma em banco. Entra só estado operacional em Redis: `ai:provider:primary:down`, com o instante
de expiração em milissegundos como valor e `AI_FAILOVER_COOLDOWN_SECONDS` (padrão 60 s) como TTL. Não
há seed, backfill nem migration.

## Documentos atualizados

- `docs/lld.md`, §3.3 "Variáveis de ambiente do backend": `DEEPSEEK_API_KEY` deixa de ser "sem uso no
  código" e entram `DEEPSEEK_MODEL` (padrão `deepseek-chat`) e `AI_FAILOVER_COOLDOWN_SECONDS`
  (padrão 60).
- `docs/lld.md`, §12 "AI service": a lista de arquivos ganha `deepseek-provider.ts`,
  `ai-failover.service.ts`, `ai-provider-state.service.ts` e `provider-runtime.ts`; a porta passa a
  ter `provider` no resultado, `isConfigured()`, `canEscalate(provider)` e a razão `empty`; o gate
  "sem `OPENAI_API_KEY`" vira "sem nenhum fornecedor configurado"; entram a ordem principal →
  alternativo, a classificação de falha, a resposta vazia como indisponibilidade fora do adaptador e
  o registro no `AiModule`.
- `docs/lld.md`, §12.1 "Roteamento de modelos": entram a troca e a volta automáticas (critérios de
  falha, cooldown, sonda, falha dupla), o escalonamento só no principal, o modelo único do
  alternativo e a degradação com Redis fora.
- `docs/lld.md`, §12.2 "Onde o custo é consumido": cada chamada pode ser atendida pelo alternativo e
  o embedding continua só no principal.
- `docs/lld.md`, §16 "Redis e processamento assíncrono": entra a chave `ai:provider:primary:down` com
  conteúdo e TTL, e a nota de que `AiProviderStateService` tolera Redis fora.
- `docs/lld.md`, §20 "Lacunas e cuidados conhecidos": a observabilidade passa a registrar o
  fornecedor no log de uso, e o embedding sem alternativa entra como limitação conhecida.
- `docs/hld.md`, §4 "Arquitetura de alto nível": o diagrama ganha o DeepSeek ao lado do OpenAI e a
  camada de integrações passa a citar o fornecedor alternativo.
- `docs/hld.md`, §5.2 "Backend": a linha do módulo `ai` passa a descrever a porta com o alternativo,
  e as dependências externas incluem DeepSeek e Redis.
- `docs/hld.md`, §6.7 "Roteamento de modelos de IA": entram a ordem dos fornecedores, o critério de
  troca, o cooldown com sonda e volta, o modelo único do alternativo, a degradação com Redis fora e
  o fornecedor no log de uso.
- `docs/hld.md`, §10 "Requisitos não funcionais": desempenho (timeout pago na primeira falha),
  confiabilidade (alternativo automático com volta) e observabilidade (fornecedor no log).
- `docs/hld.md`, §11 "Limitações e dívidas conhecidas": entra a linha do fornecedor alternativo — só
  texto, sem embedding e com qualidade de texto em melhor-esforço.
- `docs/hld.md`, cabeçalho: "Última atualização".
