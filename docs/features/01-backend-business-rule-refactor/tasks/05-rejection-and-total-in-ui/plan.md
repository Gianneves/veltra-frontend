# Plano da F01-T05: Recusa e total na interface

Tarefa: [task.md](task.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** revisão humana

**Cenário:** Dado um atleta que tenta uma edição recusada, quando o servidor responde `400` com `{ code, message }`, então o chamador recebe `{ status, message, code }` com o texto do servidor; quando o corpo não é JSON (proxy ou indisponibilidade devolvendo HTML), o chamador recebe `{ status, message }` com o `statusText`, como hoje. Quem revisa lê o tratamento de `!res.ok` em `src/lib/api/client.ts` e confirma a leitura única do corpo, os dois campos extraídos e o caminho de fallback.

### CA2

**Marca:** revisão humana

**Cenário:** Dado um atleta com a semana do plano aberta, quando ele edita a distância ou o ritmo de uma sessão e o servidor recusa a mudança (volume ou qualidade acima do limite da idade, ou dia ocupado), então a mensagem do servidor em pt-BR aparece no próprio cartão daquela sessão com os tokens de erro, a semana permanece com os valores de antes e a tela não recarrega o plano. Roteiro da spec §8, item 4.

### CA3

**Marca:** revisão humana

**Cenário:** Dado um atleta com propostas do coach na conversa, quando ele aplica uma proposta que faria o volume ou a qualidade da semana passar do limite da idade, então o cartão da proposta mostra a mensagem do servidor (com volume/qualidade e limite) no lugar do texto genérico, tanto na aplicação individual quanto na aplicação em lote, e nada é alterado no plano. Roteiro da spec §8, item 5.

### CA4

**Marca:** revisão humana

**Cenário:** Dado um atleta com uma semana de plano gerada, quando ele abre o plano e o dashboard da mesma semana, então o cabeçalho da semana do plano e o planejado do dashboard mostram o mesmo total, lido de `plannedWeeklyKm`, e o dashboard exibe a distância de `/analytics/weekly` rotulada como realizado. Roteiro da spec §8, item 3.

### CA5

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa procura rotas, campos de API, arquivos em `src/components/ui` e itens de sidebar, então não encontra nenhum item novo: só mudam `client.ts`, `training.ts` e as páginas do plano e do dashboard, sem arquivo de componente nem tela nova.

### CA6

**Marca:** revisão humana

**Cenário:** Dado o resumo de verificação da implementação, quando quem revisa confere, então `npx tsc --noEmit` no frontend passou e os itens 3, 4 e 5 do roteiro manual da spec §8 (mesmo total no plano e no dashboard, recusa na edição, recusa na proposta do coach) foram executados com o resultado esperado, sem runner de teste novo no frontend.

## Contrato

O contrato não muda.

Nenhuma rota, evento ou tabela é criada, alterada ou removida. A forma do erro (`{ status, message, code }`) é comportamento do client HTTP, registrado no LLD §17.3, e não contrato da API: o backend continua devolvendo `{ code, message, ... }` com os mesmos status (`LLD §2`, `HLD §8`). A tabela de rotas do HLD §8 e o modelo de dados do LLD §4 não recebem delta.

## Verificação do contrato

Nenhum item: sem rota, evento ou tabela, não há resposta, status ou restrição de banco a provar. CA5 confere que a superfície não cresceu e CA1–CA4 provam o comportamento que muda sobre a superfície existente.

## Decisões

- `updateSession` passa a devolver `ApplySessionResult` (`{ ok, status?, code?, message? }`), o mesmo tipo de `applySessionChange`, em vez de `TrainingSession | null`. Motivo: CA2 exige o motivo da recusa na tela, e o retorno atual nunca é usado — o único consumidor (`training-plan/page.tsx`) descarta o valor e recarrega a semana.
- As três funções de escrita de sessão (`updateSession`, `applySessionChange`, `applySessionsBatch`) usam um único mapeador de erro em `training.ts`: `message` e `code` do servidor quando o corpo JSON os traz, e o fallback atual por status (`errorMessage`) quando não traz. Motivo: as três chamam o mesmo `PUT`, e duas extrações divergentes repetiriam o defeito que a tarefa corrige; o fallback preserva o risco registrado na spec ("corpo de erro não JSON").
- O client extrai apenas `message` e `code` do corpo de erro. Motivo: são os dois campos que a tela consome; os campos extras de `AGE_POLICY` (`recommendedMaxKm`, `disclaimer`) já chegam pela política de saúde e não têm consumidor no cliente.
- A recusa aparece como parágrafo dentro do `SessionCard`, com os tokens de erro do design system, e o estado é local ao cartão, zerado na tentativa seguinte e no sucesso. Motivo: CA2 pede "no próprio cartão da sessão" e CA5 proíbe componente novo.
- `onUpdated` só é chamado quando a edição é aceita. Motivo: CA2 pede não recarregar com estado divergente; após uma recusa, o refetch devolveria a mesma semana e apagaria a mensagem exibida.
- `plannedWeeklyKm` é a única fonte do total planejado nas duas telas, sem fallback que some as sessões no cliente; `null`/ausente vale `0`. Motivo: a spec §2.2 define o servidor como fonte única e o backend normaliza toda leitura (`LLD §8.1`); somar no cliente reintroduziria a divergência que a tarefa corrige.
- Plano e dashboard exibem o total em metros convertidos para km com o mesmo arredondamento (`toFixed(0)`). Motivo: CA4 pede o mesmo valor; arredondamentos diferentes produziriam números diferentes na mesma semana.
- O dashboard mantém `/analytics/weekly` como fonte do realizado e passa a rotulá-lo como realizado, com o planejado vindo de `plannedWeeklyKm`. Motivo: CA4 exige a separação explícita entre planejado e realizado.
- A edição de distância continua consultando `getHealthPolicy` e mantendo o diálogo de ciência antes do `PUT`. Motivo: a F01-T02 preserva `acknowledgeAgePolicy` apenas para distância; volume e qualidade são recusas duras que só o servidor avalia, e é para elas que a mensagem no cartão serve.
- A página do chat do coach não muda. Motivo: o `ProposalCard` já renderiza `errorMessage`, e `handleApply`/`handleApplyAll` já guardam `result.message`; a mensagem real chega pela mudança em `training.ts` (CA3).
- O rascunho do campo de edição (`EditableField`) continua com o valor tentado depois de uma recusa, como hoje. Motivo: ele não altera a semana exibida nem o dado gravado, e sincronizá-lo é comportamento fora do escopo da tarefa.
- CA1 é revisão humana. Motivo: o frontend não tem runner de teste (`.opencode/rules/tests.md`) e a spec §8 não prevê suíte nova; o comportamento observável do client é coberto pelos roteiros de CA2 e CA3, e o fallback de corpo não JSON só se prova por leitura do diff.

## Arquivos e interfaces

- `veltra-frontend/src/lib/api/client.ts`: `ApiError` passa a ser exportado e ganha `code?: string`; `request` lê o corpo JSON do erro uma vez, extrai `message` e `code` quando são texto e mantém `status` + `statusText` quando o corpo não é JSON.
- `veltra-frontend/src/lib/api/training.ts`: `updateSession(planId, sessionId, data)` passa a devolver `Promise<ApplySessionResult>`; `applySessionChange` e `applySessionsBatch` passam a propagar `message` e `code` do servidor; um mapeador interno único substitui as duas extrações atuais.
- `veltra-frontend/src/app/(authenticated)/training-plan/page.tsx`: `SessionCard` ganha o estado da recusa e o parágrafo de erro no cartão; `handleSaveDistance` e `handleSavePace` recarregam a semana apenas quando `ok`; o cabeçalho da semana troca a soma das sessões por `plan.plannedWeeklyKm`.
- `veltra-frontend/src/app/(authenticated)/dashboard/page.tsx`: o planejado passa a vir de `plan.plannedWeeklyKm`; o número de `/analytics/weekly` fica rotulado como realizado.
- Sem mudança: `veltra-frontend/src/app/(authenticated)/coach/chat/page.tsx`, `veltra-frontend/src/lib/api/types.ts`, `veltra-frontend/src/lib/format.ts`, `src/components/ui` e a sidebar.

## Testes existentes que mudam

Nenhum. O frontend não tem suíte de teste; o backend desta tarefa não é tocado, e os specs de `training-plans` e `activity-matcher` que provam as recusas continuam iguais.

## Mudança de dados

Nenhuma. Sem seed, backfill ou migration; a tarefa só muda leitura e apresentação.

## Documentos atualizados

- `docs/lld.md`, §2 "Convenções transversais", linha "Erros de regra": o client passa a ler o corpo JSON uma vez e a propagar `{ status, message, code }`, com fallback `status`/`statusText` quando o corpo não é JSON.
- `docs/lld.md`, §17.3 "Client HTTP": formato do erro lançado, leitura única do corpo, fallback e registro de que `updateSession`, `applySessionChange` e `applySessionsBatch` devolvem `{ ok, status?, code?, message? }` com a mensagem do servidor.
- `docs/lld.md`, §17.6 "Páginas e dados": plano e dashboard usam `plannedWeeklyKm` como total planejado, o realizado do dashboard continua vindo de `/analytics/weekly` e rotulado como realizado, e a recusa de edição aparece no cartão da sessão e no cartão da proposta do coach.
- `docs/lld.md`, §20 "Lacunas e cuidados conhecidos": remoção da lacuna resolvida "Código de erro no frontend".
- `docs/hld.md`: sem mudança — nenhuma rota, campo ou invariante novo, conforme a ADR-0001.
