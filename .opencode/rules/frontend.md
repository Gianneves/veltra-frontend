# Rules — Frontend (`veltra-frontend`)

> Vale para todo arquivo em `veltra-frontend/src/`. Tokens e componentes estão no
> [design system](../../docs/design-system.md).

## Dados e contrato

- Todo acesso à API passa por `src/lib/api/client.ts`; ele converte `snake_case` → `camelCase`.
  Tipos de resposta ficam em `src/lib/api/types.ts` e são derivados do contrato real.
- Páginas são client components e buscam dados em `useEffect` com flag `active` para não atualizar
  depois do unmount.
- Toda tela trata carregamento, vazio e erro. Estado vazio explica o que fazer, não só "sem dados".
- Não há Server Actions nem fetch em Server Component no estado atual; não introduza um padrão novo
  sem decisão registrada.

## Interface

- Textos em pt-BR, no vocabulário do [GLOSSARY.md](../../GLOSSARY.md).
- Use os tokens de `src/app/globals.css` (`surface-*`, `on-surface*`, `primary*`); nenhuma cor
  literal no componente.
- Fontes: `font-sora` para títulos e números de destaque, `font-geist` para corpo.
- Reutilize `src/lib/training-display.ts` (`typeColors`, `typeLabels`, `typeIcons`, `DAY_ORDER`),
  `src/lib/achievement-display.ts` e os helpers de `src/lib/format.ts` em vez de duplicar.
- Componentes visuais novos entram em `src/components/ui` e são reutilizáveis; componente de uma
  tela só fica fora de `ui` quando não tem uso geral.
- Página nova segue o [LLD §19.3](../../docs/lld.md): rota em `(authenticated)`, dados em `useEffect`,
  estados tratados e item na sidebar.

## Autenticação

- Sessão via cookie httpOnly gerenciado pelo backend; o frontend usa `AuthProvider` e o `AuthGuard`
  do layout autenticado, que redireciona para `/login` quando não há sessão.
- Nunca guarde token em `localStorage`, `sessionStorage` ou estado global persistido.
- Chamadas autenticadas usam `credentials: "include"`.

## Verificação

| Comando | Quando |
|---|---|
| `npx tsc --noEmit` | Sempre, antes de entregar. |

- Não rode `npm run lint`: não há ESLint configurado e `next lint` é interativo.
- Nunca rode `next build` no diretório real com o dev server ativo: sobrescreve `.next`. Para
  validar build, copie o projeto para `/tmp/opencode` com `node_modules` simbólico.
- Não inicie nem encerre o dev server sem pedido explícito.
