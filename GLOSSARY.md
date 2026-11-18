# Glossário — Veltra

Vocabulário do domínio de treinamento de corrida do Veltra. É a referência de termos para PRDs,
specs, tarefas e código. Não descreve implementação: estrutura, tabelas e algoritmos vivem no
[LLD](./docs/lld.md).

## Linguagem

### Pessoas e papéis

**Atleta**:
A pessoa que usa o Veltra para organizar o treino de corrida.
_Avoid_: usuário, corredor, cliente, conta

**Coach**:
O agente conversacional de IA que analisa o treino do atleta e sugere mudanças.
_Avoid_: treinador, assistente, bot, IA do plano

**Proposta**:
Uma mudança concreta no plano sugerida pelo coach, que só existe depois de validada no servidor.
_Avoid_: sugestão, recomendação, alteração automática

**Rejeição**:
O registro de uma proposta que o atleta recusou, com o motivo.
_Avoid_: cancelamento, descarte

### Treino

**Atividade**:
Uma corrida importada do Strava, com as métricas medidas pelo relógio ou aplicativo.
_Avoid_: treino, sessão, workout

**Sessão**:
Um treino prescrito em um dia do plano, com distância e pace planejados.
_Avoid_: atividade, treino do dia, workout

**Plano**:
O conjunto de semanas de treino de um atleta até uma meta.
_Avoid_: cronograma, programação, planilha

**Semana do plano**:
O bloco de segunda a domingo ao qual as sessões pertencem.
_Avoid_: semana, ciclo

**Dia único**:
A regra de que cada semana tem no máximo uma sessão por dia.
_Avoid_: um treino por dia, exclusividade de dia

**Sessão de descanso**:
A sessão que ocupa um dia sem treino e nunca é marcada como concluída.
_Avoid_: folga, off, rest day

**Longão**:
A sessão mais longa da semana, que sustenta a resistência para a meta.
_Avoid_: long run, corrida longa, treino longo

**Qualidade**:
As sessões de intensidade da semana — intervalado, tempo e fartlek.
_Avoid_: treino forte, intensidade, speedwork

**Volume planejado**:
A soma das distâncias das sessões que não são de descanso em uma semana.
_Avoid_: quilometragem, carga

**Ajuste de volume**:
A redução automática do volume de uma semana que passaria do limite seguro do atleta.
_Avoid_: corte, diminuição, correção de carga

**Pareamento**:
O vínculo entre uma atividade realizada e a sessão que ela cumpriu.
_Avoid_: match, vinculação, associação

**Aderência**:
A relação entre o que foi planejado e o que foi realizado em um período.
_Avoid_: cumprimento, performance, execução

**Padrão de treino**:
Os dias e horários em que o atleta costuma treinar, usados para montar o plano.
_Avoid_: rotina, disponibilidade, agenda

**Foco**:
O tema que orienta uma semana do plano.
_Avoid_: objetivo da semana, tema

**Insight**:
A leitura em linguagem de treino que o coach faz de uma atividade, no detalhe da corrida e no feed
de insights.
_Avoid_: análise, comentário, feedback

### Meta e progresso

**Meta**:
A prova que o atleta quer correr, com distância e data alvo.
_Avoid_: objetivo, target, prova

**Marco**:
Um ponto de progresso da meta, em 25%, 50% e 75% da distância alvo.
_Avoid_: milestone, etapa, checkpoint

**Benchmark de 3 km**:
O tempo de referência do atleta em 3 km, usado para calcular os paces do plano.
_Avoid_: teste de 3 km, time trial, referência de pace

**Conquista**:
Um resultado notável do histórico do atleta — troféu, melhor tempo ou previsão.
_Avoid_: badge, medalha, prêmio

**Troféu**:
A conquista por um feito alcançado, como um recorde pessoal.
_Avoid_: medalha, badge

**Melhor tempo**:
A conquista pelo menor tempo do atleta em uma distância.
_Avoid_: recorde pessoal, PR, best effort

**Previsão**:
A conquista que estima o tempo do atleta em outra distância a partir do histórico.
_Avoid_: projeção, estimativa

**Próximo treino**:
A próxima sessão a cumprir, ignorando as de descanso e avançando para a semana seguinte quando
necessário.
_Avoid_: próximo, treino de hoje, agenda

**Analytics semanal**:
O resumo de distância, pace e tempo da semana atual do atleta.
_Avoid_: estatísticas, relatório, dashboard

### Saúde e segurança

**Perfil do atleta**:
Os dados que o atleta declara sobre si — data de nascimento, consentimento e preferências de treino.
_Avoid_: conta, cadastro, usuário

**Política de idade**:
O conjunto de limites de distância, volume e qualidade que varia com a idade do atleta.
_Avoid_: restrição, limite de idade, regra de segurança

**Alerta de saúde**:
O aviso gerado quando o treino do atleta passa de um limite da política de idade.
_Avoid_: aviso, warning, notificação

**Consentimento de saúde**:
O registro de que o atleta está ciente do uso dos seus dados de saúde.
_Avoid_: aceite, termo, autorização

### Integração

**Resync**:
A reimportação manual do histórico de atividades do atleta a partir do Strava.
_Avoid_: sincronização, importação, refresh

**Webhook**:
O aviso que o Strava envia ao Veltra quando uma atividade nova aparece.
_Avoid_: callback, evento, notificação

### Planejamento

**Funcionalidade (F)**:
A unidade de entrega de produto, com número global que nunca muda.
_Avoid_: feature, épico, iniciativa

**PRD**:
O documento que descreve o problema, os fluxos e os critérios de aceite de uma funcionalidade.
_Avoid_: requisitos, briefing

**Spec**:
O documento que descreve como uma funcionalidade será construída, com as decisões de
implementação e as tarefas.
_Avoid_: especificação técnica, design doc

**Tarefa**:
A unidade de trabalho de uma funcionalidade, numerada dentro dela e com critérios de aceite.
_Avoid_: item, subtarefa, ticket

**Plano de tarefa**:
O documento que descreve, antes do código, o contrato que uma tarefa cria e como cada critério de
aceite será aprovado.
_Avoid_: plano de implementação, plano de execução
