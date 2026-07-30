# Veltra Frontend

**Veltra** é uma plataforma inteligente de corrida que conecta atletas híbridos aos seus dados de performance via Strava, com insights gerados por IA.

Este repositório contém o frontend Next.js da aplicação.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS v4 + Design System próprio (classes semânticas)
- **Charts:** Recharts
- **Ícones:** Lucide React
- **Autenticação:** Strava OAuth via backend (sessão Redis + cookie httpOnly)
- **API:** Comunicação direta com REST API NestJS (porta 3001)

---

## Funcionalidades

- Dashboard com resumo semanal de treinos
- Histórico de atividades importadas do Strava
- Plano de treino semanal auto-gerado
- Metas de corrida com milestones automáticos
- Coach IA com memória conversacional (OpenAI)
- Insights inteligentes sobre performance e recuperação
- Conquistas e badges
- Comparação lado a lado de atividades
- Análises com gráficos de distância, ritmo e FC

---

## Getting Started

### Pré-requisitos

- Node.js v20+
- Backend rodando (veja [veltra-backend](https://github.com/Gianneves/veltra-backend))

### 1. Clone

```bash
git clone https://github.com/Gianneves/veltra-frontend.git
cd veltra-frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Copie o arquivo `.env.local.example` para `.env.local` e ajuste se necessário:

```bash
cp .env.local.example .env.local
```

### 4. Rode o frontend

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### 5. Build de produção

```bash
npm run build
npm start
```

---

## Estrutura do Projeto

```
src/
├── app/                    # Rotas (App Router)
│   └── (authenticated)/    # Páginas protegidas (dashboard, activities, etc.)
├── components/             # Componentes reutilizáveis
│   ├── header.tsx
│   └── ui/                 # Componentes de design (button, card, etc.)
├── hooks/                  # Hooks React
│   └── use-auth.tsx        # Contexto de autenticação
└── lib/
    ├── api/                # Client HTTP + módulos de API
    │   ├── client.ts
    │   ├── types.ts
    │   ├── activities.ts
    │   ├── training.ts
    │   ├── analytics.ts
    │   ├── goals.ts
    │   ├── achievements.ts
    │   ├── coach.ts
    │   └── mock.ts         # Dados mock (fallback)
    └── utils.ts
```

---

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL da API backend | `http://localhost:3001/api/v1` |

---

## Autor

Desenvolvido por **Gian Neves**.
