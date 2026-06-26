# feat-024 — Barra de Entrada de Chat Responsiva e Textarea Expansível

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-023

---

## Objetivo

> Substituir o campo de texto de linha única (input) da barra de chat por um campo multilinha expansível (textarea), permitindo que textos longos quebrem de linha e permaneçam totalmente visíveis para o usuário. Além disso, ajustar a responsividade do container da barra de chat no CSS (corrigindo overflow/transbordamento horizontal) para se adaptar de forma perfeita a displays de celulares pequenos (a partir de 320px+).

---

## O que foi implementado

- **Substituição de Input por Textarea**:
  - Trocado o elemento `<input type="text">` por um `<textarea>` em [ChatWindow.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/components/ChatWindow.tsx).
  - Adicionado suporte a `rows={1}` e estilo em linha com `resize: 'none'`, `height: 'auto'`, `minHeight: '44px'`, `maxHeight: '120px'` e `overflowY: 'auto'` para expandir a altura conforme o usuário digita.
  - Implementado interceptador de teclado `onKeyDown`: o pressionamento da tecla `Enter` (sem `Shift`) submete o formulário chamando `form.requestSubmit()`, enquanto `Shift + Enter` insere quebras de linha físicas.
- **Ajustes de Layout Responsivo (CSS)**:
  - Adicionado `box-sizing: border-box` nas classes `.chat-input-bar`, `.input-form` e `.chat-input` em [index.css](file:///home/lucas/github/trabalho-g2-ai1/src/index.css) para calcular paddings dentro do limite total de largura do container.
  - Configurado `min-width: 0` no flex item `.chat-input` em [index.css](file:///home/lucas/github/trabalho-g2-ai1/src/index.css) para permitir que o flex item encolha abaixo de sua largura implícita de placeholder e evite transbordamento (bug de estouro do Flexbox).
  - Alinhados os botões com `align-items: flex-end` no `.input-form` para que fiquem fixados no canto inferior conforme o textarea de chat cresce verticalmente.
  - Configurado `flex-shrink: 0` nos botões laterais (`.mic-btn`, `.send-btn`) para evitar distorções de tamanho em telas muito estreitas.
  - Criada uma media query para resoluções de até 360px de largura de tela (`@media (max-width: 360px)`) para compactar paddings, gaps e tamanhos de botões da barra.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/ChatWindow.tsx` | modificado | Substituição do input por textarea com auto-quebra de linha e interceptor de tecla Enter. |
| `src/index.css` | modificado | Adicionado box-sizing, min-width, flex-shrink, alinhamento flex-end e media query para dispositivos pequenos (320px). |
| `specs/requisitos.md` | modificado | Inclusão do requisito funcional `RF-031` cobrindo quebras de linha e responsividade da barra de entrada. |
| `specs/projeto.md` | modificado | Atualizado o escopo do projeto. |
| `specs/criterios-aceite.md` | modificado | Registrados os critérios de aceitação para a feature `feat-024`. |
| `feature_list.json` | modificado | Feature `feat-024` marcada como `completed`. |
| `progress.md` | modificado | Log de progresso atualizado. |

---

## Decisões técnicas

- **Uso do flex-shrink e min-width**: O transbordamento horizontal da barra de entrada ocorria devido ao comportamento padrão do CSS Flexbox, que não encolhe um campo flex abaixo da largura implícita de placeholders muito longos (como *"Selecione uma das opções acima para prosseguir..."*). Configurar `min-width: 0` força o Flexbox a respeitar o limite de tela do celular e encolher o textarea de forma flexível.
- **requestSubmit() sobre submit()**: Ao interceptar a tecla `Enter`, chamamos `form.requestSubmit()` em vez de `form.submit()`. Isso garante que o evento de submit padrão do formulário do React seja disparado corretamente e execute os validadores e funções de interceptação (`onSubmit={handleSubmit}`) atrelados ao formulário.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| renders messages correctly in ChatWindow component | `App.test.tsx` | ✅ pass |
| disables text input and mic during guided plan creation steps... | `App.test.tsx` | ✅ pass |

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

> O limite máximo de altura do textarea foi definido como `120px`. Se o usuário digitar mais texto do que cabe nessa altura, uma barra de rolagem vertical (scroll) interna será ativada automaticamente no textarea, mantendo o layout da barra de chat compacto.
