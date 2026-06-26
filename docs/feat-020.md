# feat-020 — Correção Conversacional de Operações e Reconhecimento de Datas no Registro de Treino

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-019

---

## Objetivo

> Permitir que o usuário faça correções em linguagem natural em treinos ou planos de treino pendentes de confirmação (confirmar/corrigir/cancelar) e que o bot reconheça automaticamente datas relativas (ex: "ontem") ou específicas nas mensagens para salvar os treinos na data correta do histórico.

---

## O que foi implementado

- **Fluxo de Correção Conversacional**:
  - Inserção do botão e da opção rápida **Corrigir** na listagem de quick options ao confirmar treinos ou planos.
  - Implementação do estado `isAwaitingCorrection` no `App.tsx` para guiar a correção após cliques em botões.
  - Tratamento de textos livres digitados durante a tela de confirmação (seja de treino ou plano) como solicitações diretas de correção.
  - Criação da função de reprocessamento `handleProcessCorrection` no [App.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/App.tsx) que encaminha as correções e o objeto original pendente ao Gemini API para aplicação das modificações na estrutura JSON.
- **Detecção Inteligente de Datas**:
  - Estreitamento da instrução do sistema (`systemInstruction`) no [gemini.ts](file:///home/lucas/github/trabalho-g2-ai1/src/services/gemini.ts) para calcular datas relativas como "ontem", "anteontem", "segunda-feira passada", etc., com base na data do dia atual injetada via contexto.
  - Retorno do campo opcional `data` no formato `YYYY-MM-DD` pelo Gemini API.
  - Adaptação das funções de gravação `handleConfirm` para salvar os treinos na data calculada no IndexedDB (Dexie). Por padrão, assume-se a data de hoje.

---

## Arquivos modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/services/gemini.ts` | modificado | Inclusão do campo `data` na interface e aprimoramento da `systemInstruction` para tratamento de data e diretrizes de correção. |
| `src/App.tsx` | modificado | Adição dos fluxos de correção conversacional, estados temporários e adaptação do salvamento com datas. |
| `src/test/App.test.tsx` | modificado | Inclusão de testes de integração para gravação com datas relativas e correção interativa. |
| `specs/requisitos.md` | modificado | Adicionados os requisitos funcionais RF-025 e RF-026. |
| `specs/projeto.md` | modificado | Adicionado suporte a correção conversacional e extração de datas no escopo do projeto. |
| `specs/criterios-aceite.md` | modificado | Adicionados critérios de aceite para a feature. |
| `feature_list.json` | modificado | Feature feat-020 marcada como `completed`. |
| `progress.md` | modificado | Log de progresso da sessão atualizado e limpo. |

---

## Decisões técnicas

- **Migração do Fluxo por Passos (`confirm_plan`)**: Se o usuário estiver no painel interativo de criação de planos por botões (`confirm_plan`) e quiser corrigir, o app migra o plano gerado para o estado de IA pendente (`pendingIAPlan`), permitindo que a IA aplique a correção de forma livre por texto, o que unifica e simplifica drasticamente a arquitetura de correção conversacional.
- **FormatDate no Chat**: Criada a função `formatDate` no `App.tsx` para apresentar a data recalculada no formato amigável brasileiro (DD/MM/AAAA) no cabeçalho de confirmação do treino (ex: "para o dia 25/06/2026").

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| parses workout with a specific date and saves to that date in IndexedDB | `App.test.tsx` | ✅ pass |
| allows the user to correct a workout before confirming | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
$ ./init.sh
=== Harness Initialization ===
=== npm install ===
up to date, audited 163 packages in 521ms
=== npm run lint ===
Found 0 warnings and 0 errors.
=== npm run typecheck ===
(sem erros)
=== npm test ===
✓ src/test/gemini.test.ts (8 tests)
✓ src/test/MarkdownRenderer.test.tsx (7 tests)
✓ src/test/App.test.tsx (27 tests)
Test Files  3 passed | Tests  42 passed
=== Verification Complete ===
```

---

## Como usar / Notas para o próximo agente

> A IA é plenamente capaz de aplicar correções complexas (ex: "mude barra para 5 séries de 12 e mude a data para anteontem") em um único turno, recalculando tanto os dados de exercício quanto a data correspondente.
