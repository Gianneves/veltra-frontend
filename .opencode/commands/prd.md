---
description: Cria ou revisa o PRD de uma funcionalidade em docs/features, com o status no roadmap
---

Sua tarefa é criar ou revisar o PRD (Product Requirements Document) de uma funcionalidade do Veltra.

## Fonte

A funcionalidade é indicada em $ARGUMENTS, pelo número (`F01`), pelo título ou pela pasta
(`docs/features/01-refactor-backend-logic`). Se $ARGUMENTS estiver vazio, leia `docs/roadmap.md` e
pergunte qual funcionalidade será detalhada.

Antes de escrever, leia:

- `docs/product-brief.md`, que é o dono do escopo, do público, das métricas e dos requisitos não
  funcionais do produto;
- `GLOSSARY.md`, na raiz, e use os termos dele;
- `docs/roadmap.md`, que é o dono da lista de funcionalidades, da ordem, das dependências e do
  status;
- o `AGENTS.md` da raiz, seção "Planejamento", para os caminhos, a numeração e os status.

Se a funcionalidade ainda não estiver no roadmap, acrescente-a lá antes de escrever o PRD, com o
próximo número global e o status "planejada". O número, uma vez atribuído, não muda.

## Contexto existente

Se `docs/features/<num-funcionalidade>-<titulo>/prd.md` já existir, leia-o antes de editar:

- preserve as decisões já aprovadas pelo usuário;
- revise apenas as seções afetadas pelo pedido, sem reescrever o documento do zero;
- não mude o número nem o título da funcionalidade sem o usuário pedir.

## Antes de escrever

Se o pedido não responde quem usa, qual dor resolve e o que fica fora, não escreva o PRD: pare e
peça ao usuário para rodar `/grill-with-docs` antes. O grill é invocado pelo usuário, não pelo
agente, e é ele que afina o escopo e registra as ADRs e os termos do glossário.

## Estrutura do PRD

Escreva em português do Brasil, em `docs/features/<num-funcionalidade>-<titulo>/prd.md`,
com esta estrutura:

1. **Cabeçalho** — título, `Status: rascunho`, o número da funcionalidade e links para o roadmap, o
   product brief e o glossário.
2. **Problema e objetivo** — a dor de quem usa e o que a funcionalidade resolve, sem detalhe
   técnico.
3. **Rastreabilidade** — qual item do escopo do `product-brief.md` esta funcionalidade entrega.
4. **Fluxos** — numerados, o caminho de ponta a ponta do ponto de vista de quem usa.
5. **Histórias de usuário** — no formato "Como <pessoa>, quero <ação> para <resultado>".
6. **Critérios de aceite** — um por comportamento observável, verificável e sem detalhe de
   implementação, no presente ("A pessoa entra...").
7. **Fora de escopo** — o que esta funcionalidade não entrega, apontando o roadmap ou o product
   brief quando o item pertencer a outra funcionalidade.
8. **Dependências** — as funcionalidades de que esta depende, iguais às do roadmap.
9. **Questões em aberto** — checklist `- [ ]`, uma por decisão ainda não tomada, cada uma indicando
   o que ela trava.

## Regras de qualidade

- O PRD descreve só o que a pessoa consegue fazer. Nada de rota, tabela, biblioteca, tipo de dado
  ou desenho interno; isso pertence à spec e ao LLD.
- Nunca repita métricas, requisitos não funcionais ou regras do produto inteiro: aponte para a
  seção do `product-brief.md`.
- Cada requisito e critério de aceite deve rastrear a um item do escopo ou a uma história do
  product brief. O que o brief não responde vira questão em aberto, não invenção.
- Use os termos do `GLOSSARY.md`. Se o pedido usar um termo que conflita com o glossário, aponte o
  conflito e proponha o termo correto antes de escrever.
- Não coloque rótulos de triagem (prioridade, P0, tamanho, estimativa). O tracker é só o status do
  roadmap e o status da tarefa.
- A pasta e os arquivos usam número de dois dígitos e título em kebab-case sem acento
  (`01-entrar-e-sair`).

## Entrega

Ao terminar:

- atualize o status da funcionalidade no `docs/roadmap.md` para "PRD pronto", sem regredir um
  status que já esteja à frente;
- mude o `Status` do PRD de "rascunho" para "pronto" quando o usuário aprovar o documento;
- não faça commit sem o usuário pedir;
- resuma o que o PRD tem de novo ou revisado e o que ficou em aberto.
