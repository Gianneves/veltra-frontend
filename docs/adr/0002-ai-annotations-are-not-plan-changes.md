# Anotação de IA não é mudança de plano

O invariante 7 do HLD diz que a IA não aplica mudanças, mas o backend grava foco do plano e
dicas do coach nas sessões sem ação do atleta. Decidimos que "mudança de plano" é o que altera
**distância, pace, dia, tipo ou estado de conclusão** de uma sessão; anotação gerada por IA é
conteúdo derivado e pode ser escrita direto no plano.

**Considered Options:** remover a escrita e o atleta perder as dicas até existir outra entrega;
transformar a anotação em proposta que o atleta aplica — correto a longo prazo, mas é
funcionalidade de produto, não refactor.

**Consequences:** o HLD §9.7 passa a declarar essa fronteira; qualquer escrita de IA que toque
nos cinco campos de mudança é bug, mesmo que venha do mesmo fluxo; o caminho de anotação precisa
de teste que prove que não altera esses campos.
