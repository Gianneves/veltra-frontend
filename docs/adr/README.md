# ADRs — Veltra

> **Status:** rascunho
> **Papel:** registrar as decisões que o [HLD](../hld.md) e o [LLD](../lld.md) não explicam, para
> que ninguém "corrija" de volta algo que foi escolhido de propósito.

---

## Índice

| ADR | Decisão | Status |
|---|---|---|
| [`ADR-0001`](./0001-technical-enabler-with-frozen-contract.md) | Enabler técnico entregue como funcionalidade, com contrato congelado | `accepted` |
| [`ADR-0002`](./0002-ai-annotations-are-not-plan-changes.md) | Anotação de IA não é mudança de plano | `accepted` |
| [`ADR-0003`](./0003-ai-provider-behind-a-port.md) | Fornecedor de IA atrás de uma porta, com alternativa e fallback automático | `accepted` |

---

## Quando criar uma ADR

Só quando as três condições valerem:

1. **Difícil de reverter** — mudar de ideia depois custa caro.
2. **Surpreendente sem contexto** — quem ler o código vai perguntar por que foi feito assim.
3. **Resultado de um trade-off real** — havia alternativas e uma foi escolhida por motivos
   específicos.

Se faltar uma das três, não crie: o LLD já descreve o como, e uma decisão óbvia não precisa de
registro.

## Formato

Arquivo `NNNN-slug-em-kebab-case.md`, numeração sequencial a partir de `0001`, sem reaproveitar
número. O conteúdo é curto:

```md
# Título curto da decisão

Uma a três frases: qual era o contexto, o que foi decidido e por quê.
```

Seções opcionais, só quando acrescentam valor: `Status` (`proposed`, `accepted`, `deprecated`,
`superseded by ADR-NNNN`), `Considered Options` e `Consequences`.

## Regras

- A ADR registra a decisão e o motivo, não o passo a passo da implementação.
- Decisão substituída não é apagada: ganha `Status: superseded by ADR-NNNN`.
- Specs e planos de tarefa citam a ADR pelo número (`ADR-0002`), não repetem o conteúdo.
- Mudança que afeta arquitetura, modelo de dados, contrato de API ou invariante continua exigindo
  atualização do HLD e do LLD na mesma tarefa; a ADR é para o porquê, não substitui os documentos.
