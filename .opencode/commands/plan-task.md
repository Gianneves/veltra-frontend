---
description: "Planeja uma tarefa para aprovação antes de implementá-la: o contrato que ela cria e como cada critério de aceite será aprovado. Use ao começar uma tarefa, antes de escrever código de produção."
---
Planeje uma tarefa, indicada pelo caminho do arquivo ou pelo par funcionalidade e tarefa (como `F01-T02`). O plano existe para uma pessoa aprovar, antes de existir código, o contrato que a tarefa cria e como cada critério será aprovado. Por isso você para no fim sem commitar.

Os moldes estão em `.opencode/plan-task/formats/`: o plano e as regras dos critérios (`plan.md`) e o contrato de rotas, eventos e tabelas (`contract.md`).

## Passos

1. **Contexto.** Ache a tarefa e a pasta da funcionalidade dela. Leia a tarefa, a `spec.md`, o `prd.md`, o `GLOSSARY.md` se a tarefa tocar interface, o `AGENTS.md` da raiz e o do projeto afetado, as rules de `.opencode/rules/` que valem para os arquivos da tarefa, e o código que ela vai mudar. Pare, dizendo o motivo, quando:

- a tarefa não existir;
- uma tarefa de "Bloqueada por" ainda não está concluída;
- a funcionalidade não tem `spec.md`, porque o plano executa decisões da spec e não as toma;
- o plano desta tarefa já está em commit (`git log --oneline -- <plan>` mostra algum commit):
     ele está congelado, e só o usuário o descongela.

 Se o plano existe mas não está em commit, é uma rodada anterior que não foi aprovada: revise e
   corrija esse plano em vez de começar outro.

   Se o plano exigir mudança no `docs/hld.md` ou no `docs/lld.md`, pare antes de planejar e use a
   skill `hld` ou `lld` no modo atualizar. O plano aponta para o resultado, não repete a decisão.

1. **Critérios.** Todo critério da tarefa tem um ID `CA<n>`: dê ID aos que não têm, continuando a
   numeração, e não renumere os que já têm. Não mude o texto de um critério por conta própria.
   Quando ele ficou desatualizado em relação aos documentos (descreve uma regra que um documento já
   mudou), proponha a correção como decisão em aberto e só altere a tarefa depois da aprovação.
   Para cada critério, escreva no plano a marca, o cenário e o teste previsto, como diz
   `.opencode/plan-task/formats/plan.md`.

2. **Contrato.** Escreva no plano cada rota, evento e tabela que a tarefa cria, muda ou remove, no
   formato de `.opencode/plan-task/formats/contract.md`. Os donos do contrato são a tabela de rotas
   do `docs/hld.md` §8, o modelo de dados do `docs/lld.md` §4 e as seções de endpoint do LLD
   (§5–§16); eles são editados à mão, e o plano diz qual delta cada um recebe. Depois, escreva a
   seção "Verificação do contrato", dizendo que critério prova cada item.

3. **Documentos.** Quando a tarefa muda algo que o LLD ou o HLD registram, a atualização entra no
   commit de plano, para os documentos descreverem a regra nova antes de o código existir. Liste no
   plano, em "Documentos atualizados", o que mudou em cada documento.

4. **Parar.** Não faça commit.

   1. Mude o Status da tarefa para "em andamento".
   2. No chat, mostre só o caminho do plano e as decisões em aberto. O resto está no arquivo, e
      repetir no chat cria duas versões para revisar.
   3. Espere a aprovação. A revisão chega no chat, citando um `CA<n>` ou uma seção. Depois de cada
      mudança pedida, corrija o plano e mostre de novo o que ainda está em aberto.

5. **Commit de plano.** Só depois da aprovação, e sem nenhuma decisão em aberto no plano. Confira
   com `git status --short` que entram só o plano, a tarefa, o roadmap quando for o primeiro
   commit de plano da funcionalidade, e os documentos atualizados. Faça o commit em uma branch de
   trabalho, nunca na `main`, com a mensagem
   `docs: planeja <o que a tarefa entrega> (F<NN>-T<NN>)`. Se for o primeiro commit de plano de uma
   tarefa da funcionalidade, mude o status da funcionalidade no `docs/roadmap.md` para "em
   andamento". Não conclua a funcionalidade nem a tarefa: "concluída" só no PR que entrega. As
   decisões e os arquivos já estão no plano, e a mensagem não os repete. Faça os commits sempre na lingua inglesa.

## Regras de qualidade

- Nada de código de produção nesta skill. O plano descreve o que será feito; a implementação vem
  depois.
- O plano é congelado no commit de plano. Depois dele, o `plan.md` não muda: só o usuário o
  descongela, e uma decisão errada é corrigida na spec, no LLD ou numa tarefa nova.
- Não invente detalhe de biblioteca, rota ou valor que o LLD e as ADRs não sustentam. Na dúvida,
  consulte o context7 e registre como decisão em aberto no plano.
