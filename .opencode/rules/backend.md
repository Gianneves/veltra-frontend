# Rules — Backend (`veltra-backend`)

> Vale para todo arquivo em `veltra-backend/src/`. As invariantes completas estão no
> [HLD §9](../../docs/hld.md); aqui ficam as regras de escrita de código que decorrem delas.

## Escopo e sessão

- Toda rota autenticada resolve o usuário por `AuthSessionService.resolveUserId(req)`; nenhuma
  outra porta de resolução é aceita.
- Toda query filtra por `user: { id: userId }` ou `userId`. Query sem filtro de usuário só existe em
  rota pública declarada (webhook) e precisa de comentário justificando.
- Módulo com ciclo de importação importa `SessionModule`, nunca `AuthModule`.

## Contrato e validação

- Banco e JSON em `snake_case`; o frontend converte para `camelCase`. Não devolva `camelCase` na
  API.
- Body e query validados por DTO com `class-validator`; `ValidationPipe` com `whitelist` e
  `forbidNonWhitelisted`.
- Erro de regra de negócio: `BadRequestException({ code, message, ... })` com `code` em
  `SCREAMING_SNAKE_CASE` (`AGE_POLICY`, `DAY_COLLISION`).
- Novas entidades usam UUID v7 gerado no `@BeforeInsert`; não use `@PrimaryGeneratedColumn`.
- Não logue token, segredo nem dado de saúde. Configuração vem de `ConfigService`, nunca de
  constante no código.

## Regras de domínio

- Sessão `rest` nunca é concluída e tem distância/pace zerados.
- "Próximo treino" ignora `rest`, usa `dayOrder` (Seg=0 … Dom=6) e avança para a semana seguinte
  quando não há treino na atual.
- `/analytics/weekly` considera apenas a semana atual, segunda a domingo, no horário local do
  servidor.
- Um dia por semana tem no máximo uma sessão; operações em lote são transacionais e rejeitam
  colisão.
- A IA não grava: ela devolve proposta, o service valida e a persistência exige ação do atleta.
- Limites de idade, volume e qualidade são aplicados no servidor, mesmo sem consentimento
  registrado.

## Extensão

Siga a receita correspondente do [LLD §19](../../docs/lld.md): novo endpoint (§19.1), nova entidade
(§19.2), nova regra de IA (§19.4). Rota nova também entra na tabela do HLD §8.

## Verificação

| Comando | Quando |
|---|---|
| `npx jest <paths>` | Specs tocados pela mudança. |
| `npx eslint <paths>` | Arquivos TS alterados. |
| `npm run build` | Antes de entregar. |
| `npm test` | Só quando a mudança justificar a suíte inteira. |

- Falhas de DI pré-existentes: `auth.service.spec`, `auth.controller.spec`, `users.service.spec`,
  `insights.service.spec`. Não corrija sem pedido explícito e não as use como desculpa para deixar
  um spec novo falhando.
- `npm run test:e2e` exige Postgres e Redis de pé; não é parte do CI.
- Não inicie nem encerre os containers `veltra_db` e `veltra_cache` sem pedido explícito.
- Produção não usa `DB_SYNCHRONIZE=1`; a mudança de schema precisa de migration.
