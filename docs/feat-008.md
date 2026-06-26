# feat-008 — Registro de Exercícios via Chat

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-007

---

## Objetivo

Implementar a interpretação de comandos de treino em linguagem natural do usuário (texto ou fala transcrita) usando o SDK `@google/genai` (Gemini API) com guardrails de calistenia, exibindo um fluxo de confirmação e salvando o treino em um banco de dados local IndexedDB (via Dexie.js).

---

## O que foi implementado

- **Conexão com Google Gen AI SDK**: Integração do serviço de processamento na nuvem `parseUserMessage` usando a biblioteca `@google/genai` e suporte ao modelo selecionado pelo usuário (como `gemini-3-flash-preview` por padrão).
- **Banco de Dados Local (IndexedDB)**: Modelagem e criação do banco de dados IndexedDB em `src/db/db.ts` utilizando Dexie.js, contendo as tabelas `historico_treinos` e `plano_ativo`.
- **Parser Estruturado JSON**: Instruções de sistema para guiar a LLM a retornar exclusivamente objetos JSON com a flag `isWorkout`, o array de exercícios catalogados (séries, repetições, observação) e a flag `isCalisthenics`.
- **Fluxo de Confirmação Rápido**: Interface contendo botões "Confirmar 👍" e "Cancelar 👎" que aparecem dinamicamente após o bot entender um treino.
- **Regras de Negócio Implementadas**:
  * **RN-002**: Agrupamento automático de treinos no mesmo dia sob a mesma sessão.
  * **RN-005**: Guardrail de calistenia que recusa responder perguntas fora do escopo do esporte, enviando mensagem educada padrão.
- **Tratamento de Erros e Offline**:
  * Exibe notificação de ausência de rede se `navigator.onLine` for falso.
  * Exibe mensagem detalhada para erros de API Key inválida.
- **Garantia de Testabilidade**: Testes mockados sem depender de conectividade com a internet.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/db/db.ts` | criado | Configuração do banco IndexedDB e tabelas |
| `src/services/gemini.ts` | criado | Lógica de chamada ao SDK e prompt de sistema do Gemini |
| `src/components/ChatWindow.tsx` | modificado | Inclusão dos botões de confirmação rápida e prop types |
| `src/index.css` | modificado | Estilização dos botões de ação e centralização de layouts |
| `src/App.tsx` | modificado | Lógica principal de roteamento de fluxos de chat, chamada de API e Dexie |
| `src/test/App.test.tsx` | modificado | Testes integrados cobrindo Dexie DB, guardrails e tratamentos de erro |

---

## Decisões técnicas

- **Vitest Mocks Hoisted**: Para evitar problemas de hoisting em módulos ES na fase de testes, o mock do SDK do Gemini foi definido usando `vi.hoisted` e uma estrutura de `class` ES6, resolvendo problemas de construtores em chamadas `new`.
- **Banco em Memória fake-indexeddb**: Adicionamos `fake-indexeddb/auto` ao `setup.ts` do Vitest para que o Dexie.js consiga interagir com um banco de dados em memória e possamos testar as asserções de persistência no histórico de treinos.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| sucesso na interpretação e gravação no Dexie | `App.test.tsx` | ✅ pass |
| cancelamento e descarte de dados do treino | `App.test.tsx` | ✅ pass |
| acionamento do guardrail de domínio (não calistenia) | `App.test.tsx` | ✅ pass |
| tratamento de erro de API Key inválida | `App.test.tsx` | ✅ pass |
| tratamento de erro offline (sem internet) | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
=== npm run lint ===
Found 0 warnings and 0 errors.

=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/App.test.tsx (10 tests) 268ms
Test Files  1 passed (1) | Tests  10 passed (10)
=== Verification Complete ===
```

---

## Como usar / Notas para o próximo agente

- A lógica de criação de planos de exercícios (`feat-009`) usará o mesmo arquivo de banco de dados `src/db/db.ts` (tabela `plano_ativo`).
- Os testes rodam 100% offline devido aos mocks do Vitest e da injeção de `fake-indexeddb`.
