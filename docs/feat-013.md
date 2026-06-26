# feat-013 — Formatador de Respostas em Markdown

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-012

---

## Objetivo

Apresentar as respostas enviadas pelo assistente de IA formatadas com estilos visuais no chat (usando tags HTML/JSX como negrito, itálico, listas, títulos e blocos de código inline) ao invés de exibir texto em markdown puro, aprimorando significativamente a qualidade estética e a escaneabilidade das respostas do bot.

---

## O que foi implementado

- **Componente `MarkdownRenderer`**: Criação de [MarkdownRenderer.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/components/MarkdownRenderer.tsx) para processar de forma segura (sem usar `dangerouslySetInnerHTML`) a string de markdown e gerar nós do React para títulos (`#`, `##`, `###`), listas não ordenadas (`-`, `*`), texto em negrito (`**bold**`), itálico (`*italic*`) e código inline (`` `code` ``).
- **Estilos Neon Calisthenics**: Adicionadas classes e regras no final de [index.css](file:///home/lucas/github/trabalho-g2-ai1/src/index.css) para estilizar as listas de markdown com marcadores verdes-neon customizados (`::before`), código inline com coloração ciano e fundo chumbo (`.markdown-inline-code`), e espaçadores entre blocos (`.markdown-spacer`).
- **Integração no Chat**: Atualização de [ChatWindow.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/components/ChatWindow.tsx) para renderizar as mensagens do bot usando o componente `MarkdownRenderer`.
- **Testes Unitários**: Criação de [MarkdownRenderer.test.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/test/MarkdownRenderer.test.tsx) validando todos os casos de renderização (parágrafos, negrito, itálico, código inline, listas, títulos e espaçadores).
- **Refatoração de Asserções**: Atualização das asserções de lista nos testes de [App.test.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/test/App.test.tsx) para buscar pelo texto real sem o prefixo `- `, que agora é tratado nativamente como marcador visual pelo HTML.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/MarkdownRenderer.tsx` | criado | Componente renderizador seguro de Markdown para React |
| `src/components/ChatWindow.tsx` | modificado | Acoplamento de `MarkdownRenderer` na bolha de mensagens do bot |
| `src/index.css` | modificado | Adição dos estilos `.markdown-*` para listas, cabeçalhos e tags de código |
| `src/test/MarkdownRenderer.test.tsx` | criado | Testes de unidade do componente renderizador |
| `src/test/App.test.tsx` | modificado | Ajuste de asserções que esperavam hífens nos itens de lista do plano e treino |
| `specs/requisitos.md` | modificado | Adição do requisito funcional `RF-015` |
| `specs/projeto.md` | modificado | Atualização do escopo com renderização de Markdown no chat |
| `specs/criterios-aceite.md` | modificado | Critérios de aceitação para a feature `feat-013` |
| `feature_list.json` | modificado | Transição da feature para `completed` |
| `progress.md` | modificado | Log de progresso atualizado |
| `prompts.md` | modificado | Registro do prompt do usuário |
| `docs/feat-013.md` | criado | Esta documentação |

---

## Decisões técnicas

- **Segurança contra XSS (Cross-Site Scripting)**: A lógica do `MarkdownRenderer` decompõe a string e gera elementos React estruturados diretamente (`<strong>`, `<em>`, `<code>`, `<li>`, `<ul>`, `h2`, `h3`, `h4`, `p`), sem recorrer à injeção de HTML direto (`dangerouslySetInnerHTML`). Isso previne completamente vetores de ataques de injeção e garante robustez na execução no navegador.
- **Aparência Neon Curada**: A decoração visual foi integrada ao tema principal do CalisBot, colorindo as tags inline com a cor de destaque do tema e configurando o bullet point como uma bolha/círculo verde neon (`#10b981`), garantindo que o visual continue se sobressaindo e parecendo premium.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| should render empty text as null | `MarkdownRenderer.test.tsx` | ✅ pass |
| should render simple paragraphs | `MarkdownRenderer.test.tsx` | ✅ pass |
| should render headers correctly | `MarkdownRenderer.test.tsx` | ✅ pass |
| should render bold, italic and inline code | `MarkdownRenderer.test.tsx` | ✅ pass |
| should render bullet lists correctly | `MarkdownRenderer.test.tsx` | ✅ pass |
| should render spacer for empty lines | `MarkdownRenderer.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/gemini.test.ts (6 tests) 6ms
✓ src/test/MarkdownRenderer.test.tsx (6 tests) 108ms
✓ src/test/App.test.tsx (17 tests) 664ms

Test Files  3 passed (3) | Tests  29 passed (29)
```

---

## Como usar / Notas para o próximo agente

- A formatação de markdown é processada em tempo de execução de forma instantânea e sem custos adicionais de desempenho ou pacotes externos pesados.
