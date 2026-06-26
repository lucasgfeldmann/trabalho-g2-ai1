# feat-021 — Novos Modelos Gemini e Botão de Reset Completo

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-020

---

## Objetivo

> Disponibilizar os novos modelos do Gemini (`gemini-3.5-flash`, `gemini-3.1-flash-lite`, `gemini-3-flash-preview`, `gemini-flash-lite-latest`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`) no painel de configurações e criar um botão de reset total para apagar de forma definitiva todos os dados do aplicativo armazenados no navegador (localStorage, IndexedDB e recarregar a aplicação).

---

## O que foi implementado

- **Novos Modelos Gemini**:
  - Inserção dos 5 novos modelos oficiais solicitados no select do [SettingsPanel](file:///home/lucas/github/trabalho-g2-ai1/src/components/SettingsPanel.tsx).
  - Preservação dos modelos legados (`gemini-1.5-flash` e `gemini-1.5-pro`) para manter a compatibilidade com a suite de testes existente.
- **Botão de Reset Completo da Aplicação**:
  - Criação de uma seção de perigo `"danger-zone-settings"` com estilo visual premium (borda e fundo vermelho transparente com texto em destaque).
  - Implementação da função assíncrona `handleResetApp` que limpa o `localStorage`, deleta o banco de dados IndexedDB do Dexie (`db.delete()`) e recarrega a página de forma limpa (`window.location.reload()`) após confirmação explícita do usuário.
  - Estilização de hover neon vermelho do botão no final do arquivo de estilos gerais [index.css](file:///home/lucas/github/trabalho-g2-ai1/src/index.css).

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/SettingsPanel.tsx` | modificado | Adicionado select atualizado com novos modelos, importação do IndexedDB e botão de reset. |
| `src/index.css` | modificado | Inclusão do estilo de hover neon vermelho (`.danger-btn:hover`). |
| `src/test/App.test.tsx` | modificado | Adicionado teste de integração validando os modelos e a limpeza/recarregamento da página. |
| `specs/requisitos.md` | modificado | Adicionados os requisitos funcionais RF-027 e RF-028. |
| `specs/projeto.md` | modificado | Adicionadas as novas capacidades no escopo do projeto. |
| `specs/criterios-aceite.md` | modificado | Registrados os critérios de aceitação para novos modelos e reset. |
| `feature_list.json` | modificado | Feature feat-021 marcada como `completed`. |
| `progress.md` | modificado | Log de progresso atualizado e evidências atualizadas para 43 testes. |

---

## Decisões técnicas

- **Preservação de Compatibilidade**: Mantivemos os modelos antigos no select para evitar a quebra dos testes de integração anteriores que exercitam a alteração e salvamento do modelo `gemini-1.5-pro`.
- **Prevenção de Race Conditions no Reset**: O reset executa a limpeza e recarregamento da página apenas após o término da Promise de deleção do banco IndexedDB (`await db.delete()`), impedindo dados órfãos ou inconsistências causadas pelo recarregamento precoce do browser.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| displays the new Gemini models and handles app reset in settings modal | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
$ ./init.sh
=== Harness Initialization ===
=== npm install ===
up to date, audited 163 packages in 498ms
=== npm run lint ===
Found 0 warnings and 0 errors.
=== npm run typecheck ===
(sem erros)
=== npm test ===
✓ src/test/gemini.test.ts (8 tests)
✓ src/test/MarkdownRenderer.test.tsx (7 tests)
✓ src/test/App.test.tsx (28 tests)
Test Files  3 passed | Tests  43 passed
=== Verification Complete ===
```

---

## Como usar / Notas para o próximo agente

> O botão de reset solicita uma confirmação nativa (`window.confirm`). Em testes de integração, essa função deve ser mockada (ex: `window.confirm = vi.fn(() => true)`) para permitir a limpeza automática.
