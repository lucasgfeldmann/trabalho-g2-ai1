# feat-019 — Modos de Visualização no Histórico (Tabela e Cards)

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-018

---

## Objetivo

> Adicionar suporte a dois modos de visualização na aba de Histórico de exercícios: uma visualização tradicional em tabela e uma visualização em formato de cartões (cards) otimizada para smartphones e telas menores, melhorando a experiência mobile do usuário.

---

## O que foi implementado

- Adição do estado `viewMode` (`'table' | 'cards'`) no componente [HistoryPanel](file:///home/lucas/github/trabalho-g2-ai1/src/components/HistoryPanel.tsx).
- Inserção de controles visuais (botões de alternância "📊 Tabela" e "📇 Cards (Celular)") na interface do histórico.
- Renderização condicional da listagem de exercícios:
  - **Tabela**: Mantém a tabela HTML estruturada com colunas Data/Hora, Exercício, Séries, Repetições e Observações.
  - **Cards**: Renderiza cada exercício realizado em um cartão estilizado individual, com destaque para o nome do exercício e informações estruturadas verticalmente.
- Estilos CSS responsivos integrados que seguem o design dark e neon do app.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/HistoryPanel.tsx` | modificado | Implementação dos controles e da renderização condicional dos cartões. |
| `src/test/App.test.tsx` | modificado | Adição do teste de integração cobrindo a alternância de modos e visualização. |
| `feature_list.json` | modificado | Marcação do status da feature como `completed`. |
| `progress.md` | modificado | Atualização do log de progresso da sessão. |

---

## Decisões técnicas

- **Modo Tabela como Padrão**: O modo de visualização inicial foi definido como `'table'` para preservar a compatibilidade retroativa e não quebrar testes de integração legados que dependem da contagem imediata de linhas e colunas HTML.
- **Layout de Cards com Glassmorphism**: Os cards foram estilizados utilizando fundo semitransparente, sombras suaves e borda sutil (`rgba(30, 41, 59, 0.4)` e `var(--border-color)`), alinhados perfeitamente com a paleta de cores escura e neon já existente.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| Alternância de modos no histórico | `src/test/App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
$ ./init.sh
=== Harness Initialization ===
=== npm install ===
up to date, audited 163 packages in 506ms
=== npm run lint ===
Found 0 warnings and 0 errors.
=== npm run typecheck ===
(sem erros)
=== npm test ===
✓ src/test/gemini.test.ts (8 tests)
✓ src/test/MarkdownRenderer.test.tsx (7 tests)
✓ src/test/App.test.tsx (25 tests)
Test Files  3 passed | Tests  40 passed
=== Verification Complete ===
```

---

## Como usar / Notas para o próximo agente

> Os botões de alternância só aparecem se houver exercícios registrados no banco de dados para o dia ou filtro selecionado. Para testar manualmente, registre um exercício no chat e navegue até a aba Histórico para alternar entre Tabela e Cards.
