# feat-009 — Criação e Gestão do Plano de Exercícios

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-008

---

## Objetivo

Implementar um fluxo guiado interativo para a criação de um plano semanal personalizado de calistenia usando inteligência artificial (Gemini API) com persistência em IndexedDB, permitindo sua visualização a qualquer momento e confirmando antes de substituir planos existentes.

---

## O que foi implementado

- **Opções Rápidas Unificadas (`quickOptions`)**: Refatoração do componente `ChatWindow` para suportar botões de resposta rápida genéricos no rodapé da conversa, fornecendo facilidade de cliques nos tópicos da conversa.
- **Máquina de Estados de Fluxo de Plano**: Gerenciamento de etapas conversacionais localmente (`level` -> `days` -> `goal` -> `confirm_plan`), garantindo robustez de dados.
- **Integração com Gemini API**: Geração de planos de exercícios estruturados em JSON através de instruções de sistema estritas em `generateCalisthenicsPlan`.
- **Persistência IndexedDB (Dexie.js)**: Armazenamento e atualização de dados estruturados do plano na tabela `plano_ativo`.
- **Regra de Negócio RN-001 (Um plano ativo por vez)**: Confirmação de substituição de plano ativo caso o usuário tente iniciar uma nova criação com plano existente.
- **Comandos de Chat**: Processamento dos comandos `"ver meu plano"` (exibe plano atual com dias e exercícios) e `"criar plano"` (inicia o fluxo de perguntas).
- **Testes de Integração**: Quatro novas suítes de teste cobrindo a máquina de estados, persistência, visualização e substituição de plano.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/ChatWindow.tsx` | modificado | Substituição de botões fixos de treino por botões dinâmicos de `quickOptions` |
| `src/index.css` | modificado | Estilização das classes `.quick-options-container` e `.quick-option-btn` com estilo neon e transições suaves |
| `src/App.tsx` | modificado | Lógica conversacional, integração com Dexie DB para planos, comandos e API Gemini |
| `src/test/App.test.tsx` | modificado | Novas suítes de teste de integração para o plano e atualização dos seletores de botões |
| `docs/feat-009.md` | criado | Esta documentação |

---

## Decisões técnicas

- **Seleções Guiadas Controladas**: Decidimos gerenciar as respostas de perguntas (nível, dias, objetivo) por meio de estados locais no React, em vez de enviar textos livres e interpretá-los a cada turno usando a IA. Isso economiza chamadas de rede/tokens e evita erros de parser, acionando o Gemini apenas ao final para a geração consolidada.
- **Opções Rápidas na UI (`quickOptions`)**: Substituímos os callbacks `onConfirm` e `onCancel` específicos do `ChatWindow` por um array geral de strings. Ao clicar em uma opção, a mensagem é enviada ao chat. Isso simplificou a interface do componente e permitiu seu reuso nas perguntas de treino e nas etapas do plano de exercícios.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| Início automático ao abrir sem plano | `App.test.tsx` | ✅ pass |
| Criação de plano guiado até IndexedDB | `App.test.tsx` | ✅ pass |
| Exibição do plano ativo via comando | `App.test.tsx` | ✅ pass |
| Confirmação de substituição de plano existente | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
=== npm run lint ===
Found 0 warnings and 0 errors.

=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/App.test.tsx (14 tests) 576ms
   ✓ CalisBot App & Components (14)
     ✓ starts guided plan creation by asking for level if no active plan exists on mount 116ms
     ✓ completes guided plan creation flow and saves to IndexedDB 146ms
     ✓ displays active plan when command ver meu plano is sent 11ms
     ✓ confirms plan replacement when creating a new plan over an active one 21ms
Test Files  1 passed (1) | Tests  14 passed (14)
```

---

## Como usar / Notas para o próximo agente

- Para forçar a criação de um plano novo no console de desenvolvimento, pode ser digitada a palavra-chave `"criar plano"` ou `"novo plano"`.
- O comando `"ver meu plano"` busca a listagem do plano ativo formatada.
- O linter do projeto é executado com `oxlint`. Certifique-se de manter zero erros nas próximas features (`feat-010`).
