# Roteiro manual da F01-T05: recusa e total na interface

Roteiro da spec §8, itens 3, 4 e 5. Frontend em `http://localhost:3000`, backend em
`http://localhost:3001/api/v1`, com um atleta que tenha plano gerado, idade no perfil e
propostas do coach na conversa.

Automação: `npx tsc --noEmit` no `veltra-frontend` passou. Não há runner de teste no frontend.

## 3 — Plano e dashboard com o mesmo planejado

1. Abrir `/training-plan` e anotar o total da semana no cabeçalho ("N treinos · Xkm").
2. Abrir `/dashboard` e conferir o card "Esta Semana".
3. Esperado: o planejado do dashboard mostra o mesmo `Xkm` (ambos vêm de `plannedWeeklyKm`,
   arredondado com `toFixed(0)`); a distância de `/analytics/weekly` aparece rotulada como
   "Realizado".

Resultado: pendente de execução.

## 4 — Recusa na edição da sessão

1. Abrir o plano e editar a distância de uma sessão para um valor que passe do limite de volume
   da idade.
2. Confirmar, se aparecer o diálogo de ciência.
3. Esperado: a mensagem em pt-BR enviada pelo servidor (com volume e limite) aparece no próprio
   cartão da sessão, com o fundo de erro do design system; a semana continua com os valores de
   antes e a tela não recarrega o plano.
4. Repetir com o ritmo em um valor que estoure o limite de qualidade.

Resultado: pendente de execução.

## 5 — Recusa na proposta do coach

1. Abrir `/coach/chat` e pedir uma proposta que faça o volume ou a qualidade da semana passar do
   limite da idade.
2. Aplicar a proposta individualmente.
3. Esperado: o cartão da proposta mostra a mensagem real do servidor (volume/qualidade e limite),
   no lugar do texto genérico, e nada muda no plano.
4. Repetir em lote (duas ou mais propostas): a mesma mensagem aparece em cada cartão do grupo
   recusado.

Resultado: pendente de execução.
