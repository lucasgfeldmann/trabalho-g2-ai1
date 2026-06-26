# feat-018 — Filtro Diário no Plano de Treinos e Alternância de Visualização Completa

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-017

---

## Objetivo

Simplificar a aba de Plano de Exercícios exibindo por padrão apenas o dia correspondente a hoje (dia atual da semana). Adicionar um botão de alternância para visualizar o plano completo e remover o antigo controle de checkboxes do plano.

---

## O que foi implementado

- **Exibição do Dia de Hoje por Padrão:** A aba de Plano agora busca o dia da semana atual (`diaSemanaHoje`) e exibe apenas o card correspondente a esse dia.
- **Aviso de Descanso:** Se não houver treinos previstos no plano ativo para o dia de hoje, a interface apresenta uma ilustração textual amigável *"Hoje é seu dia de descanso! 🧘"* com um botão alternativo para ver o plano completo.
- **Alternância para o Plano Inteiro:** Adicionado o botão `📋 Ver Plano Inteiro` (ou `📅 Ver Apenas Hoje`) no cabeçalho da tela do plano que permite ao usuário visualizar o plano semanal de forma expandida.
- **Remoção das Checkboxes:** Removida a interação direta de checkboxes na tela de Plano a pedido do usuário, simplificando os itens de exercício para uma lista puramente textual de consulta rápida (`Nome do Exercício` e `Séries x Repetições`).

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/PlanTabContent.tsx` | modificado | Implementação da lógica de filtragem diária por dia da semana e remoção das checkboxes |
| `src/test/App.test.tsx` | modificado | Substituição do teste de checkbox por um teste de renderização do card e exercícios |
| `specs/requisitos.md` | modificado | Atualização do requisito RF-022 e acréscimo do RF-023 |
| `specs/projeto.md` | modificado | Atualização do escopo do projeto removendo referências a checkboxes |
| `specs/criterios-aceite.md` | modificado | Modificação dos critérios de aceite para remover checkboxes e adicionar visualização diária/inteira |
| `feature_list.json` | modificado | Atualização do roadmap com a conclusão da feature |
| `docs/feat-018.md` | criado | Esta documentação |

---

## Decisões técnicas

- **[Seeding nos testes]**: O teste de integração foi ajustado para criar o plano ativo usando dinamicamente o dia da semana atual (`new Date().getDay()`). Desse modo, o app exibe a lista de treinos por padrão em vez de renderizar o bloco de descanso ("Hoje é seu dia de descanso!"), permitindo testar a renderização dos exercícios sem depender de qual dia a suíte de testes é executada.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| renders active plan in Plano tab | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
=== npm run lint ===
Found 0 warnings and 0 errors.

=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/gemini.test.ts (8 tests) 8ms
✓ src/test/MarkdownRenderer.test.tsx (7 tests) 121ms
✓ src/test/App.test.tsx (24 tests) 825ms
Test Files  3 passed (3) | Tests  39 passed (39)
```

---

## Como usar / Notas para o próximo agente

- A visualização por dia de descanso e a alternância `showFullPlan` são contidas no estado interno do componente `PlanTabContent.tsx`. 
- Caso novas visões precisem acessar se hoje é dia de treino ou descanso, as propriedades computadas `todayWorkout` e `hasWorkoutToday` podem ser extraídas como funções utilitárias.
