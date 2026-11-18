# Fornecedor de IA atrás de uma porta, com alternativa e fallback automático

O coach, os insights e as análises de plano dependiam de um único fornecedor de IA: sem saldo ou
com o serviço fora do ar, o produto parava de entregar a parte conversacional. A `F04` passou a
falar com a IA por uma porta — um contrato de chamada único — com um fornecedor alternativo
acionado automaticamente na falha e volta automática ao principal. O contrato da porta, o
fornecedor alternativo e o critério exato de troca ficam na spec.

**Considered Options:** chamar o SDK do fornecedor direto em cada serviço de domínio (menos
cerimônia, mas toda troca de fornecedor exigiria reescrever insight, plano, chat e pareamento);
trocar de fornecedor em massa quando o saldo acaba, sem alternativa automática (aceita uma parada
a cada falha); rotear cada tarefa para um fornecedor diferente por custo (mais barato, mas duas
qualidades de resposta convivendo e dois formatos de saída para validar).

**Consequences:** todo fluxo de IA novo nasce atrás da porta, e nenhum serviço de domínio importa
SDK de fornecedor; o conteúdo já gerado não é regerado na troca — só o que ficou sem gerar é
gerado depois; o atleta vê no máximo um aviso por troca. Embeddings de fornecedores diferentes não
são comparáveis entre si, então a alternativa atende conteúdo novo e a busca semântica continua
fora de escopo (HLD §11). Custo e disponibilidade por fornecedor seguem sem observabilidade
própria.
