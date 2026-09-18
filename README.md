<div align="center">

# Veltra

**Plataforma inteligente de corrida que conecta seus dados do Strava a um coach com IA.**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Sobre

O **Veltra** é um app para corredores que sincroniza suas atividades do **Strava**, organiza seus treinos e usa **inteligência artificial** para analisar desempenho, acompanhar o plano e negociar ajustes de treino.

Este repositório contém o **frontend** da aplicação (Next.js 15 + App Router). A API é um backend NestJS com Postgres/Redis, disponível em [Gianneves/veltra-backend](https://github.com/Gianneves/veltra-backend).

## Funcionalidades

### Painel do corredor

- **Dashboard** com resumo da semana (distância, tempo e corridas), progresso semanal, próximo treino (ignorando dias de descanso e buscando a semana seguinte quando necessário), total de corridas e últimas atividades.
- **Atividades** sincronizadas do Strava, agrupadas por mês, com filtros por período/ano, paginação e detalhe completo (pace, duração, FC, elevação).
- **Plano de Treino** semanal com tipo, distância, pace e observações de cada sessão, status de conclusão e navegação entre semanas.
- **Minha Meta** com distância/data alvo, benchmark de 3 km, milestones e acompanhamento do ciclo.
- **Comparação** de duas corridas lado a lado.
- **Análises** com acumulados e gráficos de distância semanal, evolução de ritmo e distribuição de FC por zona.

### Coach com IA

- **Insight por corrida**: ao abrir uma atividade, o coach analisa pace, distância, tipo de treino e, quando há plano vinculado, o cumprimento (aderência) do que foi proposto — com resumo, desempenho, leitura do treino e dicas práticas.
- **Feed de insights** em `/coach/insights`, filtrável por aderência ao plano (“No plano”, “Próximo”, “Diferente”).
- **Chat com streaming** (SSE) em markdown, com histórico de conversas, contexto real do atleta (perfil, meta, plano de 3 semanas e corridas recentes).
- **Negociação de treino**: o coach pode propor mudanças em sessões futuras (dia, tipo, distância, pace, observações) com limites de segurança (±25% de distância, ±10% de pace). A proposta aparece como um card com diff e botões **Aplicar** ou **Descartar**.

### Conquistas e evolução

- **Troféus** com progresso e data de conquista (Primeiro Passo, Centenário, Maratonista, Consistente, Velocista).
- **Melhores tempos** estimados nas distâncias de 3, 5, 10, 15 km, meia maratona e maratona.
- **Previsões de tempo** por distância a partir da forma recente (projeção de Riegel), sempre com pace consistente entre distâncias.

### Conta

- Login via **Strava OAuth** (sessão httpOnly gerenciada pelo backend).
- Avatar do perfil Strava exibido na sidebar.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 + design system próprio (tokens semânticos) |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Markdown | react-markdown + remark-gfm |
| HTTP | Fetch API com client próprio (cookies de sessão + camelCase automático) |
| Autenticação | Strava OAuth via backend (cookie httpOnly `user_session`) |

## Design System

- Tokens de cor, raio e tipografia definidos em `src/app/globals.css` (`surface-*`, `on-surface*`, `primary*`, `error`, etc.).
- Fontes: **Sora** para títulos e **Geist** para corpo.
- Componentes reutilizáveis em `src/components/ui`:
  - `button`, `performance-card`, `data-display`, `stat-item`, `metric-chip`, `progress-bar`, `alert-dialog`, `insight-sections`.
- Helpers visuais compartilhados em `src/lib`: `format.ts` (pace, tempos, datas em pt-BR), `training-display.ts` (cores/labels/ícones dos tipos de treino) e `achievement-display.ts` (troféus, distâncias e progresso).

## Rodando localmente

### Pré-requisitos

- [Node.js](https://nodejs.org) 20+
- Backend do Veltra rodando em `http://localhost:3001` (veja [veltra-backend](https://github.com/Gianneves/veltra-backend))
- Credenciais do Strava configuradas no backend

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/Gianneves/veltra-frontend.git
cd veltra-frontend

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" > .env.local

# 4. Suba o servidor de desenvolvimento
npm run dev
```

A aplicação fica disponível em [http://localhost:3000](http://localhost:3000).

### Build de produção

```bash
npm run build
npm start
```

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API do backend (prefixo `/api/v1`) | `http://localhost:3001/api/v1` |

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com Turbopack |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção (após o build) |
| `npx tsc --noEmit` | Checagem de tipos (o projeto não possui ESLint configurado) |

## Estrutura do projeto

```
veltra-frontend/
├── public/images/                 # Logos, avatares e badges (SVG)
└── src/
    ├── app/
    │   ├── login/                 # Entrada com Strava
    │   └── (authenticated)/       # Rotas protegidas
    │       ├── dashboard/
    │       ├── activities/[id]/   # Lista e detalhe (com insight do coach)
    │       ├── training-plan/
    │       ├── goal/
    │       ├── analytics/
    │       ├── comparison/
    │       ├── achievements/
    │       └── coach/
    │           ├── chat/          # Chat com streaming e propostas
    │           └── insights/      # Feed de insights das corridas
    ├── components/
    │   ├── header.tsx
    │   ├── sidebar.tsx
    │   └── ui/                    # Design system
    ├── hooks/
    │   └── use-auth.tsx           # Contexto de autenticação
    └── lib/
        ├── api/                   # Client HTTP e módulos por domínio
        ├── format.ts
        ├── training-display.ts
        ├── achievement-display.ts
        └── utils.ts
```

## Integração com a API

- O client HTTP (`src/lib/api/client.ts`) centraliza as chamadas em `NEXT_PUBLIC_API_URL`, envia `credentials: "include"` (cookie de sessão) e converte automaticamente chaves `snake_case` da API para `camelCase`.
- Os tipos de resposta ficam em `src/lib/api/types.ts` e cada domínio tem seu módulo (`activities.ts`, `training.ts`, `insights.ts`, `coach.ts`, `achievements.ts`, `analytics.ts`, `goals.ts`).
- O chat do coach consome um endpoint SSE (`POST /coach/chat/stream`) com tokens incrementais e um evento final contendo mensagem e eventual proposta de mudança no plano.
- Páginas são client components que carregam dados em `useEffect`, com estados de carregamento, vazio e erro.

## Autor

Desenvolvido por **Gian Neves**.
