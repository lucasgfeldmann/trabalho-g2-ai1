# feat-014 — Suporte a Tabelas no Markdown

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-013

---

## Objetivo

Habilitar o reconhecimento, processamento e renderização elegante de tabelas formatadas em Markdown (utilizando delimitações por barras verticais `|`) como tabelas HTML estruturadas no chat do CalisBot, aplicando o tema visual Neon Calisthenics sem a introdução de dependências externas ou vulnerabilidades de segurança (XSS).

---

## O que foi implementado

- **Parser de Tabelas no `MarkdownRenderer`**: Modificação em [MarkdownRenderer.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/components/MarkdownRenderer.tsx) para capturar sequencialmente linhas consecutivas que começam e terminam com a barra vertical `|`, processando a linha de cabeçalho (`<thead>`/`<th>`) e as linhas de corpo (`<tbody>`/`<tr>`/`<td>`), enquanto detecta e ignora adequadamente as linhas divisoras (ex: `|---|---|`).
- **Renderização Segura e Modular**: Integração da lógica de renderização com a função de processamento inline (`parseInlineMarkdown`), garantindo suporte a decorações como negrito, itálico e códigos embutidos dentro das células e cabeçalhos da tabela.
- **Estilização Neon Premium**: Acréscimo de regras CSS em [index.css](file:///home/lucas/github/trabalho-g2-ai1/src/index.css) para envolver tabelas em um contêiner com rolagem horizontal automática (`.markdown-table-wrapper`), estilizar cabeçalhos com bordas neon e preenchimento verde, e implementar faixas alternadas em cinza-escuro (zebra striping).
- **Correção de Variáveis de Cor CSS**: Ajustadas 4 ocorrências no CSS onde a variável `--accent` era referenciada de forma incorreta para `--accent-color`, restaurando o brilho verde-neon padrão nos títulos, marcadores de lista e cabeçalhos de tabela.
- **Cobertura de Testes**: Inclusão do teste unitário `should render tables correctly` no arquivo [MarkdownRenderer.test.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/test/MarkdownRenderer.test.tsx), cobrindo a detecção de estruturas tabulares, cabeçalhos, divisores e dados.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/MarkdownRenderer.tsx` | modificado | Implementado loop de leitura sequencial de tabelas, limpeza de pipes e renderização segura |
| `src/index.css` | modificado | Adição dos estilos `.markdown-table*` e correção de referências de cores neon (`--accent-color`) |
| `src/test/MarkdownRenderer.test.tsx` | modificado | Inclusão de testes unitários para verificação de renderização de tabelas e células |
| `specs/requisitos.md` | modificado | Inclusão do requisito funcional `RF-016` correspondente à tabela markdown |
| `specs/projeto.md` | modificado | Atualização do escopo detalhado de renderização del chat |
| `specs/criterios-aceite.md` | modificado | Inclusão dos critérios de aceitação para o suporte de tabelas |
| `feature_list.json` | modificado | Atualização de `feat-014` para o status `completed` |
| `progress.md` | modificado | Registro de progresso da sessão atualizado |
| `docs/feat-014.md` | criado | Esta documentação |

---

## Decisões técnicas

- **Isolamento e Desempenho**: A leitura em loop sequencial e o fatiamento (`split('|')`) permitem que a detecção de tabelas ocorra em complexidade linear O(N) com relação ao número de linhas do texto, mantendo a performance de renderização instantânea do chat.
- **Rolagem Responsiva**: Envolver as tabelas no contêiner `.markdown-table-wrapper` com a propriedade `overflow-x: auto` previne que tabelas muito largas quebrem o layout das bolhas de mensagens do chat, principalmente em dispositivos móveis, adaptando-se perfeitamente aos limites da tela.
- **Alinhamento e Estética**: O uso de bordas arredondadas, sombras discretas e a linha de cabeçalho na cor verde neon (`--accent-color`) preserva a identidade visual futurista e esportiva do aplicativo CalisBot.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| should render tables correctly | `MarkdownRenderer.test.tsx` | ✅ pass |

---

## Evidência de verificação

```bash
=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/gemini.test.ts (6 tests) 6ms
✓ src/test/MarkdownRenderer.test.tsx (7 tests) 129ms
✓ src/test/App.test.tsx (17 tests) 671ms

Test Files  3 passed (3) | Tests  30 passed (30)
```

---

## Como usar / Notas para o próximo agente

- A formatação de tabelas segue o padrão convencional do markdown. Garanta que todas as linhas da tabela iniciem e terminem com o caractere `|`.
- Células que possuem estilos inline (como `**texto**` ou `` `código` ``) são interpretadas e renderizadas normalmente.
