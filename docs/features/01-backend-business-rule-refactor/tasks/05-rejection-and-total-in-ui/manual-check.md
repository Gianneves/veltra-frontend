# Roteiro manual da F01-T05: recusa e total na interface

Roteiro da spec §8, itens 3, 4 e 5, executado no frontend em `http://localhost:3000` com o backend
em `http://localhost:3001/api/v1`. Automação: `npx tsc --noEmit` no `veltra-frontend` passou.

## Preparação (revertida ao final)

O único atleta do banco de desenvolvimento não tinha plano na semana corrente nem restrições de
idade (30 anos), então a fixture foi montada e desfeita por SQL, sem alterar código:

- `birthDate` temporário de 14 anos, para ativar os limites de volume (25 km/semana) e de
  qualidade (1 estímulo);
- plano da semana de 12/10 movido para a semana corrente, com `plannedWeeklyKm` de 23,8 km
  (sessões: 13,0 + 4,4 + 3,2 + 3,2), para plano e dashboard mostrarem a mesma semana;
- conversa do coach semeada com duas propostas que elevam as corridas leves de quinta e sexta
  para 8 km, cada uma levando a semana a 28,6 km e o lote a 33,4 km, acima do limite de 25 km.

Depois do roteiro, `birthDate`, `weekStart`, `plannedWeeklyKm`, distâncias, paces e a conversa
semeada foram restaurados aos valores originais.

## 3 — Plano e dashboard com o mesmo planejado

- Plano: cabeçalho "Esta Semana · 4 treinos · 24km".
- Dashboard: "REALIZADO 9.0 km", "1 corridas • 50min", "38% do planejado • meta de 24km".
- Esperado e obtido: os dois lados mostram o mesmo planejado (24 km, vindo de `plannedWeeklyKm`) e
  o realizado de `/analytics/weekly` aparece rotulado como "Realizado".

Captura: `captura-dashboard.png`.

## 4 — Recusa na edição da sessão

- Edição da distância da sessão de quinta de 3,2 km para 6,4 km.
- Resposta do servidor: `400` com `AGE_POLICY`; mensagem exibida no cartão: "A semana ficaria com
  27,0 km de volume planejado; para a sua idade o limite é 25 km. Reduza a distância de uma das
  sessões e tente de novo. Nada foi alterado."
- Esperado e obtido: a mensagem aparece no próprio cartão, com o fundo de erro; o cartão continua
  com 3,2 km e o cabeçalho da semana com 24 km; nenhuma requisição de leitura do plano é feita
  depois do `PUT` recusado.

Captura: `captura-rejeicao-edicao.png`.

## 5 — Recusa na proposta do coach

- Aplicação individual: `PUT` individual responde `400` e o cartão mostra "A semana ficaria com
  28,6 km de volume planejado; para a sua idade o limite é 25 km. … Nada foi alterado.".
- Aplicação em lote ("Aplicar todas"): `PUT .../sessions/batch` responde `400` e os dois cartões
  mostram "A semana ficaria com 33,4 km de volume planejado; para a sua idade o limite é 25 km. …".
- Esperado e obtido: mensagem real do servidor no lugar do texto genérico nos dois caminhos, sem
  alteração no plano.

Captura: `captura-rejeicao-proposta-lote.png`.

## Achado fora do escopo desta tarefa

Durante a preparação apareceu um defeito no backend, anterior a esta tarefa e no caminho de
`F01-T02`/`F01-T03`: como o `ValidationPipe` roda com `transform: false` e `whitelist: true`, o
`classToPlain` do Nest 11 materializa os campos opcionais ausentes do DTO com `undefined`; o
`{ ...session, ...data }` de `applySessionChanges` então apaga esses campos no objeto em memória.

- `PUT .../sessions/:sessionId` só com `plannedPace` responde `200`, mas `plannedWeeklyKm` cai de
  15.800 para 12.600 m (a distância da sessão editada vira `undefined` na soma).
- `PUT .../sessions/batch` com itens sem `day` (proposta só de distância) responde `400`
  `DAY_COLLISION` com "o dia undefined ficaria com duas sessões".

As linhas do banco preservam os valores (`undefined` não é gravado), mas o total da semana e a
validação de dia único usam o estado em memória corrompido. Não foi corrigido aqui: o backend está
fora do escopo da F01-T05 e o defeito pertence às tarefas que implementaram a edição. Registrado
para virar tarefa própria.
