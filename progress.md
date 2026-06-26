# Session Progress Log

## Current State

**Last Updated:** 2026-06-26 10:50
**Active Feature:** Nenhuma (Todas as features concluídas! 🎉)

## Status

### What's Done

- [x] **feat-001 - Project Setup**: Harness configurado (AGENTS.md, feature_list.json, progress.md, session-handoff.md, init.sh).
- [x] **feat-002 - Configurar Vite React TypeScript**: Projeto scaffolded, dependências instaladas, verificação limpa.
- [x] **feat-003 - Verification Coverage**: Vitest + @testing-library/react + jest-dom. 4 testes. Pipeline: lint → typecheck → test.
- [x] **feat-004 - Documentation Update**: README.md completo com stack, estrutura, comandos e harness.
- [x] **feat-005 - Cleanup and Handoff**: session-handoff.md preenchido, commit final realizado.
- [x] **specs - Especificações e Requisitos**: Esclarecimento das perguntas de design/IA/voz e atualização de `projeto.md`, `requisitos.md` (incluindo o guardrail de escopo de calistenia `RN-005` e o contexto conversacional `RF-013`) e `criterios-aceite.md` (incluindo escolha de modelo de IA no painel de configurações, definição do `gemini-3-flash-preview` como padrão, critérios do contexto `feat-011`, critérios de consulta local `feat-012` e critérios de formatação de markdown `feat-013`).
- [x] **infra - Instalação do SDK**: Instalada a biblioteca `@google/genai` no projeto para integração futura com a API do Gemini.
- [x] **infra - Exposição de Rede Local**: Configurado `host: true` e `allowedHosts: true` no `vite.config.ts` para acesso externo (celular).
- [x] **feat-006 - Interface de Chat (UI)**: Janela de chat responsiva (320px+), bolhas de mensagens com estilo Neon Calisthenics, scroll automático e painel de configurações para API Key e modelo Gemini (salvos localmente).
- [x] **feat-007 - Entrada por Áudio (Web Speech API)**: Integração do botão de microfone com a Web Speech API para transcrição em tempo real de voz para o input do chat.
- [x] **feat-008 - Registro de Exercícios via Chat**: Conexão com o SDK `@google/genai`, parser estruturado em JSON para exercícios de calistenia, fluxo de confirmação rápida e persistência no IndexedDB via Dexie.js com suporte a guardrails.
- [x] **feat-009 - Criação e Gestão do Plano de Exercícios**: Desenvolver fluxo de perguntas estruturado para nível/frequência/objetivo, chamada com inteligência artificial para gerar plano semanal personalizado, persistência local no Dexie e comandos como "ver meu plano".
- [x] **feat-010 - Histórico de Treinos**: Criar tela/seção de histórico acessível via chat ou navegação. Exibir treinos agrupados por data. Dados persistem via IndexedDB.
- [x] **feat-011 - Contexto da Conversa (Sessão)**: Enviar histórico de turnos estruturado de forma alternada (user/model) e robusta, permitindo que a IA entenda referências e pronomes no chat.
- [x] **feat-012 - Consulta de Dados Locais pela IA**: Enviar dados do IndexedDB (plano ativo, histórico recente de treinos, data/dia atual) para a IA responder a consultas e perguntas sobre o progresso e treinos realizados do usuário.
- [x] **feat-013 - Formatador de Respostas em Markdown**: Implementar um componente renderizador de Markdown seguro e sem dependências externas para formatar as respostas do bot no chat, incluindo títulos, listas, negrito, itálico e tags de código inline com estilos neon.
- [x] **feat-014 - Suporte a Tabelas no Markdown**: Estender o componente MarkdownRenderer para reconhecer e renderizar tabelas markdown em elementos HTML estruturados com estilo Neon Calisthenics e responsividade horizontal.
- [x] **feat-015 - Criação e Edição de Planos via IA**: Permitir que o usuário utilize chat de texto livre para pedir para a IA criar novos planos ou alterar o plano ativo existente, com confirmação e persistência no IndexedDB.
- [x] **feat-016 - Estruturação do Histórico de Exercícios em Tabela Limpa**: Reestruturar a visualização do histórico de treinos no HistoryPanel em uma tabela limpa com colunas dedicadas para Data/Hora (data e horário), Exercício (somente nome), Séries (número puro), Repetições (número puro) e Observações (somente observação).
- [x] **feat-017 - Abas de Navegação Inferiores, Registro de Horário e Importação/Exportação CSV**: Implementar barra de abas de navegação inferior (Chat, Histórico, Plano). Registrar horário específico para cada exercício. Aba Histórico com filtro de data por dia e importação/exportação de arquivo CSV. Aba Plano com checkboxes para inserção rápida de exercícios.
- [x] **feat-018 - Filtro Diário no Plano de Treinos e Alternância de Visualização Completa**: Alterar a aba de Plano para exibir por padrão apenas o treino do dia de hoje, adicionando um botão de alternância para o plano completo e removendo os checkboxes de marcação rápida.
- [x] **feat-019 - Modos de Visualização no Histórico (Tabela e Cards)**: Adicionar controles visuais na aba de Histórico para alternar entre visualização de Tabela (tabular clássico) e Cards (listagem estruturada em cartões adequada para smartphones).
- [x] **feat-020 - Correção Conversacional de Operações e Reconhecimento de Datas no Registro de Treino**: Adicionar botão e controle de fluxo conversacional de correção para treinos e planos pendentes de confirmação. Permitir a extração e o cálculo automático de datas absolutas e relativas (ex: "ontem") no registro de exercícios.

### What's In Progress

- Nenhum.

### What's Next

- Nenhum. Todas as features planejadas foram concluídas com sucesso.

## Blockers / Risks

- Nenhum.

## Decisions Made

- **Stack**: React 19 + TypeScript 6 + Vite 8.
- **Testes**: Vitest + @testing-library/react + jsdom.
- **Linter**: oxlint (nativo do template).
- **Abas de Navegação**: Estado `activeTab` gerenciado centralizadamente em `App.tsx` e injetado em `ChatWindow.tsx` para alternância de telas.
- **Horário por Exercício**: Campo `hora_realizacao` adicionado na interface de exercícios local para permitir registrar múltiplos exercícios em momentos diferentes do dia.
- **Importação/Exportação CSV**: Implementado processamento manual de strings CSV seguro (tratando aspas e quebras de linha) para leitura e escrita offline no IndexedDB local.
- **Segurança de link.click() em testes**: Link.click() foi encapsulado em try-catch na exportação de CSV para evitar que o ambiente jsdom interrompa o teste lançando erros de navegação.

## Files Modified This Session

- `feature_list.json`, `progress.md`, `specs/requisitos.md`, `specs/projeto.md`, `specs/criterios-aceite.md`
- `src/db/db.ts`, `src/services/gemini.ts`, `src/App.tsx`, `src/components/ChatWindow.tsx`, `src/components/HistoryPanel.tsx`, `src/components/PlanTabContent.tsx`, `src/index.css`, `src/test/App.test.tsx`, `docs/feat-017.md`, `docs/feat-018.md`

## Evidence of Completion

- [x] `./init.sh` limpo com todos os 39 testes passando:
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
=== Verification Complete ===
```

## Notes for Next Session

Todas as features planejadas estão implementadas, testadas e integradas. O repositório está limpo, com testes passando de ponta a ponta e pronto para execução.
