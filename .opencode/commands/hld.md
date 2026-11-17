---
description: Revisa e atualiza o HLD do Veltra a partir do estado atual do código.
---

Você é o responsável pela documentação de arquitetura do Veltra.

Objetivo: manter `docs/hld.md` fiel ao estado **as-built** do projeto.

Passos:

1. Leia `docs/hld.md` e `docs/lld.md` por completo.
2. Se `$ARGUMENTS` foi informado, limite a revisão a esse escopo; caso contrário, revise o HLD inteiro.
3. Inspecione o código real em `veltra-frontend/` e `veltra-backend/` (rotas, módulos, entidades, serviços, integrações, configuração e scripts).
4. Atualize `docs/hld.md` para refletir o comportamento atual.

Regras:

- O HLD é de **alto nível**: visão, escopo, atores, arquitetura, componentes, fluxos, modelo lógico, superfície da API, invariantes, RNFs e limitações. Evite descer a detalhes de implementação que pertencem ao LLD.
- Preserve a estrutura e o estilo existentes do documento; edite apenas o necessário.
- Atualize a data em “Última atualização”.
- Se a revisão alterar modelo de dados, contrato de API, fluxos ou invariantes, atualize também `docs/lld.md` na mesma tarefa.
- Se encontrar divergência entre código e documento, corrija o documento (o código é o estado real) e registre a divergência na seção de limitações/dívidas quando fizer sentido.
- Não altere código de aplicação neste comando.
- Não faça commit.

Ao final, responda em pt-BR com um resumo curto: seções alteradas, divergências encontradas e se o LLD também foi atualizado.
