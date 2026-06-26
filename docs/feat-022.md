# feat-022 — Foco em Exercícios sem Equipamentos na Criação de Planos

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-021

---

## Objetivo

> Garantir que o início do fluxo de criação de planos de treino de calistenia no CalisBot (tanto o guiado interativo quanto o processamento livre por chat) foque estritamente em exercícios que utilizam o peso corporal e que não exigem equipamentos de academia ou pesos complexos.

---

## O que foi implementado

- **Avisos da Interface de Usuário**:
  - Ajustada a mensagem inicial de boas-vindas do chatbot em [App.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/App.tsx) quando não há plano ativo: explicita a criação de um plano focado em exercícios com peso corporal e sem equipamentos.
  - Ajustada a mensagem de criação de plano guiado para frisar o foco exclusivo em treinos sem equipamentos.
  - Ajustada a mensagem de transição pós-substituição de plano para ressaltar a elaboração de planos sem equipamentos.
- **Instruções do Prompt do Gemini**:
  - Atualizada a `systemInstruction` em `generateCalisthenicsPlan` no arquivo [gemini.ts](file:///home/lucas/github/trabalho-g2-ai1/src/services/gemini.ts) com REGRAS CRÍTICAS de que o plano gerado é 100% livre de equipamentos complexos e pesos externos, autorizando apenas o uso de barras fixas e paralelas públicas de calistenia.
  - Atualizado o prompt do Gemini em `parseUserMessage` para aplicar o mesmo guardrail e foco em treinos sem equipamentos quando o usuário pedir para criar/editar planos via mensagens livres no chat.
- **Testes de Integração**:
  - Atualizado o teste de montagem inicial e substituição de plano em `App.test.tsx` com as expectativas textuais corretas.
  - Criado o teste de integração `'emphasizes equipment-free workouts in the plan creation flow and prompt'` em `App.test.tsx` validando que as mensagens mostram as menções a sem equipamentos e que os prompts da API do Gemini exigem explicitamente essa regra de peso corporal.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/App.tsx` | modificado | Atualizadas as mensagens de criação de plano para informar que são focadas em peso corporal e sem equipamentos. |
| `src/services/gemini.ts` | modificado | Incluído aviso explícito ao Gemini em `generateCalisthenicsPlan` e `parseUserMessage` para que gere treinos calistênicos estritamente livres de pesos e aparelhos de academia. |
| `src/test/App.test.tsx` | modificado | Ajustada a expectativa de mensagens antigas, adicionado hook de abertura de banco Dexie no `beforeEach` e criado teste de validação do fluxo/prompt sem equipamentos. |
| `specs/requisitos.md` | modificado | Adicionado requisito funcional `RF-029` detalhando o foco em treinos corporais livres. |
| `specs/projeto.md` | modificado | Atualizado o escopo do projeto com a restrição de treinos sem equipamentos. |
| `specs/criterios-aceite.md` | modificado | Inclusão dos critérios de aceitação para a feature `feat-022`. |
| `feature_list.json` | modificado | Adicionada e marcada a feature `feat-022` como `completed`. |
| `progress.md` | modificado | Log de progresso atualizado. |

---

## Decisões técnicas

- **Segurança nos Testes com Banco Fechado**: No `beforeEach` de `App.test.tsx`, adicionamos uma verificação se a conexão com o Dexie está aberta (`if (!db.isOpen()) { await db.open() }`). Isso previne que o teste de reset da feature anterior feche a base de dados de forma definitiva, impedindo erros de `DatabaseClosedError` nos testes posteriores.
- **Equipamentos Urbanos Básicos**: Definimos explicitamente ao Gemini que barras fixas urbanas e paralelas (para pull ups e dips) continuam sendo aceitas nos planos de treino gerados, pois são componentes fundamentais e universais da infraestrutura de calistenia pública.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| emphasizes equipment-free workouts in the plan creation flow and prompt | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
=== npm run lint ===
Found 0 warnings and 0 errors.

=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/gemini.test.ts (8 tests)
✓ src/test/MarkdownRenderer.test.tsx (7 tests)
✓ src/test/App.test.tsx (29 tests)
Test Files  3 passed | Tests  44 passed
=== Verification Complete ===
```

---

## Como usar / Notas para o próximo agente

> Se novos exercícios forem adicionados ao catálogo de mapeamento no interpretador do Gemini, eles devem obedecer ao foco estrito de calistenia corporais sem equipamentos de musculação tradicionais.
