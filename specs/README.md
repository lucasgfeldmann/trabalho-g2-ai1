# specs/ — Guia do Diretório de Especificações

Este diretório contém toda a documentação de produto do **CalisBot**. É a fonte de verdade para entender o que será construído, por quê, e como saber quando está pronto.

---

## 📁 Arquivos deste diretório

| Arquivo | Propósito |
|---|---|
| `README.md` | Este guia — regras, padrões e checklist de qualidade para as specs |
| `projeto.md` | Visão geral, contexto, fluxo do usuário, stack, dados e marcos |
| `requisitos.md` | Requisitos funcionais (RF), não funcionais (RNF) e regras de negócio |
| `criterios-aceite.md` | Critérios objetivos e verificáveis por feature — o que significa "done" |

---

## ✅ O que DEVE estar nas specs

### Em `projeto.md`
- **Visão geral em 2–3 frases** — qualquer pessoa deve entender o produto sem contexto adicional
- **Contexto e público-alvo** — quem usa, quando e por quê
- **Escopo explícito** — o que está dentro E o que está fora (igualmente importante)
- **Fluxo principal do usuário** — passo a passo de como o usuário usa o app
- **Estrutura de dados** — quais entidades são salvas e com quais campos
- **Stack técnica** — todas as dependências relevantes com versão aproximada
- **Marcos / milestones** — com status atualizado (concluído / pendente)
- **Decisões de produto já tomadas** — ex: offline-first, dark mode, LLM externo

### Em `requisitos.md`
- **Requisitos funcionais (RF)** no formato: *"O sistema deve..."*
- **Prioridade** para cada RF: Alta / Média / Baixa
- **Referência à feature** relacionada (`feat-XXX`)
- **Requisitos não funcionais (RNF)**: performance, usabilidade, acessibilidade, segurança
- **Regras de negócio (RN)**: restrições do domínio com impacto descrito
- **Glossário** de termos do domínio

### Em `criterios-aceite.md`
- **Critérios objetivos** no formato: *"[Comportamento observável ocorre em [condição]]"*
- **Um bloco por feature** (feat-XXX)
- **Referência a testes específicos** quando aplicável
- **Linha final obrigatória**: `./init.sh` passa após a implementação

---

## ❌ O que NÃO deve estar nas specs

| Proibido | Por quê |
|---|---|
| Código-fonte ou snippets de implementação | Specs descrevem *o quê*, não *como*. Código vai em `src/` |
| Detalhes de UI (cores, espaçamentos, classes CSS) | Especificações visuais vão nos componentes ou em um design system doc separado |
| Critérios vagos como "funciona bem" ou "está bonito" | Não são verificáveis. Todo critério deve ter resposta sim/não |
| Decisões de arquitetura técnica | Vão em `docs/feat-XXX.md` após a implementação |
| Histórico de mudanças inline | Use `git log` para histórico. As specs devem refletir o estado atual |
| Duplicação de conteúdo entre arquivos | Se já está em `projeto.md`, não repita em `requisitos.md` |

---

## 🔧 Ferramentas do Projeto — CalisBot

Esta seção documenta as ferramentas escolhidas, sua finalidade e configuração relevante.

### Frontend & Build

| Ferramenta | Versão | Finalidade | Docs |
|---|---|---|---|
| React | 19.x | Framework UI — componentes e estado | [react.dev](https://react.dev) |
| TypeScript | 6.x | Tipagem estática | [typescriptlang.org](https://www.typescriptlang.org) |
| Vite | 8.x | Bundler e dev server com HMR | [vite.dev](https://vite.dev) |

### Banco de Dados Local

| Ferramenta | Versão | Finalidade | Docs |
|---|---|---|---|
| Dexie.js | 4.x | Wrapper amigável para IndexedDB | [dexie.org](https://dexie.org) |
| IndexedDB | nativo | Persistência local no browser (sem backend) | MDN |

> **Por que Dexie.js?** A API nativa do IndexedDB é verbosa e baseada em callbacks. Dexie oferece uma API Promise/async simples, suporte a TypeScript e transações declarativas.

### Inteligência Artificial

| Ferramenta | Versão | Finalidade | Docs |
|---|---|---|---|
| Gemini API (Google) | v1 | LLM para interpretar comandos em linguagem natural e gerar planos de treino | [ai.google.dev](https://ai.google.dev) |
| **Alternativa** OpenAI API | v4 | GPT-4o para interpretação e geração de planos | [platform.openai.com](https://platform.openai.com) |

> **Decisão pendente:** Definir qual LLM será usado (Gemini ou OpenAI). A escolha impacta custos, latência e disponibilidade da API key. Consultar o usuário antes de implementar feat-008.

### Entrada por Voz

| Ferramenta | Versão | Finalidade | Docs |
|---|---|---|---|
| Web Speech API | nativo | Reconhecimento de voz no browser (SpeechRecognition) | MDN |

> **Limitações:** Requer HTTPS em produção. Não funciona no Firefox sem flag. Necessita conexão com a internet (processamento no servidor do browser). Implementar fallback gracioso quando não disponível.

### Qualidade de Código

| Ferramenta | Versão | Finalidade | Docs |
|---|---|---|---|
| Vitest | 4.x | Framework de testes unitários e de integração | [vitest.dev](https://vitest.dev) |
| @testing-library/react | 16.x | Testes de componentes React orientados ao usuário | [testing-library.com](https://testing-library.com) |
| Oxlint | 1.x | Linter rápido (Rust) substituto do ESLint | [oxc.rs](https://oxc.rs) |

### Visualização de Dados (Futuro — Marco M8)

| Ferramenta | Versão | Finalidade | Docs |
|---|---|---|---|
| Recharts | 2.x | Gráficos de progresso (volume semanal, exercícios mais frequentes) | [recharts.org](https://recharts.org) |

> **Status:** Não instalar agora. Adicionar quando a feat-010 (Histórico) estiver completa.

---

## 🗣️ Perguntas que DEVEM ser feitas antes de iniciar o projeto (ou uma nova feature importante)

O agente e o desenvolvedor humano devem responder estas perguntas antes de escrever código. As respostas devem estar documentadas em `projeto.md` ou `requisitos.md`.

### Sobre o produto
- [x] Qual é o problema real que o usuário resolve com esta feature? **Resposta: Registrar treinos de calistenia rapidamente com as mãos suadas/pressa durante o treino.**
- [x] Quem é o usuário? Qual é seu nível técnico e contexto de uso? **Resposta: Praticantes de calistenia que querem facilidade no registro sem planilhas complexas.**
- [x] Como o usuário descobre essa funcionalidade? **Resposta: Interface de chat do PWA na página inicial.**
- [x] O que acontece se a funcionalidade falhar? O usuário perde dados? **Resposta: Sem perda de dados locais; é exibida uma notificação de erro específica.**

### Sobre a conectividade e dados
- [x] O app funciona offline? **Resposta: Requer conexão para reconhecimento de voz e para a LLM (Gemini API).**
- [x] Os dados ficam locais? **Resposta: Sim, IndexedDB (Dexie.js) sem sincronização.**
- [x] Os dados precisam ser exportáveis? **Resposta: Não por enquanto.**

### Sobre a interface
- [x] Qual é a plataforma alvo? **Resposta: Web responsivo (PWA) — mobile e desktop.**
- [x] Qual o tema visual? **Resposta: Dark mode por padrão.**
- [x] Existe um design system ou paleta de cores definida? **Resposta: Tema 'Neon Calisthenics': Fundo chumbo (#0f172a), detalhes/botões em verde-esmeralda/neon (#10b981) e fonte moderna Inter.**
- [x] Qual é o tamanho mínimo de tela suportado? **Resposta: A partir de 320px (iPhone SE antigo).**

### Sobre a IA
- [x] O bot usa LLM real ou parser por regras? **Resposta: LLM via API.**
- [x] Qual LLM será usado? Gemini ou OpenAI? **Resposta: Google Gemini API.**
- [x] A API key virá de variável de ambiente (`.env`)? Quem gerencia? **Resposta: Painel de configurações no PWA onde o próprio usuário insere sua chave e seleciona o modelo de LLM (gemini-3-flash-preview, gemini-1.5-flash, gemini-1.5-pro ou customizado), sendo salvos localmente no navegador (localStorage).**
- [x] Existe limite de tokens/custo que precisa ser controlado? **Resposta: Como cada usuário usa sua própria chave, o controle de custos/tokens fica sob o plano da chave do usuário.**
- [x] O que o bot deve fazer quando a API estiver indisponível? **Resposta: Exibir feedbacks visuais específicos esclarecendo se é falha de internet do usuário ou erro na API/Chave do Gemini.**

### Sobre a voz
- [x] Qual API de voz? **Resposta: Web Speech API nativa.**
- [x] O usuário precisa pressionar um botão ou a escuta é contínua? **Resposta: Clique único no botão de microfone para iniciar e parar.**
- [x] A transcrição de voz precisa ser editável antes do envio? **Resposta: Sim, o áudio transcreve para o input do chat para que o usuário possa revisar e editar antes de clicar em Enviar.**

### Sobre o futuro
- [x] Quais features extras são desejáveis? **Resposta: Gráficos de progresso (volume semanal, exercícios frequentes) via Recharts.**
- [x] Existe previsão de versão mobile nativa (React Native)? **Resposta: Não.**
- [x] O app precisará de autenticação de usuário no futuro? **Resposta: Não, o escopo permanece local-only.**

---

## 📋 Checklist de qualidade para novas specs

Antes de considerar um arquivo de spec "pronto", verifique:

- [ ] Um desenvolvedor sem contexto consegue entender o que implementar?
- [ ] Todos os critérios de aceite são verificáveis (sim/não)?
- [ ] A feature referenciada existe no `feature_list.json`?
- [ ] Ferramentas necessárias estão listadas neste README?
- [ ] Perguntas em aberto estão marcadas com `[ ]` nas seções acima?
- [ ] Não há código ou detalhes de implementação nas specs?
