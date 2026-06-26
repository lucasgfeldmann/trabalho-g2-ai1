# feat-023 — Bloqueio de Texto e Voz na Seleção do Plano Guiado

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-022

---

## Objetivo

> Bloquear/desabilitar a inserção de texto no chat e o botão de áudio/voz (microfone) durante as etapas obrigatórias de seleção de opções no fluxo guiado de criação de plano (nível, dias, objetivo e substituição de plano existente), obrigando o usuário a escolher uma das opções predefinidas das quick options do chatbot.

---

## O que foi implementado

- **Bloqueio Condicional do ChatWindow**:
  - Adicionada a prop opcional `disableTextInput` em [ChatWindow.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/components/ChatWindow.tsx).
  - Quando ativa (`true`), o campo de texto fica desabilitado (`disabled`), o placeholder muda para `"Selecione uma das opções acima para prosseguir..."` e os botões de voz (microfone) e envio também ficam desabilitados.
- **Gerenciamento do Estado no App**:
  - Definido o booleano `isTextInputDisabled` em [App.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/App.tsx) verificando se o passo atual do fluxo (`planFlow.step`) pertence às etapas obrigatórias de escolha predefinidas: `['level', 'days', 'goal', 'confirm_replace']`.
  - Passada a variável como prop `disableTextInput` para o componente `<ChatWindow ... />`.
- **Suite de Testes de Integração**:
  - Criado o teste de integração `'disables text input and mic during guided plan creation steps, and reenables on completion/confirmation step'` em [App.test.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/test/App.test.tsx).
  - O teste valida que os inputs começam desabilitados nas escolhas obrigatórias e são reabilitados com sucesso no passo de confirmação final do plano (`confirm_plan`) para permitir correções conversacionais.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/ChatWindow.tsx` | modificado | Atualizado formulário e inputs para suportar a prop `disableTextInput` e desabilitar os controles. |
| `src/App.tsx` | modificado | Injetado controle de bloqueio baseado em `planFlow.step` e transmitido à janela de chat. |
| `src/test/App.test.tsx` | modificado | Adicionado teste de integração simulando o bloqueio nos passos e reabertura de inputs no final. |
| `specs/requisitos.md` | modificado | Adicionado requisito funcional `RF-030` cobrindo o bloqueio de entradas no fluxo guiado. |
| `specs/projeto.md` | modificado | Atualizado escopo do projeto com a regra de bloqueio de texto/voz. |
| `specs/criterios-aceite.md` | modificado | Inclusão de critérios de aceitação específicos para a feature `feat-023`. |
| `feature_list.json` | modificado | Atualizado status da feature `feat-023` para `completed`. |
| `progress.md` | modificado | Log de progresso da sessão atualizado com sucesso. |

---

## Decisões técnicas

- **Liberação para Correções**: No passo `confirm_plan` (confirmação final do plano), o usuário tem a opção de confirmar, cancelar ou corrigir. Como a correção do plano aceita entrada em linguagem natural de forma livre (ex: "mude barra para 4 séries"), a digitação e a gravação de voz não devem ser desabilitadas nessa etapa.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| disables text input and mic during guided plan creation steps, and reenables on completion/confirmation step | `App.test.tsx` | ✅ pass |

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
✓ src/test/App.test.tsx (30 tests)
Test Files  3 passed | Tests  45 passed
=== Verification Complete ===
```

---

## Como usar / Notas para o próximo agente

> Se outras partes guiadas forem acrescentadas (ex: perguntas sobre lesões), certifique-se de incluir a chave do passo na lista `isTextInputDisabled` do `App.tsx` caso queira manter o input travado.
