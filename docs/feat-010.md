# feat-010 — Histórico de Treinos

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-009

---

## Objetivo

Implementar a visualização reativa de todo o histórico de treinos registrados localmente no IndexedDB, ordenando as sessões por ordem cronológica reversa (mais recente primeiro) e exibindo a data, hora, exercícios, séries, repetições e notas das sessões realizadas, acessíveis via botão ou comandos de chat.

---

## O que foi implementado

- **Histórico Reativo com Dexie (`HistoryPanel`)**: Criação do componente modal [HistoryPanel.tsx](file:///home/lucas/github/trabalho-g2-ai1/src/components/HistoryPanel.tsx) que utiliza `useLiveQuery` para recuperar dinamicamente e de forma auto-atualizável os registros de `db.historico_treinos`.
- **Botão de Atalho no Cabeçalho**: Inserção de um botão de calendário (📅) à esquerda do botão de configurações nas ações de cabeçalho do chat.
- **Interpretação de Comando conversacional**: Habilidade de identificar termos como `"ver histórico"`, `"histórico"`, `"historico"` na entrada do usuário para disparar a abertura do modal automaticamente.
- **Ordenação Reversa e Filtragem**: As sessões vazias são filtradas e os treinos são ordenados de forma decrescente (o treino mais recente no topo).
- **Formatadores Regionais**: A data gravada em formato `YYYY-MM-DD` é formatada de forma amigável no padrão brasileiro `DD/MM/YYYY`.
- **Testes Unitários/Integração**: Cobertura de renders com dados mockados semeados previamente no IndexedDB e do fluxo conversacional de ativação por mensagem de chat.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/HistoryPanel.tsx` | criado | Componente modal para exibição reativa dos treinos |
| `src/components/ChatWindow.tsx` | modificado | Inclusão da prop `onOpenHistory` (opcional) e adição do botão 📅 |
| `src/index.css` | modificado | Adicionados estilos para o modal de histórico e para o layout do cabeçalho `.header-actions` |
| `src/App.tsx` | modificado | Controle do estado `isHistoryOpen`, mapeamento de comandos e acoplamento do modal |
| `src/test/App.test.tsx` | modificado | Adicionados testes cobrindo a renderização do histórico de treino |
| `docs/feat-010.md` | criado | Esta documentação |

---

## Decisões técnicas

- **Opcionalidade de props no ChatWindow**: A prop `onOpenHistory` foi mantida opcional (`onOpenHistory?`) para não forçar alterações desnecessárias em testes antigos ou páginas simples do chat, mantendo o princípio de desenvolvimento robusto.
- **Hook `useLiveQuery`**: Fornece renderização reativa sem a necessidade de implementar estados e disparadores redundantes de sincronização manual de dados a cada treino cadastrado, tornando o código mais conciso e legível.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| Abertura e renderização do histórico via clique no Header | `App.test.tsx` | ✅ pass |
| Fechamento e reabertura do modal no botão Fechar | `App.test.tsx` | ✅ pass |
| Abertura por comando escrito `"ver histórico"` | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
=== npm run lint ===
Found 0 warnings and 0 errors.

=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/App.test.tsx (16 tests) 611ms
   ✓ CalisBot App & Components (16)
     ✓ renders history modal with seeded data when clicking calendar button 24ms
     ✓ opens history modal when sending ver histórico command and shows todays workouts 13ms
Test Files  1 passed (1) | Tests  16 passed (16)
```

---

## Como usar / Notas para o próximo agente

- A visualização do histórico pode ser acionada tanto por atalho 📅 no cabeçalho quanto digitando `"histórico"` no chat.
- As tabelas e esquemas Dexie estão totalmente estáveis. O aplicativo atende a todos os critérios de aceite estipulados para a persistência local (IndexedDB) e IA.
