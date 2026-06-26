# Requisitos — CalisBot

## Requisitos Funcionais

### RF-001 — Interface de Chat

- **Descrição:** O sistema deve exibir uma interface de conversa (chat) com histórico de mensagens, campo de entrada de texto e botão de envio.
- **Prioridade:** Alta
- **Feature relacionada:** feat-006

### RF-002 — Entrada por Texto

- **Descrição:** O sistema deve aceitar mensagens de texto digitadas pelo usuário e processar comandos de registro de exercício e criação de plano.
- **Prioridade:** Alta
- **Feature relacionada:** feat-006

### RF-003 — Entrada por Áudio

- **Descrição:** O sistema deve aceitar comandos de voz usando a Web Speech API (SpeechRecognition) com acionamento por clique único (iniciar/parar). O texto transcrito deve preencher o campo de entrada do chat, permitindo revisão e edição manual pelo usuário antes do envio.
- **Prioridade:** Alta
- **Feature relacionada:** feat-007

### RF-004 — Criação de Plano de Exercícios

- **Descrição:** O sistema deve guiar o usuário via chat para criar um plano de calistenia personalizado, perguntando nível (iniciante / intermediário / avançado), dias disponíveis por semana e objetivos (força, resistência, habilidades).
- **Prioridade:** Alta
- **Feature relacionada:** feat-009

### RF-005 — Exibição do Plano Ativo

- **Descrição:** O sistema deve exibir o plano de exercícios ativo do dia atual, destacando quais exercícios já foram registrados e quais ainda faltam.
- **Prioridade:** Alta
- **Feature relacionada:** feat-009

### RF-006 — Registro Rápido de Exercício

- **Descrição:** O sistema deve interpretar mensagens em linguagem natural para registrar exercícios. Exemplos aceitos:
  - `"fiz 3x10 flexões"`
  - `"15 barras"`
  - `"3 séries de 8 muscle up"`
  - `"fiz agachamento 4 vezes 12"`
- **Prioridade:** Alta
- **Feature relacionada:** feat-008

### RF-007 — Confirmação de Registro

- **Descrição:** Após interpretar um exercício, o chatbot deve confirmar o que foi entendido antes de salvar. Ex: *"Entendi: 3 séries de 10 flexões. Confirma? (sim/não)"*
- **Prioridade:** Média
- **Feature relacionada:** feat-008

### RF-008 — Histórico de Treinos

- **Descrição:** O sistema deve exibir uma tela de histórico com todos os treinos realizados em formato de tabela estruturada contendo colunas de Data, Exercício, Séries e Repetições, ordenados do mais recente ao mais antigo.
- **Prioridade:** Alta
- **Feature relacionada:** feat-010 / feat-016

### RF-009 — Persistência Local

- **Descrição:** O sistema deve salvar todos os dados (plano ativo, histórico de treinos) no dispositivo do usuário usando IndexedDB (via Dexie.js). Os dados devem persistir entre sessões (fechamento e reabertura do app).
- **Prioridade:** Alta
- **Feature relacionada:** feat-008 / feat-009

### RF-010 — Edição e Remoção de Plano

- **Descrição:** O usuário deve poder, via chat, substituir o plano ativo por um novo ou editar exercícios do plano existente.
- **Prioridade:** Média
- **Feature relacionada:** feat-009

### RF-011 — Biblioteca de Exercícios de Calistenia

- **Descrição:** O sistema deve reconhecer e catalogar os exercícios mais comuns de calistenia, incluindo: flexão, flexão diamante, archer push-up, barra, muscle up, dip, L-sit, handstand, agachamento, pistol squat, lunge, prancha, hollow body.
- **Prioridade:** Média
- **Feature relacionada:** feat-008

### RF-012 — Painel de Configurações da API Key e Modelo

- **Descrição:** O sistema deve fornecer uma interface de configurações (como um modal ou aba lateral) acessível a partir da tela principal, permitindo ao usuário:
  - Inserir, salvar localmente (via localStorage) e testar sua API Key do Google Gemini.
  - Selecionar o modelo de LLM do Gemini a ser utilizado através de um dropdown (com opções padrão: `gemini-3-flash-preview`, `gemini-1.5-flash` e `gemini-1.5-pro`, sendo `gemini-3-flash-preview` o padrão).
  - Digitar um ID de modelo customizado caso escolha a opção "Outro/Customizado".
  - Salvar ambas as configurações no armazenamento local para serem utilizadas nas chamadas da API.
- **Prioridade:** Alta
- **Feature relacionada:** feat-006 / feat-008

### RF-013 — Manutenção de Contexto da Conversa (Sessão)

- **Descrição:** O sistema deve manter o histórico e contexto da conversa atual com o Gemini, garantindo que o bot consiga responder e interpretar novos comandos com base nas mensagens anteriores enviadas durante a mesma sessão.
- **Prioridade:** Alta
- **Feature relacionada:** feat-011

### RF-014 — Acesso da IA a Dados Locais (Plano e Histórico)

- **Descrição:** O assistente de IA deve ser capaz de responder a perguntas do usuário sobre seu plano de treino ativo e seu histórico de exercícios realizados. O sistema deve recuperar essas informações do banco de dados local e repassá-las no contexto de chamada da API do Gemini.
- **Prioridade:** Alta
- **Feature relacionada:** feat-012

### RF-015 — Renderização de Markdown no Chat

- **Descrição:** As respostas do bot enviadas no chat devem ser apresentadas com formatação Markdown apropriada (negrito, itálico, listas, títulos e códigos inline) renderizada como HTML/JSX amigável no lugar de texto puro.
- **Prioridade:** Média
- **Feature relacionada:** feat-013

### RF-016 — Suporte a Tabelas em Markdown

- **Descrição:** O componente de renderização de Markdown no chat deve ser capaz de reconhecer e formatar tabelas do Markdown (formato com pipes `|` e traços `-`) em elementos HTML de tabela (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`).
- **Prioridade:** Média
- **Feature relacionada:** feat-014

### RF-017 — Criação e Edição de Planos via IA Conversacional

- **Descrição:** O usuário deve ser capaz de solicitar à inteligência artificial, em linguagem natural livre, que crie um novo plano ou edite o plano ativo atual (ex: adicionar, remover ou modificar séries/repetições de um exercício de um dia da semana). A IA deve retornar o plano atualizado de forma estruturada e o sistema deve exibir uma tela de confirmação para salvar as alterações no IndexedDB local.
- **Prioridade:** Alta
- **Feature relacionada:** feat-015

---





## Requisitos Não Funcionais

### RNF-001 — Mobile-First

- **Descrição:** A interface deve ser projetada prioritariamente para telas a partir de 320px (iPhone SE antigo/pequenos displays) e funcionar perfeitamente em até 1280px (desktop).
- **Prioridade:** Alta

### RNF-002 — Velocidade de Registro

- **Descrição:** O registro de um exercício (da fala/digitação até a confirmação salva) deve ocorrer em menos de 3 segundos.
- **Prioridade:** Alta

### RNF-003 — Tolerância a Falhas e Conectividade

- **Descrição:** A interface do PWA, o banco de dados local (IndexedDB) e a exibição de históricos/planos devem funcionar sem conexão de rede. Caso o usuário tente registrar um treino ou criar um plano via chat e ocorra falha de rede ou com a API do Gemini, o sistema deve exibir uma notificação visual clara detalhando o erro (ex: 'Sem conexão com a internet' ou 'Erro ao se comunicar com a API do Gemini') e fornecer um botão de "Tentar Novamente" para re-processar a última entrada sem necessidade de redigitação.
- **Prioridade:** Alta

### RNF-004 — Usabilidade com as Mãos Livres

- **Descrição:** Deve ser possível registrar um exercício completo apenas com voz, sem precisar tocar na tela após pressionar o botão de microfone.
- **Prioridade:** Alta

### RNF-005 — Feedback Visual Imediato

- **Descrição:** O chatbot deve responder ao usuário em menos de 500ms após o envio da mensagem (processamento local).
- **Prioridade:** Média

### RNF-006 — Acessibilidade

- **Descrição:** Botões e campos devem ter labels acessíveis. Contraste mínimo WCAG 2.1 AA. Suporte a navegação por teclado.
- **Prioridade:** Média

### RNF-007 — Layout de Tela Fixado e Scroll Interno

- **Descrição:** O layout do aplicativo deve manter o Header (título do bot e botões de atalho) e o Footer (barra de input do chat e botões de opções rápidas) fixados nas extremidades da viewport. A rolagem da página inteira (viewport principal do browser) deve ser desabilitada, permitindo que apenas o contêiner interno das mensagens do chat possua barra de scroll vertical.
- **Prioridade:** Alta

---

## Regras de Negócio

### RN-001 — Um plano ativo por vez

- **Descrição:** O usuário só pode ter um plano de exercícios ativo. Criar um novo plano substitui o anterior (com confirmação).
- **Impacto:** Simplifica a lógica de exibição e registro.

### RN-002 — Sessão de treino por dia

- **Descrição:** Os exercícios registrados são agrupados por data. Múltiplos registros no mesmo dia pertencem à mesma sessão.
- **Impacto:** O histórico é organizado por dia de treino.

### RN-003 — Interpretação tolerante a erros

- **Descrição:** O parser de linguagem natural deve aceitar variações ortográficas comuns (ex: "flexao", "fleção", "push up", "pushup") e abreviações (ex: "barra = pull up").
- **Impacto:** Reduz atrito no registro rápido.

### RN-004 — Confirmação antes de salvar

- **Descrição:** Exercícios registrados via comando de linguagem natural exigem confirmação do usuário antes de serem persistidos no banco.
- **Impacto:** Evita registros incorretos por erros de transcrição de voz.

### RN-005 — Guardrail de Domínio (Foco em Calistenia)

- **Descrição:** O chatbot não deve responder a perguntas ou processar comandos que sejam completamente fora do escopo de calistenia, treinos funcionais ou saúde relacionada à prática de atividades físicas. Caso o usuário envie mensagens sobre outros assuntos (ex: política, culinária comum, piadas gerais, etc.), o chatbot deve responder com uma mensagem padrão, educada, reforçando que seu propósito exclusivo é ajudar com treinos de calistenia.
- **Impacto:** Evita desperdício de tokens, mantém o foco do produto e impede o uso indevido do assistente de IA.

---

## Glossário

| Termo | Definição |
|---|---|
| Calistenia | Modalidade de exercício físico que usa o peso do próprio corpo como resistência |
| Plano ativo | O conjunto de exercícios definidos para a semana atual do usuário |
| Sessão de treino | Conjunto de exercícios realizados em um mesmo dia |
| Série | Conjunto de repetições de um exercício sem descanso (ex: "3 séries de 10") |
| Repetição | Uma execução completa de um movimento (ex: uma flexão) |
| Muscle up | Exercício avançado que combina barra e dip em um único movimento |
| Dip | Exercício de tríceps/peitoral realizado em barras paralelas |
| L-sit | Posição isométrica onde o corpo forma um "L" suspenso |
| Handstand | Parada de mão (posição invertida equilibrada nos punhos) |
