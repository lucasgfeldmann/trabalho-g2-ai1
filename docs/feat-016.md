# feat-016 — Exibição de Data nos Exercícios do Histórico

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-010

---

## Objetivo

Exibir explicitamente a data de realização formatada (`DD/MM/AAAA`) ao lado de cada exercício listado nos cartões de treino na tela de Histórico (`HistoryPanel.tsx`), facilitando a identificação imediata da data de cada exercício sem necessitar de dedução unicamente a partir do cabeçalho do cartão.

---

## O que foi implementado

- **Renderização da Data no `HistoryPanel`**: Modificação em [HistoryPanel.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/components/HistoryPanel.tsx) para incluir um elemento `<span>` com a classe `ex-date` exibindo a data formatada do treino correspondente (usando a função `formatDate(treino.data)`) dentro do item de lista (`<li>`) de cada exercício realizado.
- **Estilização CSS Muted**: Adição da classe `.ex-date` em [index.css](file:///home/lucas/github/trabalho-g2-ai1/src/index.css) configurando o tamanho da fonte para `12px`, margem esquerda de `6px` e a cor atenuada `var(--text-muted)`.
- **Atualização de Testes**: Atualização de asserções em [App.test.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/test/App.test.tsx) no caso de teste de exibição do histórico de hoje para verificar a presença da string de data formatada `(DD/MM/AAAA)` do exercício.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/HistoryPanel.tsx` | modificado | Adicionado span com classe `ex-date` exibindo a data de cada exercício |
| `src/index.css` | modificado | Adicionado estilo visual para a classe `.ex-date` |
| `src/test/App.test.tsx` | modificado | Incluída asserção para verificar a presença da data do exercício no histórico |
| `specs/requisitos.md` | modificado | Atualizada a descrição do `RF-008` |
| `specs/criterios-aceite.md` | modificado | Adicionados critérios de aceitação para `feat-016` |
| `feature_list.json` | modificado | Atualização da `feat-016` para o status `completed` |
| `progress.md` | modificado | Registro de progresso da sessão atualizado |
| `docs/feat-016.md` | criado | Esta documentação |

---

## Decisões técnicas

- **Uso de Funções de Formatação Existentes**: Reutilizamos a função local `formatDate` de `HistoryPanel.tsx` que trata timezones com segurança (concatenando `T00:00:00` antes de invocar o construtor `Date`), garantindo formatação consistente para o padrão local brasileiro.
- **Design de Contraste Suave**: O uso de `var(--text-muted)` de tamanho reduzido (`12px`) ao lado do texto principal do exercício garante que a data sirva como informação de suporte sem poluir ou tirar o foco do nome do exercício e das repetições/séries.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| opens history modal when sending ver histórico command and shows todays workouts | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```bash
=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/gemini.test.ts (8 tests) 8ms
✓ src/test/MarkdownRenderer.test.tsx (7 tests) 137ms
✓ src/test/App.test.tsx (19 tests) 692ms

Test Files  3 passed (3) | Tests  34 passed (34)
```

---

## Como usar / Notas para o próximo agente

- A data é exibida dinamicamente no padrão de idioma do navegador (`pt-BR`).
