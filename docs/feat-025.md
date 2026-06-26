# feat-025 — Tratamento Robusto de Erros da API Gemini

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-022, feat-023, feat-024

---

## Objetivo

> Corrigir o erro cryptico "model output must contain either output text or tool calls" da SDK Gemini, adicionando tratamento explícito de `finishReason`, mensagens de erro amigáveis em português e reordenação dos modelos no painel de configurações para priorizar os mais estáveis.

---

## O que foi implementado

- Verificação do `finishReason` do candidato antes de acessar `response.text` nas funções `parseUserMessage` e `generateCalisthenicsPlan`
- Erro amigável em português quando `finishReason` for `SAFETY` (filtro de segurança)
- Erro amigável em português quando `finishReason` for qualquer outro valor além de `STOP`/`MAX_TOKENS`
- Interceptação do erro da SDK `"model output must contain either output text or tool calls"` com mensagem clara orientando o usuário a trocar de modelo
- Modelo padrão alterado de `gemini-3-flash-preview` para `gemini-2.5-flash` (mais estável e amplamente disponível)
- Reordenação da lista de modelos no `SettingsPanel`: `gemini-2.5-flash` e `gemini-2.5-flash-lite` no topo; modelos "Preview" marcados explicitamente
- Texto de ajuda adicionado abaixo do select de modelo explicando qual usar em caso de erro

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/services/gemini.ts` | modificado | Verificação de `finishReason` e tratamento de erro da SDK |
| `src/components/SettingsPanel.tsx` | modificado | Reordenação de modelos, texto de ajuda, novo padrão |
| `src/App.tsx` | modificado | Modelo padrão atualizado para `gemini-2.5-flash` |

---

## Decisões técnicas

- **Verificar `finishReason` antes de `response.text`**: A SDK pode lançar o erro `"model output must contain either output text or tool calls"` ao acessar `response.text` quando a resposta está bloqueada. Verificar o candidato primeiro evita o erro cryptico.
- **Interceptar o erro da SDK por mensagem**: Como fallback adicional, se o erro chegar ao `catch`, verificamos a mensagem e relançamos com texto amigável.
- **`gemini-2.5-flash` como padrão**: Modelos `gemini-3.x-*` ainda em Preview podem não estar disponíveis para todas as API keys. O `gemini-2.5-flash` é o modelo estável mais recente amplamente disponível.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| Todos os testes existentes | `App.test.tsx` | ✅ 45 pass |

---

## Evidência de verificação

```
$ npm test -- --run
 ✓ src/test/App.test.tsx (30 tests) 1280ms
 Test Files  3 passed (3)
     Tests  45 passed (45)
```

---

## Como usar / Notas para o próximo agente

- Se o usuário reportar erro de resposta vazia ou "model output...", orientar a trocar para `gemini-2.5-flash` nas Configurações.
- A lógica de `finishReason` está em ambas as funções exportadas de `gemini.ts`.
- O modelo padrão em `App.tsx` e `SettingsPanel.tsx` agora é `gemini-2.5-flash`.
