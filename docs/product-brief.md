# Product Brief — Veltra

> **Status:** rascunho
> **Fontes:** [HLD](./hld.md) §1–§3 e §10–§11, [LLD](./lld.md), [GLOSSARY.md](../GLOSSARY.md)
> **Papel:** dono do escopo, do público, das métricas e dos requisitos não funcionais do produto.
> PRDs apontam para cá em vez de repetir estas regras.

---

## Problema

Corredores amadores treinam sem um plano que acompanhe o que eles realmente correm. O histórico
fica espalhado no Strava, o plano vive em planilha e a decisão de ajustar volume ou intensidade
depende de intuição — o que leva a excesso de treino, semanas perdidas e metas abandonadas.

---

## Público

**Atleta** — corredor amador que já registra corridas no Strava e prepara uma prova. Quer saber se
está no caminho certo e o que fazer no próximo treino, sem contratar um treinador.

Não é público do produto, no estado atual: times, treinadores humanos com painel, atletas de
modalidades diferentes de corrida.

---

## Proposta de valor

1. O plano nasce do histórico real e da meta do atleta, não de um modelo genérico.
2. Cada corrida recebe uma leitura em linguagem de treino, não só números.
3. O coach conversa sobre o treino e **propõe** mudanças; quem decide é o atleta.
4. Os limites de segurança por idade são aplicados mesmo quando o atleta pede mais.

---

## Escopo

### Dentro do escopo

- Entrada com Strava e sessão autenticada.
- Sincronização de corridas por webhook e por reimportação manual.
- Meta, plano de treino, sessões e edição de sessão.
- Insight por corrida e feed de insights.
- Chat com o coach, com propostas de mudança negociadas e aplicadas pelo atleta.
- Analytics da semana atual, conquistas, melhores tempos e previsões.
- Políticas de saúde por idade e alertas de segurança.

### Fora do escopo

- Aplicativo mobile nativo.
- Multiusuário por conta, times, cobrança e assinaturas.
- Modalidades diferentes de corrida (ciclismo, natação etc.).
- Treinador humano com painel administrativo.
- Busca semântica exposta ao atleta.

O detalhamento de arquitetura e de limites técnicos está no [HLD](./hld.md) §2 e §11.

---

## Métricas

As metas numéricas ainda não foram definidas; esta seção é a dona delas.

| Métrica | O que mede | Meta |
|---|---|---|
| Aderência semanal | Sessões cumpridas sobre sessões planejadas, por semana | a definir |
| Semanas ativas | Semanas com pelo menos uma atividade pareada | a definir |
| Continuidade da meta | Atletas que mantêm a mesma meta por mais de quatro semanas | a definir |
| Aceite de proposta | Propostas do coach aplicadas sobre propostas apresentadas | a definir |
| Segurança | Semanas que passam do limite da política de idade | a definir |

---

## Requisitos não funcionais

Os requisitos não funcionais do produto são os do [HLD](./hld.md) §10 — segurança, desempenho,
confiabilidade, observabilidade, CI/CD e UX. Este documento não os repete.

Resumo do que o atleta percebe:

- a sessão continua válida entre requisições, sem perder o login;
- nenhuma tela mostra dado de outro atleta;
- telas com carregamento, vazio e erro tratados, em pt-BR;
- o coach responde em streaming, sem travar a conversa.

---

## Limites e dívidas que afetam o produto

Do [HLD](./hld.md) §11 e do [LLD](./lld.md) §20:

- os gráficos de Análises ainda usam dados de demonstração;
- o consentimento de saúde é registrado, mas as políticas de idade valem mesmo sem ele;
- não há orçamento nem limite de gasto de IA por atleta;
- não há deploy automático nem migrations versionadas.

---

## Questões em aberto

- [ ] Definir as metas numéricas das métricas acima; sem elas não há como avaliar se uma
      funcionalidade moveu o produto.
- [ ] Decidir se o consentimento de saúde passa a condicionar a aplicação das políticas de idade.
- [ ] Definir se haverá limite de uso de IA por atleta e qual é o critério.
