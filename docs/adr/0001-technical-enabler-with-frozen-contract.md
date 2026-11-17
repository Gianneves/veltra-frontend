# Enabler técnico entregue como funcionalidade, com contrato congelado

`F01` não entrega comportamento novo ao atleta: ela faz as regras que já existem valerem
igual em todos os caminhos. Foi registrada como funcionalidade numerada, com PRD restrito ao
que o atleta percebe e o trabalho estrutural descrito na spec, porque a alternativa — uma
reescrita aberta do backend — mudaria rotas, nomes de campo e formato de resposta e quebraria o
frontend, que hoje é o único consumidor da API.

**Considered Options:** reescrita sem congelar contrato (menos cerimônia, risco de regressão e
retrabalho no frontend); não registrar e tratar como dívida solta (invisível no roadmap e sem
critério de pronto).

**Consequences:** o frontend não é tocado, exceto para exibir o motivo de uma recusa; qualquer
necessidade de mudar contrato vira funcionalidade própria; `F01` só fecha quando as invariantes
do HLD §9 valerem em todos os caminhos, com teste que prove. `F02` (próximo treino no servidor)
e `F03` (hardening) dependem desta.
