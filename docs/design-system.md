# Design System — Veltra

> **Status:** rascunho
> **Fontes:** `veltra-frontend/src/app/globals.css`, [LLD](./lld.md) §17.5, [AGENTS.md](../AGENTS.md)
> **Papel:** dono dos tokens, dos componentes visuais e das regras de interface. Specs de
> funcionalidade que tocam tela apontam para cá em vez de repetir cores e medidas.

---

## Princípios

- Textos de interface em pt-BR, no tom de treino (o que fazer), não de relatório (o que aconteceu).
- Tokens semânticos, nunca cor literal no componente.
- Toda tela trata carregamento, vazio e erro.
- Uma constante visual mora em um lugar só: se a tela precisa de cor, rótulo ou ícone de treino,
  importa de `lib/training-display.ts`.

---

## Tokens

Definidos em `veltra-frontend/src/app/globals.css`, no bloco `@theme`.

### Cores

| Grupo | Tokens |
|---|---|
| Primária | `primary` `#bb3619`, `primary-container` `#d43f00`, `on-primary`, `on-primary-container`, `primary-fixed`, `primary-fixed-dim`, `on-primary-fixed`, `on-primary-fixed-variant`, `inverse-primary` |
| Secundária | `secondary` `#565e74`, `secondary-container` `#dae2fd`, `on-secondary`, `on-secondary-container`, `secondary-fixed`, `secondary-fixed-dim`, `on-secondary-fixed`, `on-secondary-fixed-variant` |
| Terciária | `tertiary` `#4d5d73`, `tertiary-container` `#66768d`, `on-tertiary`, `on-tertiary-container`, `tertiary-fixed`, `tertiary-fixed-dim`, `on-tertiary-fixed`, `on-tertiary-fixed-variant` |
| Superfície | `surface` `#f7f9fb`, `surface-dim`, `surface-bright`, `surface-container-lowest` `#ffffff`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`, `surface-variant`, `on-surface` `#191c1e`, `on-surface-variant` `#5c4037`, `inverse-surface`, `inverse-on-surface` |
| Fundo | `background` `#f7f9fb`, `on-background` `#191c1e` |
| Erro | `error` `#ba1a1a`, `on-error`, `error-container` `#ffdad6`, `on-error-container` `#93000a` |
| Contorno | `outline` `#916f65`, `outline-variant` `#e6beb2`, `surface-tint` `#ae3200` |

Regra: use `surface-*` para fundo e camadas, `on-surface*` para texto e `primary*` para ação e
destaque. Não introduza cor fora dos tokens.

### Tipografia

| Token | Fonte | Uso |
|---|---|---|
| `font-sora` | Sora | Títulos, números de destaque |
| `font-geist` | Geist | Corpo, rótulos, tabelas |

### Raios

`radius-sm` `0.25rem`, `radius-md` `0.5rem`, `radius-lg` `0.75rem`, `radius-xl` `1rem`,
`radius-2xl` `1.5rem`, `radius-full` `9999px`.

### Espaçamento

`spacing-unit` `8px`, `spacing-gutter` `16px`, `spacing-card-gap` `24px`,
`spacing-container-margin-desktop` `40px`, `spacing-container-margin-mobile` `20px`.

---

## Componentes

Em `veltra-frontend/src/components/ui`:

| Componente | Papel |
|---|---|
| `button` | Ação primária, secundária e destrutiva. |
| `performance-card` | Cartão de destaque com métrica principal e contexto. |
| `data-display` | Valor com unidade e tamanho variável. |
| `stat-item` | Rótulo e valor em grade de estatísticas. |
| `metric-chip` | Métrica compacta em linha. |
| `progress-bar` | Progresso por segmentos, usado em meta e volume. |
| `alert-dialog` | Confirmação de ação destrutiva. |
| `insight-sections` | Renderiza o insight do coach em seções. |
| `health-alerts` | Lista de alertas de saúde e o aviso de consentimento. |

Componentes de estrutura ficam fora de `ui`: `sidebar`, `header` e o layout autenticado.

---

## Constantes visuais

| Arquivo | Conteúdo |
|---|---|
| `lib/training-display.ts` | `typeColors`, `typeLabels`, `typeIcons`, `DAY_ORDER` |
| `lib/achievement-display.ts` | Categorias, badges e progresso de conquista |
| `lib/format.ts` | Pace, tempo, distância, datas e números em pt-BR |

Cor, rótulo ou ícone de tipo de treino não se duplica em página: importa daqui.

---

## Regras

- Página nova segue o [LLD](./lld.md) §19.3 — client component, dados em `useEffect`, estados de
  carregamento, vazio e erro, item na sidebar.
- Texto de UI não expõe jargão técnico: "sessão", "atividade", "longão" e "qualidade" são os termos
  do [GLOSSARY.md](../GLOSSARY.md).
- Número, distância e pace sempre formatados por `lib/format.ts`.
- Alertas de saúde usam `health-alerts`, nunca um diálogo próprio.
- Contraste e área de toque seguem os tokens existentes; não crie variação pontual de cor para
  resolver um caso isolado.

---

## Questões em aberto

- [ ] Registrar os estados de foco, hover e desabilitado de cada componente; hoje eles vivem só no
      código.
- [ ] Definir os breakpoints oficiais e o comportamento de cada página em telas pequenas.
