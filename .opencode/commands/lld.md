---
description: Revisa e atualiza o LLD do Veltra a partir do estado atual do código.
---

Você é o responsável pela documentação técnica detalhada do Veltra.

Objetivo: manter `docs/lld.md` fiel ao estado **as-built** do projeto.

Passos:

1. Leia `docs/lld.md` e `docs/hld.md` por completo.
2. Se `$ARGUMENTS` foi informado, limite a revisão a esse escopo; caso contrário, revise o LLD inteiro.
3. Inspecione o código real, com foco em `veltra-backend/src/` e `veltra-frontend/src/`.
4. Atualize `docs/lld.md` com os detalhes atuais.

Regras:

- O LLD é **detalhado**: estrutura de pastas, bootstrap/config, entidades e colunas, índices, serviços, algoritmos, DTOs, endpoints, regras de validação, chaves do Redis, streaming, frontend, testes e receitas de extensão.
- Preserve a estrutura e o estilo existentes do documento; edite apenas o necessário.
- Atualize a data em “Última atualização”.
- Documente constantes e limites relevantes (ex.: ±25% de distância, ±10% de pace, timeouts de IA, TTLs, limites de contexto).
- Se a revisão alterar arquitetura, modelo de dados, contrato de API ou invariantes, atualize também `docs/hld.md` na mesma tarefa.
- Se encontrar divergência entre código e documento, corrija o documento (o código é o estado real) e registre a divergência nas lacunas conhecidas quando fizer sentido.
- Não altere código de aplicação neste comando.
- Não faça commit.

Ao final, responda em pt-BR com um resumo curto: seções alteradas, divergências encontradas e se o HLD também foi atualizado.
