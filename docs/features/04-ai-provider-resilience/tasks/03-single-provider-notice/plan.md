# Plano da F04-T03: Aviso único da troca de fornecedor

Tarefa: [task.md](task.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dado um episódio de falha em curso — o marcador `ai:provider:primary:down` com
expiração E — e nenhum aviso mostrado ao atleta nesse episódio, quando a primeira resposta de chat
vem do alternativo, então o texto salvo com a mensagem e o `message.content` devolvido no `done`
contêm, como último parágrafo, a linha de aviso em pt-BR da spec §2.6, e a marca
`ai:provider:notice:<userId>` passa a guardar E com TTL de 7 dias. Quando o Redis não responde,
quando não há marcador de episódio, ou quando o alternativo responde vazio e o texto de erro em
pt-BR assume, então a resposta sai sem aviso, sem erro e sem gravar a marca.

**Teste previsto:** unidade, `src/coach/coach.service.spec.ts`, "acrescenta o aviso único à primeira
resposta do alternativo e grava no texto", "omite o aviso quando o Redis está fora" e "não avisa
quando o alternativo responde sem texto". O `done` é provado pelo próprio retorno do
`streamMessage`, que é o objeto serializado pelo controller no frame, e pela mensagem salva com o
mesmo texto.

### CA2

**Marca:** teste de unidade

**Cenário:** Dado que o aviso já foi mostrado no episódio E, quando o atleta envia outra mensagem e a
resposta do mesmo episódio vem do alternativo, então o texto salvo e o devolvido não contêm o aviso,
e a marca continua guardando E.

**Teste previsto:** unidade, `src/coach/coach.service.spec.ts`, "não repete o aviso nas respostas
seguintes do mesmo episódio".

### CA3

**Marca:** teste de unidade

**Cenário:** Dado o aviso mostrado no episódio E, quando uma resposta do chat é atendida pelo
principal, então a marca é apagada e o texto não ganha aviso; e, quando o principal falha de novo e
o alternativo atende um episódio E2 sem que uma resposta do principal tenha apagado a marca, então
a primeira resposta do E2 volta a avisar uma vez, porque a marca guardava E e o identificador do
episódio mudou.

**Teste previsto:** unidade, `src/coach/coach.service.spec.ts`, "apaga a marca quando o principal
atende" e "avisa de novo em um novo episódio mesmo com a marca anterior".

### CA4

**Marca:** teste de unidade

**Cenário:** Dado que o principal e o alternativo falham na mesma mensagem e o `AiService` devolve
`null`, quando o chat responde, então o texto é exatamente a mensagem de erro em pt-BR de hoje, sem
aviso, e a marca do aviso não é lida, gravada nem apagada.

**Teste previsto:** unidade, `src/coach/coach.service.spec.ts`, "responde em pt-BR quando a IA não
devolve resposta" (caso existente, ampliado com a asserção de que a chave do aviso não foi escrita
nem apagada).

### CA5

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa compara `coach.controller.ts`, o DTO do chat,
o tipo `CoachReply`, o frame `done` e os arquivos do frontend com a `main`, então nenhuma rota,
campo, evento ou componente mudou; o aviso chega dentro de `message.content` e o
`coach.service.spec.ts` cobre CA1–CA4.

## Contrato

O contrato não muda. Nenhuma rota, evento ou tabela nasce, muda ou sai: `POST /coach/chat`,
`POST /coach/chat/stream` e `GET /coach/chat` mantêm os mesmos campos, status e frames de hoje, e o
aviso viaja dentro de `message.content`, que já existe. A única chave nova de Redis é a de estado
operacional `ai:provider:notice:<userId>`, registrada em "Mudança de dados"; ela não é contrato de
API.

## Verificação do contrato

Nenhum item: a tarefa não cria, muda nem remove rota, evento ou tabela, então não há contrato a
provar aqui. O `done` continua com `{ conversationId, message, proposal, proposals, rejections }` e o
aviso dentro de `message.content`, provado por `CA1` (texto salvo e devolvido com o aviso) e `CA5`
(revisão do controller, do tipo e do frontend); a resposta de erro sem aviso é provada por `CA4`.

## Decisões

- O aviso é aplicado no `CoachService.streamMessage`, depois de o texto final estar composto — inclusive
  a retentativa de proposta e o sufixo de "nada foi alterado" — e antes de a mensagem ser salva: é o
  único ponto que tem o texto persistido e o mesmo objeto devolvido no `done`, e insight e plano
  seguem intocados (spec §2.6, §3.1; CA1).
- O fornecedor que atendeu vem de `CoachReplyResult.provider`, metadado que a tarefa `02` criou; nenhum
  campo novo entra no retorno, no `CoachReply` ou no frame `done` (spec §2.6; CA5).
- O identificador do episódio é o `until` de `AiProviderStateService.primaryDown()`. Sem marcador —
  principal não configurado, cooldown desligado, prazo vencido ou Redis fora — não há aviso: a spec
  amarra o episódio ao marcador de indisponibilidade e, sem falha registrada, não há instabilidade a
  anunciar (spec §2.4, §2.6; CA1, CA4).
- `AiProviderStateService` ganha `consumeNotice(userId, episodeId)` e `clearNotice(userId)`: a chave
  `ai:provider:notice:<userId>` guarda o episódio com TTL de 7 dias, e erro de Redis devolve "não
  mostrar"/ignora, porque a spec manda omitir o aviso em vez de arriscar repetição e manter as chaves
  `ai:*` sob o mesmo dono (spec §2.6, §4; LLD §16; CA1–CA4).
- A marca é gravada dentro de `consumeNotice`, antes de a mensagem ser salva: duas respostas
  simultâneas do mesmo episódio não duplicam o aviso, e a perda do Redis no meio do caminho pode, no
  máximo, repetir um aviso, como a spec §4 já tolera (CA1, CA2).
- `clearNotice` roda quando a resposta é atendida pelo principal, com ou sem texto, porque o
  `AiFailoverService` já limpou `ai:provider:primary:down` e a marca do aviso é só o resto do estado
  do mesmo episódio (spec §2.6; CA3).
- O aviso é anexado como último parágrafo, separado por uma linha em branco, e não no início: durante
  o streaming o atleta já viu o texto, e o `done` substitui o conteúdo mantendo-o no lugar, com o
  aviso aparecendo abaixo. A spec fixa a linha, não a posição (spec §2.6; CA1).
- O texto do aviso é uma constante em `coach.service.ts`, copiada literalmente da spec §2.6, em uma
  única linha em itálico: não há camada de i18n no backend e duplicar o texto em outro arquivo criaria
  duas versões para revisar (CA1).
- O aviso só entra quando há texto de resposta vindo do alternativo e todo o bloco é pulado quando o
  `AiService` devolve `null`: assim o texto de erro em pt-BR nunca ganha aviso, um streaming vazio
  não consome a marca e a falha dupla não lê nem altera o estado (spec §2.6; CA4).
- `sendMessage` herda a regra por delegar a `streamMessage`; o teste de CA1 cobre os dois caminhos de
  chat sem um caso separado (spec §5.1).
- Os testes usam o `AiProviderStateService` real sobre um `RedisService` falso em memória dentro de
  `coach.service.spec.ts`: a spec §8 não permite arquivo de spec novo, e o encadeamento
  marcador → aviso → novo episódio só é provado com o estado real; o fake também registra o TTL
  passado ao `set` (CA1–CA4).

## Arquivos e interfaces

- `src/ai/ai-provider-state.service.ts`: ganha `consumeNotice(userId: string, episodeId: number):
  Promise<boolean>` (lê a chave do aviso; se já guarda o episódio, devolve `false`; senão grava o
  episódio com TTL de 7 dias e devolve `true`; erro de Redis avisa no log e devolve `false`) e
  `clearNotice(userId: string): Promise<void>` (apaga a chave, tolerando erro).
- `src/coach/coach.service.ts`: recebe `AiProviderStateService` no construtor; define a constante com
  a linha de aviso; ao final do texto de `streamMessage`, consulta o episódio e o aviso quando o
  fornecedor é o alternativo e há texto, e apaga a marca quando o fornecedor é o principal, antes de
  criar e salvar `CoachMessage`.
- `src/coach/coach.service.spec.ts`: o `TestingModule` ganha `AiProviderStateService` e um
  `RedisService` falso em memória (`get`/`set`/`del`); o dublê de `AiService` passa a devolver
  `provider` nos casos novos; entram os casos de CA1–CA4.
- Nenhum módulo muda: `AiModule` já exporta `AiProviderStateService` e `CoachModule` já importa
  `AiModule` desde a tarefa `02`.
- Nenhum arquivo do frontend muda.

## Testes existentes que mudam

- `src/coach/coach.service.spec.ts`: os casos existentes mantêm as expectativas (o dublê de `AiService`
  devolve resultado sem `provider`, então nenhum toca o estado); o `TestingModule` ganha o serviço de
  estado e o Redis falso, e o caso "responde em pt-BR quando a IA não devolve resposta" ganha as
  asserções de que a chave do aviso não foi escrita nem apagada.
- Nenhum outro spec muda: `ai.service.spec.ts` cobre a porta e o estado da indisponibilidade, que não
  mudam nesta tarefa, e `test/app.e2e-spec.ts` não exercita o chat.

## Mudança de dados

Nenhuma em banco, seed, backfill ou migration. Entra só estado operacional em Redis:
`ai:provider:notice:<userId>` com o identificador do episódio (o `until` de
`ai:provider:primary:down`) como valor e TTL de 7 dias; a chave é apagada quando o principal atende
uma resposta do chat.

## Documentos atualizados

- `docs/lld.md`, §11.8 "Streaming": a resposta do alternativo na primeira mensagem do episódio leva a
  linha fixa de aviso em pt-BR ao final do texto, gravada com a mensagem e entregue em
  `message.content` no `done`, uma vez por atleta por episódio, apagada quando o principal atende; sem
  campo ou evento novo, e sem aviso na mensagem de erro.
- `docs/lld.md`, §16 "Redis e processamento assíncrono": entra a chave
  `ai:provider:notice:<userId>`, com o identificador do episódio e TTL de 7 dias, e o registro de que
  o `CoachService` a consome e o `AiProviderStateService` a tolera com Redis fora.
- `docs/lld.md`, §17.4 "Chat do coach": o aviso chega dentro de `message.content`; a página continua
  renderizando o markdown e nenhum campo, componente ou evento muda.
- `docs/lld.md`, cabeçalho "Última atualização": passa para 25/11/2026.
