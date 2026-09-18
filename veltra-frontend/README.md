# Veltra — Frontend

Aplicação **Next.js 15 + React 19** do Veltra: painel de treinos, conquistas, análises e coach com IA integrado ao Strava.

> Documentação completa (funcionalidades, stack, design system, estrutura e integração com a API) no **[README da raiz](../README.md)**.

## Quick start

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" > .env.local
npm run dev
```

A aplicação fica em [http://localhost:3000](http://localhost:3000) e depende do [backend](https://github.com/Gianneves/veltra-backend) rodando na porta `3001`.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com Turbopack |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção (após o build) |
| `npx tsc --noEmit` | Checagem de tipos (o projeto não possui ESLint configurado) |

## Organização

- `src/app/(authenticated)/` — páginas protegidas (dashboard, atividades, plano, meta, análises, comparação, conquistas e coach).
- `src/components/ui/` — componentes do design system.
- `src/lib/api/` — client HTTP (cookies + camelCase automático) e módulos por domínio.
- `src/lib/` — helpers compartilhados de formatação e exibição de treinos/conquistas.
