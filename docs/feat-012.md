# feat-012 — Consulta de Dados Locais pela IA

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-011

---

## Objetivo

Permitir que a IA do CalisBot tenha acesso e possa consultar as informações salvas localmente no dispositivo do usuário — incluindo o plano de treinos ativo (`plano_ativo`) e o histórico recente de treinos (`historico_treinos`) —, viabilizando respostas contextualizadas a perguntas do usuário sobre seu progresso, treinos passados e plano atual.

---

## O que foi implementado

- **Interface de Dados de Contexto (`UserContextData`)**: Definição da estrutura contendo `planoAtivo`, `historicoTreinos`, `dataAtual` e `diaSemanaAtual` em [gemini.ts](file:///home/lucas/github/trabalho-g2-ai1/src/services/gemini.ts).
- **Injeção Dinâmica em `systemInstruction`**: Adaptação de `parseUserMessage` para receber `contextData` e injetá-lo de forma estruturada no prompt do sistema de IA.
- **Recuperação Automática do IndexedDB**: Atualização de `handleProcessMessage` em [App.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/App.tsx) para buscar em tempo real os dados locais via Dexie e repassar o dia da semana no idioma correspondente do plano do usuário.
- **Testes de Injeção de Contexto**: Adicionado teste em [gemini.test.ts](file:///home/lucas/github/trabalho-g2-ai1/src/test/gemini.test.ts) comprovando que os dados lidos do IndexedDB são corretamente inclusos no payload do sistema enviado à API do Gemini.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/services/gemini.ts` | modificado | Adicionado `UserContextData` e lógica de injeção em `systemInstruction` |
| `src/App.tsx` | modificado | Leitura das tabelas IndexedDB de plano e histórico, mapeamento da data/dia e chamada de `parseUserMessage` |
| `src/test/gemini.test.ts` | modificado | Teste unitário adicionado validando a injeção correta dos dados locais |
| `specs/requisitos.md` | modificado | Inclusão do requisito funcional `RF-014` |
| `specs/projeto.md` | modificado | Atualização do escopo com a nova capacidade de consulta de dados locais |
| `specs/criterios-aceite.md` | modificado | Inclusão dos critérios de aceitação para a feature `feat-012` |
| `feature_list.json` | modificado | Transição da feature para `completed` com evidências descritas |
| `progress.md` | modificado | Session log atualizado |
| `prompts.md` | modificado | Log do prompt de entrada do usuário |
| `docs/feat-012.md` | criado | Esta documentação |

---

## Decisões técnicas

- **RAG Local / Injeção Stateless**: Optou-se por realizar uma consulta local de leitura simples e injetar as informações estruturadas em formato JSON diretamente na `systemInstruction`. Isso evita requisições complexas extras à API (como no caso de Function Calling), diminui a latência de resposta, garante funcionamento instantâneo offline na interface de erro e economiza consumo de tokens de API.
- **Limitação de Volume**: Para evitar estouro de tokens em contextos de longo termo, o histórico recuperado do IndexedDB é limitado às últimas 15 sessões de treino ativas, o que é mais do que suficiente para responder a perguntas de contextualização temporal (ex: "o que fiz ontem?", "treinei terça-feira passada?").

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| should inject contextData into systemInstruction | `gemini.test.ts` | ✅ pass |

---

## Evidência de verificação

```
=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/gemini.test.ts (6 tests) 7ms
✓ src/test/App.test.tsx (17 tests) 638ms

Test Files  2 passed (2) | Tests  23 passed (23)
```

---

## Como usar / Notas para o próximo agente

- A IA possui o contexto temporal completo, sabendo exatamente a data de hoje, o dia da semana atual e os registros salvos do usuário. Ela responderá na chave JSON `respostaConversacional` sempre que o usuário fizer perguntas analíticas sobre suas atividades.
