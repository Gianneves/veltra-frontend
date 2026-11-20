# Plano da F01-T06: Anotação de IA sem mudança de plano

Tarefa: [task.md](task.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dado um plano de duas semanas e uma revisão da IA com `overview`, foco, justificativa e dicas por dia, quando o construtor puro recebe a revisão e o plano, então devolve uma atualização por plano com `focus` e `coachNotes`, e uma atualização de sessão para cada dia com dica, com o texto `Dica do Coach: <dica>` anexado às notas da sessão; a revisão de uma semana sem plano correspondente é ignorada e a dica sem texto não gera atualização de sessão.

**Teste previsto:** `plan-annotations.spec.ts` (unidade): "devolve apenas foco, notas do plano e notas das sessões com dica".

### CA2

**Marca:** teste de unidade

**Cenário:** Dado um plano com sessões e uma revisão que traz, além de `focus` e `rationale`, campos de distância, pace, dia, tipo e conclusão, quando o construtor devolve as atualizações, então cada atualização de plano tem exatamente `focus` e `coachNotes`, cada atualização de sessão tem exatamente `notes`, nenhum dos cinco campos de mudança aparece nas atualizações e as sessões recebidas continuam com os valores anteriores.

**Teste previsto:** `plan-annotations.spec.ts`: "não produz distância, pace, dia, tipo ou conclusão, mesmo quando a revisão traz esses campos".

### CA3

**Marca:** teste de unidade

**Cenário:** Dado um foco de 200 caracteres, notas de plano que passam de 1.200 e uma sessão cujas notas com a dica passam de 500, quando o construtor devolve as atualizações, então `focus` sai com 120 caracteres, `coachNotes` com 1.200 e a nota da sessão com 500, preservando o começo de cada texto.

**Teste previsto:** `plan-annotations.spec.ts`: "trunca foco em 120, notas do plano em 1.200 e notas da sessão em 500 caracteres".

### CA4

**Marca:** teste de unidade

**Cenário:** Dado um atleta com plano recém-gerado e uma revisão da IA, quando o service aplica o resultado, então `planRepository.update` recebe somente `focus`/`coachNotes` e `sessionRepository.update` somente `notes`, e distância, pace, dia, tipo e conclusão das sessões continuam iguais; e quando não há chave da IA ou a revisão é nula, então o enriquecimento não grava nada e o plano sai como antes.

**Teste previsto:** `training-plans.service.spec.ts` (service): "aplica foco, notas do plano e dicas sem mudar distância, pace, dia, tipo ou conclusão" e "não grava anotação quando a IA não devolve revisão".

### CA5

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa lê `plan-annotations.spec.ts`, então encontra os casos de CA1 e CA2 provando a ADR-0002 (as atualizações só têm foco, notas do plano e notas de sessão) e confere na saída de `npx jest` que o spec novo e `training-plans.service.spec.ts` passam juntos.

### CA6

**Marca:** revisão humana

**Cenário:** Dado o resumo de verificação da implementação, quando quem revisa confere, então `npx jest` nos specs tocados, `npx eslint` nos arquivos alterados e `npm run build` passaram, sem suíte nova falhando e sem tocar nas suítes de DI pré-existentes.

## Contrato

O contrato não muda.

Nenhuma rota, evento ou tabela é criada, alterada ou removida. O enriquecimento continua gravando
`training_plans.focus`, `training_plans.coachNotes` e `training_sessions.notes`, com os mesmos
conteúdos e limites de hoje; a tarefa só extrai a montagem desses valores para um construtor puro.
A tabela de rotas do HLD §8, o modelo de dados do LLD §4 e as seções de endpoint do LLD não
recebem delta; o fluxo interno fica registrado no LLD §8.2.

## Verificação do contrato

Nenhum item: sem rota, evento ou tabela, não há resposta, status ou restrição de banco a provar. A
conferência do fim da tarefa olha apenas que as três colunas escritas continuam as mesmas, e CA4
prova o conjunto de campos que chega ao repositório.

## Decisões

- Módulo novo `src/training-plans/plan-annotations.ts`, com o nome que a spec §3.1 já reserva e a
  função `buildPlanAnnotations`; o service deixa de montar as strings. Motivo: CA1 e o objetivo de
  um único construtor puro.
- O construtor casa a revisão pelo `weekStart` do plano (prefixo de 10 caracteres), em vez de
  receber `summaries`. Motivo: o plano já carrega `weekStart` e a ordem de `plans` é a mesma de
  `summaries`, então o casamento é idêntico ao atual, inclusive quando a revisão repete a mesma
  semana.
- A revisão entra como `PlanReview` (import só de tipo de `src/ai/ai.service`) e o construtor
  devolve `PlanAnnotationPatch { focus?, coachNotes? }` e `SessionAnnotationPatch { notes? }`. O
  tipo impede em compilação e o spec confere em runtime. Motivo: CA1, CA2 e ADR-0002.
- Os limites viram constantes exportadas (`PLAN_FOCUS_MAX_LENGTH = 120`,
  `PLAN_COACH_NOTES_MAX_LENGTH = 1200`, `SESSION_NOTES_MAX_LENGTH = 500`) e o truncamento acontece
  no construtor, tirando os `slice` do service. Motivo: CA3 e um só lugar para os três números.
- A composição das notas do plano não muda: a primeira semana junta as notas da geração (padrão e
  meta), o `overview` e o `rationale`; as demais semanas levam só o `rationale`. As notas de
  calibração e de idade continuam apenas na escrita que a geração faz antes do enriquecimento.
  Motivo: preservar o texto atual e não mexer em prompt, que está fora do escopo.
- A nota da sessão continua montada como `${notes ?? ''} Dica do Coach: ${texto}`, inclusive o
  espaço inicial quando a sessão não tem notas. Motivo: CA4 pede texto igual ao de hoje; corrigir
  o espaço é mudança de texto, fora do escopo.
- O service aplica as atualizações em sequência: primeiro todos os planos, depois todas as
  sessões. Motivo: nenhuma escrita depende da outra e o conjunto gravado é o mesmo de hoje.
- O construtor percorre as sessões ordenadas por `dayOrder` numa cópia, para escolher a dica por
  posição, e não reordena o plano recebido (hoje o `sort` ordena o próprio array). Motivo: manter a
  dica por posição sem efeito colateral no objeto que o service devolve.
- `enrichPlanWithAi` continua disparado em background e não é aguardado pela geração. O teste de
  CA4 espera o encadeamento com um `setImmediate` depois de `regenerateFromGoal`, porque todos os
  dublês resolvem em microtarefa. `createMocks` passa a devolver `aiService` e
  `sessionRepository`. Motivo: a tarefa não muda o fluxo de geração, só a montagem das anotações.
- Sem roteiro manual de tela: o texto gravado é o mesmo de hoje, provado pelo spec, e a tarefa não
  altera componente, rota ou prompt. O mapa do PRD critério 10 na spec §8 cita "roteiro manual do
  plano", mas a lista de itens 1–5 não tem passo de anotação; CA4 fica no service. Motivo: o que a
  tarefa muda é interno e não há ponto de teste de tela no frontend.

## Arquivos e interfaces

- `veltra-backend/src/training-plans/plan-annotations.ts` (novo): constantes
  `PLAN_FOCUS_MAX_LENGTH`, `PLAN_COACH_NOTES_MAX_LENGTH` e `SESSION_NOTES_MAX_LENGTH`; tipos
  `PlanAnnotationPatch`, `SessionAnnotationPatch`, `PlanAnnotation`, `SessionAnnotation` e
  `PlanAnnotations`; `buildPlanAnnotations({ review, plans, weekOneNotes })` devolve as listas de
  atualizações de plano e de sessão.
- `veltra-backend/src/training-plans/training-plans.service.ts`: `enrichPlanWithAi` mantém o
  contexto, o early return e o background, e passa a chamar `buildPlanAnnotations` e aplicar as
  duas listas com `planRepository.update` e `sessionRepository.update`.
- `veltra-backend/src/training-plans/plan-annotations.spec.ts` (novo): casos de CA1, CA2 e CA3.
- `veltra-backend/src/training-plans/training-plans.service.spec.ts`: `createMocks` devolve
  `aiService` e `sessionRepository`; casos de CA4 com e sem revisão.

## Testes existentes que mudam

Nenhum. Os testes de geração continuam rodando sem `OPENAI_API_KEY` (o `beforeEach` do describe
apaga a chave); o caso novo do enriquecimento define a chave dentro do próprio teste e o
`beforeEach` a remove no teste seguinte.

## Mudança de dados

Nenhuma. Sem seed, backfill ou migration; nenhuma coluna muda e nenhum dado é corrigido.

## Documentos atualizados

- `docs/lld.md`, §8.2 "Geração do plano": o passo 11 aponta para o enriquecimento descrito logo
  abaixo, que usa o construtor puro e grava só foco, notas do plano e notas de sessão, com os
  limites 120/1.200/500, o casamento por `weekStart` e as condições em que nada é gravado.
- `docs/hld.md`: sem mudança — o item 7 do §9 já declara a fronteira da ADR-0002.
