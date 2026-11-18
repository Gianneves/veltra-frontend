# PRD — AI provider resilience

> **Status:** pronto
> **Funcionalidade:** `F04`
> **Roadmap:** [docs/roadmap.md](../../roadmap.md)
> **Product brief:** [docs/product-brief.md](../../product-brief.md)
> **Glossário:** [GLOSSARY.md](../../../GLOSSARY.md)
> **ADRs:** [ADR-0002](../../adr/0002-ai-annotations-are-not-plan-changes.md),
> [ADR-0003](../../adr/0003-ai-provider-behind-a-port.md)

---

## 1. Problema e objetivo

Hoje todo o conteúdo escrito pelo coach — insight de corrida, análise do plano, foco e dicas das
sessões e respostas do chat — depende de um único fornecedor de IA. Quando esse fornecedor fica
fora do ar ou o saldo contratado acaba, o atleta encontra uma corrida sem leitura, um plano sem
análise e um chat que não responde. Do lado dele não há aviso, escolha nem alternativa: o produto
simplesmente para de entregar a parte conversacional que ele usa toda semana.

O objetivo é que o coach continue atendendo quando o fornecedor principal não estiver disponível
ou não tiver saldo. O Veltra passa a ter uma alternativa de fornecedor de IA, acionada
automaticamente na falha, com volta também automática ao principal e sem mudança de tela, texto ou
fluxo para o atleta. A pessoa é avisada uma única vez quando a troca acontece, e só. Qual fornecedor
atende a alternativa é decisão da spec; aqui interessa o que o atleta percebe.

O limite continua o mesmo: o coach só propõe. Nenhum fornecedor, principal ou alternativo, altera
uma sessão sem o atleta aplicar a proposta — ver [ADR-0002](../../adr/0002-ai-annotations-are-not-plan-changes.md).

---

## 2. Rastreabilidade

| Item do [product brief](../../product-brief.md) | O que esta funcionalidade entrega |
|---|---|
| Escopo › "Insight por corrida e feed de insights" | O insight continua sendo gerado e aparece no feed quando o fornecedor principal está indisponível ou sem saldo. |
| Escopo › "Chat com o coach, com propostas de mudança negociadas e aplicadas pelo atleta" | O chat continua respondendo em streaming, e as propostas continuam sendo validadas no servidor e aplicadas só pelo atleta. |
| Escopo › "Meta, plano de treino, sessões e edição de sessão" | O plano continua recebendo análise, foco e dicas do coach na troca de fornecedor; estrutura, distância, pace, dia e tipo continuam vindo das regras do produto. |
| Requisitos não funcionais › "o coach responde em streaming, sem travar a conversa" | A conversa mantém o streaming quando atendida pelo fornecedor alternativo. |
| Requisitos não funcionais › "telas com carregamento, vazio e erro tratados, em pt-BR" | Quando nenhum fornecedor responde, o atleta vê erro em pt-BR e consegue tentar de novo. |

Métricas e requisitos não funcionais do produto não são repetidos aqui; as metas numéricas
continuam sendo as questões em aberto do product brief.

---

## 3. Fluxos

1. **Ler a corrida sem o fornecedor principal.** A pessoa abre uma corrida que ainda não tem
   insight com o fornecedor principal fora do ar. O insight é gerado pelo fornecedor alternativo e
   aparece na tela como qualquer outro.
2. **Conversar com o coach na falha.** A pessoa manda uma mensagem no chat. A resposta chega em
   streaming, na mesma tela, e as propostas de mudança aparecem como sempre — para aplicar, ela
   precisa clicar.
3. **Gerar ou regenerar o plano na falha.** A pessoa cria ou regenera o plano. O plano é gerado
   com as mesmas semanas e sessões de sempre, e recebe análise, foco e dicas escritos pelo
   fornecedor alternativo.
4. **Trocar de fornecedor na falha.** O saldo do fornecedor principal acaba ou o serviço sai do
   ar. A troca é automática: as próximas chamadas são atendidas pelo alternativo e a pessoa vê no
   máximo um aviso de que houve uma falha. Fora esse aviso, nada muda na tela.
5. **Voltar ao normal.** Quando o fornecedor principal volta a responder, o atendimento retorna a
   ele sozinho, sem que a pessoa precise fazer nada.
6. **Nenhum fornecedor disponível.** Se nem o principal nem o alternativo responderem, a pessoa vê
   o erro tratado em pt-BR, no mesmo padrão de hoje, e pode pedir o insight ou reenviar a mensagem
   depois.
7. **Completar o que ficou sem gerar.** A corrida que ficou sem insight e o plano que ficou sem
   análise, foco ou dicas por causa da falha recebem esse conteúdo assim que um fornecedor volta a
   responder.

---

## 4. Histórias de usuário

- Como atleta, quero receber a leitura da minha corrida mesmo quando o fornecedor de IA principal
  estiver indisponível, para não perder o retorno sobre o treino.
- Como atleta, quero continuar conversando com o coach quando o fornecedor principal falhar, para
  não ficar sem orientação no meio da semana.
- Como atleta, quero gerar meu plano com análise, foco e dicas mesmo quando o fornecedor principal
  falhar, para não adiar o começo do plano.
- Como atleta, quero que o coach continue apenas propondo mudanças, para nenhuma sessão mudar sem
  eu aplicar.
- Como atleta, quero que tudo o que já foi gerado continue no mesmo lugar depois de uma troca de
  fornecedor, para não perder meu histórico.
- Como atleta, quero saber uma única vez que uma falha fez o coach mudar de fornecedor, para
  entender uma resposta diferente sem ser avisado a cada mensagem.
- Como atleta, quero ver as mesmas telas e os mesmos textos de sempre, para não precisar aprender
  nada novo.

---

## 5. Critérios de aceite

1. A pessoa abre uma corrida sem insight com o fornecedor principal indisponível e o insight é
   gerado e exibido normalmente.
2. A pessoa envia uma mensagem no chat com o fornecedor principal indisponível e recebe a resposta
   em streaming, na mesma tela.
3. A pessoa recebe uma proposta do coach atendida pelo fornecedor alternativo e nenhuma sessão muda
   de distância, pace, dia, tipo ou conclusão até ela aplicar a proposta.
4. A pessoa gera ou regenera o plano com o fornecedor principal indisponível e o plano aparece com
   análise, foco e dicas; as semanas e sessões continuam respeitando dia único, sessão de descanso
   e política de idade.
5. Insights, conversas e planos gerados antes de uma troca de fornecedor continuam legíveis, no
   mesmo lugar e com o mesmo conteúdo.
6. A mesma corrida não recebe dois insights por causa de uma falha seguida de nova tentativa.
7. A pessoa vê no máximo um aviso quando a falha faz o coach trocar de fornecedor, e o aviso não se
   repete a cada mensagem nem a cada tela.
8. Fora esse aviso, nenhuma tela, nome de campo, texto ou fluxo muda quando a resposta vem do
   fornecedor alternativo.
9. Se nem o fornecedor principal nem o alternativo responderem, a pessoa vê o erro em pt-BR e
   consegue tentar de novo depois.
10. A pessoa abre uma corrida ou um plano que ficou sem insight, análise, foco ou dicas por causa
    da falha e encontra o conteúdo gerado assim que um fornecedor volta a responder.
11. Nenhuma tela e nenhuma ação alcançam insight, conversa ou plano de outra pessoa,
    independentemente do fornecedor que atendeu.

---

## 6. Fora de escopo

- **Escolha de fornecedor pelo atleta** — a troca é automática e não é uma preferência do atleta;
  nenhuma tela nova aparece.
- **Limite de gasto ou de uso de IA por atleta** — é questão em aberto do
  [product brief](../../product-brief.md); esta funcionalidade só trata a indisponibilidade e a
  falta de saldo do contrato.
- **Regerar o que já existe** — insights, conversas e planos já gerados não são refeitos na troca
  de fornecedor; só o que ficou sem gerar é gerado depois.
- **Busca semântica e qualquer uso novo do conteúdo da IA** — o conteúdo de dois fornecedores
  diferentes não é comparável entre si, e a busca continua fora do escopo do
  [product brief](../../product-brief.md).
- **Mudança de contrato de API e de telas** — nenhuma rota, nome de campo ou formato de resposta
  muda; o frontend não é tocado.
- **Regras de saúde e de plano** — continuam determinísticas, no servidor, iguais para qualquer
  fornecedor; IA não passa a decidir limite, distância ou dia.
- **Observabilidade e alerta de falha do fornecedor** — acompanhamento de disponibilidade e de
  custo por fornecedor não é entregue aqui; fica com a lacuna de observabilidade do
  [HLD](../../hld.md) §11.
- **Hospedar modelo próprio, local ou auto-hospedado** — fora do escopo; a alternativa é um
  fornecedor já contratado.

---

## 7. Dependências

Nenhuma. É a `F04` do [roadmap](../../roadmap.md), sem dependência registrada. As funcionalidades
`F01`, `F02` e `F03` não bloqueiam esta, embora `F01` toque o mesmo conteúdo escrito pelo coach —
a ordem de entrega deve evitar conflito no mesmo código.

---

## 8. Questões em aberto

- [ ] **Paridade mínima de qualidade do fornecedor alternativo** — se ele precisa devolver o mesmo
      formato de proposta e respeitar as mesmas regras de saúde do principal; sem isso o critério 3
      fica subjetivo.
- [ ] **Quais fluxos entram na alternativa** — insight, plano e chat são visíveis ao atleta; o
      pareamento de atividade também usa IA, mas não aparece para ele. Decidir se ele entra trava
      o tamanho da entrega.
- [ ] **Texto pt-BR do aviso único** — sem a redação acordada, o critério 7 não tem o que verificar.
