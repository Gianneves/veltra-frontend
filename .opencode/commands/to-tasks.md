---
description: "Decompõe uma funcionalidade em tarefas tracer bullet, com bloqueios e decisões compartilhadas, e cria um task.md por tarefa"
---

# To Tasks

Quebre uma funcionalidade em **tarefas**: fatias verticais tracer bullet, cada uma declarando as
tarefas que a **bloqueiam**. Cada tarefa vira um arquivo em
`docs/features/<NN>-<titulo>/tasks/<NN>-<titulo>/task.md`.

O tracker é o `docs/roadmap.md`; não há issue tracker. A tarefa nasce com `Status: a fazer` e só
muda de status na implementação. Não use rótulo de triagem: o status do roadmap e o status da
tarefa são os únicos registros.

## Processo

### 1. Reunir o contexto

Leia o `spec.md` da funcionalidade, o `prd.md`, o `docs/roadmap.md`, as seções do `docs/lld.md` que
a funcionalidade toca, o `GLOSSARY.md`, as ADRs da área e as rules de `.opencode/rules/` dos
projetos afetados. Se o usuário passar uma referência como argumento, leia o documento inteiro.

Se não houver `spec.md`, pare: o `to-tasks` executa as decisões da spec, não as toma.

### 2. Explorar o código (opcional)

Se você ainda não explorou o código, explore para entender o estado atual. Títulos e descrições usam
o vocabulário do `GLOSSARY.md` e respeitam as ADRs da área.

Procure oportunidades de refatorar antes (prefactoring) para facilitar a implementação. "Torne a
mudança fácil e depois faça a mudança fácil."

### 3. Rascunhar as fatias verticais

Quebre o trabalho em tarefas **tracer bullet**:

- cada fatia corta um caminho estreito, mas COMPLETO, por todas as camadas (schema, API, interface,
  testes): vertical, e NÃO uma fatia horizontal de uma camada só;
- uma fatia concluída pode ser demonstrada ou verificada sozinha;
- cada fatia tem o tamanho de uma única janela de contexto nova;
- toda refatoração prévia vem primeiro.

Dê a cada tarefa os seus **bloqueios**: as outras tarefas que precisam estar concluídas antes de ela
começar. Uma tarefa sem bloqueios pode começar imediatamente.

**Procure decisões compartilhadas.** Os bloqueios dizem o que pode começar; não dizem o que pode
rodar ao mesmo tempo. Duas tarefas sem bloqueio entre elas podem ter de tomar a mesma **decisão**: o
mesmo campo, a mesma regra, o mesmo formato de contrato. Cada uma a toma do seu jeito, as duas
passam nos próprios testes, e a integração quebra. Entre as tarefas sem bloqueio entre si, procure
as decisões que mais de uma delas teria de tomar e dê a cada uma um destino:

- mover a decisão para uma **tarefa anterior** que bloqueia as que a usam (a tarefa anterior decide
  uma vez, e as outras consomem a decisão), ou
- **encadear** as tarefas, quando tirar a decisão não vale uma tarefa própria.

O critério de paralelismo é a decisão, e não a área. Duas tarefas que mexem no mesmo arquivo ou
módulo, sem decisão em comum, ainda podem rodar em paralelo: o conflito de texto se resolve na
integração. Não dê a uma tarefa caminhos de arquivo exclusivos ou proibidos.

**Refatorações amplas são a exceção ao fatiamento vertical.** Uma **refatoração ampla** é uma
mudança mecânica (renomear uma coluna, mudar o tipo de um símbolo compartilhado) cujo **raio de
impacto** se espalha pelo código inteiro, de modo que uma única edição quebra milhares de pontos de
chamada de uma vez e nenhuma fatia vertical consegue entrar com tudo verde. Não force isso numa
tracer bullet; organize em **expandir–contrair**. Primeiro expanda: acrescente a forma nova ao lado
da antiga, para nada quebrar. Depois migre os pontos de chamada em lotes do tamanho do raio de
impacto (por pacote, por pasta), cada lote uma tarefa bloqueada pela expansão, mantendo a CI verde
de lote em lote, porque a forma antiga ainda existe. Por fim contraia: apague a forma antiga quando
não restar quem a chame, numa tarefa bloqueada por todos os lotes de migração. Quando nem os lotes
conseguem ficar verdes sozinhos, mantenha a sequência, mas deixe-os compartilhar uma branch de
integração, todos bloqueando uma tarefa final de integrar e verificar; o verde só é prometido ali.

### 4. Questionar o usuário

Apresente a quebra proposta como uma lista numerada. Para cada tarefa, mostre:

- **Título**: um nome curto e descritivo;
- **Bloqueada por**: que outras tarefas (se houver) precisam estar concluídas antes;
- **O que entrega**: o comportamento de ponta a ponta que esta tarefa faz funcionar.

Depois, mostre o que os bloqueios permitem:

- as **ondas**, calculadas a partir dos bloqueios: as tarefas que podem começar juntas, onda a onda;
- a **tabela de decisões compartilhadas**: uma linha por decisão, com as tarefas que a tomariam e o
  destino dela (uma tarefa anterior que bloqueia as outras, ou o encadeamento das tarefas).

Pergunte ao usuário:

- A granularidade parece certa? (grossa demais / fina demais)
- Os bloqueios estão corretos: cada tarefa depende só das tarefas que de fato a impedem de começar?
- O destino de cada decisão compartilhada está certo?
- Alguma tarefa deveria ser juntada a outra ou dividida mais?

Repita até o usuário aprovar a quebra.

Uma mudança numa tarefa repercute nas outras. Quando uma tarefa é juntada, dividida, removida ou
reordenada, confira de novo antes de mostrar a quebra: os bloqueios que apontam para ela ou saem
dela, as decisões compartilhadas que ela possui ou consome, e as ondas. Uma junção herda os
bloqueios e as decisões das duas tarefas e descarta o bloqueio entre elas; uma divisão atribui cada
bloqueio e cada decisão a uma das metades, e, quando as duas metades precisam da mesma decisão, uma
a possui e bloqueia a outra.

### 5. Criar os arquivos das tarefas

Depois da aprovação, crie `docs/features/<NN>-<titulo>/tasks/<NN>-<titulo>/task.md`, um arquivo
por tarefa, numerados a partir de `01` na ordem de dependência (as que bloqueiam primeiro). Use o
molde abaixo.

- A pasta e o arquivo são em inglês, em kebab-case sem acento e com o mesmo título da tarefa
  (`tasks/01-rest-never-completed/task.md`); o conteúdo permanece em pt-BR.
- O número da tarefa não muda depois de atribuído, e o número de uma tarefa removida não é
  reaproveitado.
- Uma tarefa cujo plano já está em commit não muda: uma decisão errada é corrigida na spec, no LLD
  ou numa tarefa nova.
- Não altere o status da funcionalidade no `docs/roadmap.md`: isso é da spec e da implementação.
- Ao final, registre na seção "Decomposição em tarefas" da `spec.md` a lista das tarefas criadas,
  com número, título, resultado e dependências.

## Molde do `task.md`

```markdown
# <NN>: <Título da tarefa>

**Status:** a fazer

**Objetivo:** o comportamento de ponta a ponta que esta tarefa faz funcionar.

**Escopo:** o que entra e o que fica de fora nesta tarefa.

**Bloqueada por:** <NN — título> · ou "Nenhuma (pode começar imediatamente)".

**Decisões consumidas de outras tarefas:** <NN — título>: <decisão>. Omita o campo quando não
houver.

**LLD de origem:** §X.Y — Título; §X.Y — Título.

**LLD a atualizar:** §X.Y — Título, ou "Nenhum".

## Critérios de aceite

- [ ] **CA1** · <critério observável e verificável>
- [ ] **CA2** · <critério observável e verificável>
```

Num critério, `CA<n>` é um ID estável: não muda quando a tarefa é editada, e o ID de um critério
removido não é reaproveitado.

## Regras de qualidade

- O objetivo descreve o comportamento, não a implementação camada por camada.
- "LLD de origem" aponta a subseção que dona o fato (`§8.2 — Geração do plano`); "LLD a atualizar"
  só lista seção quando a tarefa muda o que o LLD registra.
- Evite caminhos de arquivo e trechos de código específicos: eles envelhecem rápido. Exceção: se um
  protótipo produziu um trecho que registra uma decisão com mais precisão do que a prosa (máquina
  de estados, reducer, schema, forma de um tipo), coloque-o no texto e diga, em poucas palavras, que
  ele veio de um protótipo. Corte até as partes que carregam decisões, e não uma demonstração que
  funciona: só o essencial.
- Não invente rota, coluna, biblioteca ou valor que a spec, o LLD e as ADRs não sustentam: o que
  falta vira questão em aberto na spec.
- Pasta e arquivos usam dois dígitos e kebab-case sem acento (`03-pareamento-manual`).
