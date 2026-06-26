# feat-015 — Criação e Edição de Planos via IA

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-014

---

## Objetivo

Permitir que o usuário utilize mensagens em linguagem natural livre no chat para solicitar a criação de novos planos de treino de calistenia ou editar o seu plano ativo existente (por exemplo, adicionando, removendo ou alterando exercícios, séries ou repetições de um dia específico), salvando as alterações de maneira estruturada no banco de dados local IndexedDB com confirmação interativa de segurança.

---

## O que foi implementado

- **Estruturação de Ações de Plano no Gemini**: Extensão da resposta do interpretador de IA em [gemini.ts](file:///home/lucas/github/trabalho-g2-ai1/src/services/gemini.ts) para detectar intenções de manipulação de plano. O prompt de sistema foi enriquecido com schemas específicos que retornam a chave `action` (`create_plan` ou `edit_plan`) e o objeto `planoGeral` formatado de acordo com o padrão do banco.
- **Contextualização com o Plano Ativo**: A IA recebe no prompt o estado completo do `planoAtivo` lido do IndexedDB local (quando houver). No caso de edição (`edit_plan`), ela analisa o plano existente, aplica cirurgicamente a modificação solicitada (ex: mudar séries de flexão na segunda ou adicionar barra na quarta) e retorna a estrutura atualizada completa.
- **Fluxo de Confirmação em `App.tsx`**: Implementados os estados `pendingIAPlan` e `pendingPlanAction` em [App.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/App.tsx) para interceptar as respostas da IA contendo ações de plano. O chat renderiza os detalhes do plano sugerido e pergunta ao usuário se ele deseja salvar/atualizar as modificações.
- **Botões Rápidos de Ação**: Integração do estado de plano pendente com a barra de botões rápidos (`getQuickOptions` em `App.tsx`), fornecendo atalhos para "Confirmar Plano" e "Cancelar".
- **Persistência Segura**: Ao confirmar, o plano antigo é apagado e o novo é salvo no IndexedDB local sob a tabela `plano_ativo`.
- **Testes Unitários e de Integração**:
  - Em [gemini.test.ts](file:///home/lucas/github/trabalho-g2-ai1/src/test/gemini.test.ts): Adicionados testes para validar que a resposta do Gemini é corretamente convertida para ações de criação e edição com o payload do plano.
  - Em [App.test.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/test/App.test.tsx): Adicionados dois testes de integração simulando o fluxo de chat, recepção de ações da IA, cliques de confirmação e persistência correta no banco local Dexie.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/services/gemini.ts` | modificado | Extensão da interface `ParseResult` e da instrução de sistema do Gemini para actions de plano |
| `src/App.tsx` | modificado | Declaração de estados de plano pendente, tratamento na interceptação de respostas, e opções rápidas de confirmação |
| `src/test/gemini.test.ts` | modificado | Testes de parse unitário para criação e edição de planos |
| `src/test/App.test.tsx` | modificado | Testes de integração simulando fluxos completos de salvar/editar planos sugeridos pela IA |
| `specs/requisitos.md` | modificado | Adicionado requisito funcional `RF-017` para o controle de planos via IA conversacional |
| `specs/projeto.md` | modificado | Atualização do escopo interno para incluir criação/edição flexível via IA |
| `specs/criterios-aceite.md` | modificado | Critérios de aceitação para a feature `feat-015` |
| `feature_list.json` | modificado | Atualização da `feat-015` para o status `completed` |
| `progress.md` | modificado | Log de progresso atualizado |
| `docs/feat-015.md` | criado | Esta documentação |

---

## Decisões técnicas

- **Modificação Baseada em Estado Completo**: Ao invés de tentar fazer o app local gerenciar diffs parciais e complexos (ex: instruções SQL ou comandos Dexie parciais retornados pela IA), a IA atua como um processador de estado puro. Ela lê o plano antigo, gera o estado do plano resultante completo e envia para o app, o qual apenas sobrescreve a tabela inteira do IndexedDB. Isso reduz drasticamente a chance de bugs de dessincronização.
- **Confirmação Interativa Obrigatória**: Para evitar que falhas de entendimento da IA destruam a rotina de treinos do usuário, as ações de plano necessitam de um clique manual explícito de confirmação antes de apagar/salvar os dados no IndexedDB.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| should parse a message to create a plan and return action create_plan with planoGeral | `gemini.test.ts` | ✅ pass |
| should parse a message to edit a plan and return action edit_plan with updated planoGeral | `gemini.test.ts` | ✅ pass |
| prompts user to save when Gemini returns create_plan action, and saves to IndexedDB upon confirmation | `App.test.tsx` | ✅ pass |
| prompts user to save when Gemini returns edit_plan action, and updates IndexedDB upon confirmation | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```bash
=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/gemini.test.ts (8 tests) 8ms
✓ src/test/MarkdownRenderer.test.tsx (7 tests) 137ms
✓ src/test/App.test.tsx (19 tests) 700ms

Test Files  3 passed (3) | Tests  34 passed (34)
```

---

## Como usar / Notas para o próximo agente

- Para testar por texto, use termos como: *"Crie um plano iniciante de 3 dias"* ou *"Adicione barra fixa de 3 séries com 10 repetições na segunda"*.
- A IA montará o layout estrutural e o app se encarrega de renderizar no chat a rotina formatada com tabelas e caixas rápidas de confirmação.
