# Rules — Testes

> Vale para specs, testes de integração e roteiros manuais. Os comandos de cada projeto estão em
> `backend.md` e `frontend.md`; a configuração está no [LLD §18](../../docs/lld.md).

## Onde testar

- Prefira o ponto de teste mais alto que já existe: service ou rota, não função interna.
- Quanto menos pontos de teste no código, melhor; o número ideal é um por comportamento.
- Só crie um ponto novo quando o existente não alcançar o comportamento, e proponha-o no ponto mais
  alto possível.
- Lógica pura sem I/O — cálculo de pace, fase, volume, política de idade, pareamento, parsing de
  proposta — é testada direto, sem banco nem rede.

## Backend

- Jest com `rootDir: src`, `testRegex: .*\.spec\.ts$` e mapeamento `^src/(.*)$`; o spec fica ao lado
  do arquivo que testa (`training-plans/volume-adjustment.service.spec.ts`).
- Nome do teste descreve o comportamento observável, não o método (`reduz o volume quando passa do
  limite por idade`).
- Não dependa de Postgres, Redis, Strava ou OpenAI: use mock ou dublê. Teste que precisa de serviço
  externo não entra na suíte padrão.
- As quatro suítes com falha de DI conhecida não são referência de qualidade: não copie o padrão
  delas nem as conserte sem pedido.
- Rode `npx jest <paths>` nos specs tocados; `npm test` só quando a mudança justificar a suíte
  inteira.

## Frontend

- Não há runner de teste configurado no frontend. Não introduza um sem decisão registrada.
- O que precisa de prova no frontend vira roteiro manual na spec, com passos e resultado esperado.
- `npx tsc --noEmit` é a verificação automática mínima.

## Critérios de aceite

- Todo critério de aceite da tarefa tem um teste previsto, ou um passo de roteiro manual quando não
  houver ponto de teste.
- Critério sem prova possível é decisão em aberto, não critério aprovado.
- Teste que só verifica detalhe de implementação (chamada de método interno, formato de log) não
  prova critério.
