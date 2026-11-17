# PRD — Backend business-rule refactor

> **Status:** pronto
> **Funcionalidade:** `F01`
> **Roadmap:** [docs/roadmap.md](../../roadmap.md)
> **Product brief:** [docs/product-brief.md](../../product-brief.md)
> **Glossário:** [GLOSSARY.md](../../../GLOSSARY.md)
> **ADRs:** [ADR-0001](../../adr/0001-technical-enabler-with-frozen-contract.md),
> [ADR-0002](../../adr/0002-ai-annotations-are-not-plan-changes.md)

---

## 1. Problema e objetivo

O atleta já tem plano, análise, descanso e limites por idade — mas as regras que sustentam isso
não valem igual em todos os caminhos. Na prática ele encontra: uma sessão de descanso que aparece
como concluída; a mesma semana somando distâncias diferentes em telas diferentes; a mesma corrida
contada em duas semanas; o limite de volume e de qualidade da idade respeitado quando o plano é
gerado e ignorado quando ele edita; e a possibilidade de enxergar atividade, sessão ou insight de
outra pessoa.

O objetivo é que cada regra do produto valha uma única vez para o atleta, em qualquer tela e em
qualquer ação, sem que ele precise aprender nada novo. Nada de tela, nome de campo ou caminho
muda: o que existe continua igual — o que muda é que deixa de divergir.

O trabalho estrutural que torna isso possível (legibilidade, fronteiras internas, testes) não é
comportamento do produto e vive na spec. O contrato de API congelado e as consequências estão na
[ADR-0001](../../adr/0001-technical-enabler-with-frozen-contract.md).

---

## 2. Rastreabilidade

| Item do [product brief](../../product-brief.md) | O que esta funcionalidade entrega |
|---|---|
| Escopo › "Meta, plano de treino, sessões e edição de sessão" | Edição de sessão e de semana com as mesmas regras da geração: dia único, descanso, limites por idade. |
| Escopo › "Políticas de saúde por idade e alertas de segurança" | Limite de distância, volume semanal e qualidade aplicado também na edição, não só na geração. |
| Escopo › "Sincronização de corridas por webhook e por reimportação manual" | Atividade importada só afeta o plano e os dados do próprio atleta; apagar no Strava desfaz só o pareamento dele. |
| Escopo › "Analytics da semana atual, conquistas, melhores tempos e previsões" | Semana atual consistente entre telas, contada de segunda a domingo na hora local e só com corridas. |
| Requisitos não funcionais › "nenhuma tela mostra dado de outro atleta" | Escopo por atleta em todos os caminhos, inclusive webhook e importação. |
| Requisitos não funcionais › "telas com carregamento, vazio e erro tratados, em pt-BR" | Recusa de alteração chega à tela com o motivo em pt-BR. |

Métricas e requisitos não funcionais do produto não são repetidos aqui; as metas numéricas
continuam sendo as questões em aberto do product brief.

---

## 3. Fluxos

1. **Editar sessão.** A pessoa abre a semana, muda distância, pace ou dia de uma sessão. Se o dia
   já está ocupado ou a distância passa do limite da idade, ela recebe a recusa com o motivo e
   nada muda; se a alteração é aceita, a semana e o painel mostram o mesmo estado.
2. **Editar a semana inteira.** A pessoa muda várias sessões de uma vez. A semana é aceita por
   inteiro ou recusada por inteiro, com o motivo; o volume e a quantidade de sessões de qualidade
   respeitam o limite da idade.
3. **Converter em descanso.** A pessoa transforma uma sessão em descanso — inclusive uma que já
   foi concluída. O dia passa a aparecer como descanso, sem conclusão, com distância e pace
   zerados, e deixa de contar como treino feito.
4. **Importar corrida.** Uma corrida chega do Strava e é pareada com a sessão daquele dia, se
   houver. Sessão de descanso nunca recebe pareamento. Se a corrida é apagada no Strava, só o
   pareamento dela é desfeito; nenhum plano de outra pessoa muda.
5. **Conferir a semana.** A pessoa abre as telas que resumem a semana e vê o mesmo total:
   segunda a domingo na hora local, só corridas dela, e uma corrida na virada da semana contada
   uma única vez.
6. **Receber dica do coach.** O plano traz foco e dicas escritas pelo coach. Nenhuma sessão muda
   de distância, pace, dia, tipo ou conclusão até a pessoa aplicar uma proposta.
7. **Acessar o que é seu.** A pessoa nunca encontra, por nenhuma tela e por nenhum caminho,
   atividade, sessão, plano ou insight de outra pessoa — e nenhuma ação dela altera dado de outra
   pessoa.

---

## 4. Histórias de usuário

- Como atleta, quero que uma sessão de descanso nunca apareça como concluída, para confiar no meu
  plano.
- Como atleta, quero que os limites da minha idade valham quando eu edito o plano, e não só
  quando ele é gerado, para não passar do limite sem perceber.
- Como atleta, quero saber por que uma alteração foi recusada, para saber o que ajustar.
- Como atleta, quero que a semana mostrada na análise seja a mesma em qualquer tela, para não
  comparar dois totais diferentes.
- Como atleta, quero que o coach escreva dicas no plano sem alterar meus treinos sozinho, para
  continuar no controle.
- Como atleta, quero que nada meu apareça para outra pessoa, para meus dados ficarem só comigo.
- Como atleta, quero continuar usando as telas exatamente como hoje, para não ter que reaprender
  o produto.

---

## 5. Critérios de aceite

1. A pessoa tenta colocar duas sessões no mesmo dia e recebe a recusa com o motivo em pt-BR; a
   semana continua com uma sessão por dia.
2. A pessoa edita a distância de uma sessão acima do limite da idade e recebe a recusa com o
   motivo; quando ela registra ciência do limite, a edição é aceita.
3. A pessoa edita a semana de modo que o volume passe do limite da idade e recebe a recusa com o
   motivo.
4. A pessoa coloca na semana mais sessões de qualidade do que a idade permite e recebe a recusa
   com o motivo.
5. A pessoa converte uma sessão concluída em descanso e o dia passa a aparecer sem conclusão, com
   distância e pace zerados.
6. Uma corrida importada nunca é pareada com uma sessão de descanso.
7. A pessoa apaga uma corrida no Strava e só o pareamento dela é desfeito; nenhuma sessão de
   outra pessoa muda.
8. A semana da análise considera apenas corridas da pessoa, de segunda a domingo na hora local, e
   uma corrida feita na virada da semana aparece em uma única semana.
9. Duas telas que mostram a mesma semana exibem o mesmo total de distância.
10. O foco e as dicas escritas pelo coach aparecem no plano e nenhuma sessão muda de distância,
    pace, dia, tipo ou conclusão sem a pessoa aplicar uma proposta.
11. Nenhuma tela e nenhuma ação alcançam atividade, sessão, plano ou insight de outra pessoa.
12. Duas alterações feitas ao mesmo tempo no mesmo dia não deixam duas sessões no mesmo dia.
13. A pessoa continua usando plano, análise, conquistas e coach como hoje; nenhum campo, tela ou
    caminho muda de nome.

---

## 6. Fora de escopo

- **Próximo treino calculado no servidor** — é a `F02` do [roadmap](../../roadmap.md); hoje a
  regra vive na tela e movê-la exigiria caminho novo.
- **Postura de segurança** — proteção contra requisição de outro site, revogação de sessão no
  logout, criptografia dos tokens do Strava, limite de uso por rota, cabeçalhos de segurança e
  teto de paginação são a `F03` do [roadmap](../../roadmap.md), que vira bloqueio de deploy.
- **Contrato de API e telas** — nenhuma rota, nome de campo ou formato de resposta muda; o
  frontend só ganha a exibição do motivo da recusa (ver ADR-0001).
- **Banco** — migrations versionadas e garantia de dia/semana única no armazenamento ficam com a
  feature de migrations; aqui a garantia é que uma edição de semana é aceita ou recusada por
  inteiro.
- **Observabilidade e orçamento de IA** — lacunas do HLD §11 e questões abertas do
  [product brief](../../product-brief.md).
- **Gráficos de Análises com dados de demonstração** — limite registrado no
  [product brief](../../product-brief.md).
- **Busca semântica, multiusuário, outros esportes e app nativo** — fora do escopo do
  [product brief](../../product-brief.md).

---

## 7. Dependências

Nenhuma. É a `F01` do [roadmap](../../roadmap.md), sem dependência registrada; `F02` e `F03`
dependem desta.

---

## 8. Questões em aberto

- [ ] **Cobertura mínima no gate de testes** — qual percentual e em quais arquivos; sem isso o
      "testado" do pronto fica subjetivo.
- [ ] **Quando entra a garantia de dia/semana única no armazenamento** — depende da feature de
      migrations; sem isso, duas alterações simultâneas continuam podendo se sobrepor em teoria.
- [ ] **Texto pt-BR de cada recusa** — dia ocupado, limite de distância, volume da semana e
      qualidade; sem isso a tela não tem redação acordada.
- [ ] **Frequência do teste de integração no CI** — em todo PR ou apenas noturno; trava o custo
      do pipeline.
- [ ] **O que fazer com dados já inconsistentes** — plano com descanso concluído ou semana
      duplicada que já existam no banco; decidir entre correção única, correção na leitura ou
      deixar como está trava o critério 5 para planos antigos.
