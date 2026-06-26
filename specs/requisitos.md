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

- **Descrição:** O sistema deve exibir uma tela de histórico com todos os treinos realizados em formato de tabela estruturada contendo colunas dedicadas: Data/Hora (contendo data e horário), Exercício (apenas nome limpo do exercício), Séries (apenas número de séries), Repetições (apenas número de repetições) e Observações (apenas a observação). A tabela deve ser ordenada cronologicamente de forma decrescente.
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

### RF-018 — Navegação por Abas Inferiores (Bottom Tabs)

- **Descrição:** O sistema deve fornecer uma barra de navegação inferior (bottom tabs) visível em todas as telas (abaixo do conteúdo principal), com as opções: Chat/Home, Histórico de Exercícios e Plano de Exercícios, permitindo alternar rapidamente entre estas visões.
- **Prioridade:** Alta
- **Feature relacionada:** feat-017

### RF-019 — Registro de Horário Individual por Exercício

- **Descrição:** Cada exercício registrado no histórico deve possuir seu horário de realização específico (HH:MM) salvo de forma simples no banco de dados local. Isso permite que o usuário registre diferentes exercícios em diferentes momentos do mesmo dia.
- **Prioridade:** Alta
- **Feature relacionada:** feat-017

### RF-020 — Filtro Diário no Histórico de Exercícios

- **Descrição:** A tela de histórico de exercícios deve exibir por padrão apenas os exercícios realizados no dia atual (hoje). O usuário deve ser capaz de selecionar uma data específica por meio de um seletor para consultar e filtrar o histórico daquele dia.
- **Prioridade:** Alta
- **Feature relacionada:** feat-017

### RF-021 — Exportação e Importação de Dados em CSV

- **Descrição:** Na tela de histórico, deve haver um botão de exportação que gera e baixa um arquivo no formato CSV contendo todos os treinos registrados (Data, Hora, Exercício, Séries, Repetições, Observações). Também deve existir a opção de importar dados do histórico a partir de um arquivo CSV nesse mesmo formato.
- **Prioridade:** Média
- **Feature relacionada:** feat-017

### RF-022 — Visualização do Plano do Dia Atual

- **Descrição:** A aba de Plano deve exibir a lista de exercícios programados para o dia de hoje, facilitando a consulta rápida pelo usuário durante o treino diário.
- **Prioridade:** Alta
- **Feature relacionada:** feat-017

### RF-023 — Alternância de Visualização Completa do Plano

- **Descrição:** Na aba de Plano, por padrão exibe-se apenas o treino correspondente ao dia de hoje. O sistema deve fornecer um botão de alternância que permita ao usuário visualizar o plano semanal completo (todos os dias cadastrados).
- **Prioridade:** Média
- **Feature relacionada:** feat-018

### RF-024 — Modos de Visualização do Histórico (Tabela/Cards)

- **Descrição:** Na aba de Histórico, deve haver controles visuais para alternar o modo de visualização entre Tabela (modo tabular corrido tradicional) e Cards (listagem estruturada em cartões otimizada para melhor legibilidade em dispositivos móveis).
- **Prioridade:** Média
- **Feature relacionada:** feat-019

### RF-025 — Opção de Correção Conversacional de Operação Pendente

- **Descrição:** Durante os fluxos de confirmação de registro de treinos ou planos de treino, o sistema deve fornecer uma opção de "Correção". O usuário pode informar a correção a ser feita em linguagem natural (ex: "mude barra para 12" ou "coloque ontem"). O sistema deve enviar essa alteração para a IA reprocessar o treino ou plano atualizado e retornar um novo pedido de confirmação/correção/cancelamento.
- **Prioridade:** Alta
- **Feature relacionada:** feat-020

### RF-026 — Reconhecimento e Cálculo de Datas no Registro de Treino

- **Descrição:** Ao registrar um treino via chat, o interpretador da IA deve identificar se o usuário mencionou uma data ou dia específico para o treino (ex: "ontem", "anteontem", "terça-feira passada"). O sistema deve calcular a data correspondente (com base na data atual e dia de hoje) e registrar o treino nessa data específica no banco de dados. Caso nenhuma data ou dia seja mencionado, o treino deve ser registrado com a data do dia atual (hoje).
- **Prioridade:** Alta
- **Feature relacionada:** feat-020

### RF-027 — Atualização de Modelos Gemini Disponíveis nas Configurações

- **Descrição:** O painel de configurações de IA do chatbot deve exibir e disponibilizar os seguintes modelos oficiais do Gemini para escolha do usuário: gemini-3.5-flash, gemini-3.1-flash-lite, gemini-3-flash-preview, gemini-flash-lite-latest, gemini-2.5-flash, gemini-2.5-flash-lite.
- **Prioridade:** Média
- **Feature relacionada:** feat-021

### RF-028 — Botão de Reset Completo da Aplicação

- **Descrição:** O painel de configurações deve conter um botão de "Reset Completo" que apaga todos os dados da aplicação armazenados no navegador (incluindo todas as tabelas do IndexedDB do Dexie e todas as chaves do localStorage) e recarrega a página de forma limpa.
- **Prioridade:** Alta
- **Feature relacionada:** feat-021

### RF-029 — Foco em Exercícios de Calistenia sem Equipamentos na Criação de Planos

- **Descrição:** O início do fluxo guiado de criação de planos de treino e o gerador de planos (Gemini API) devem enfatizar e focar estritamente em exercícios corporais de calistenia que não necessitam de equipamentos (peso corporal). Mensagens do chat e prompts enviados ao Gemini devem ser atualizados para garantir que nenhuma rotina exija pesos ou aparelhos externos complexos, usando apenas o próprio peso do corpo.
- **Prioridade:** Alta
- **Feature relacionada:** feat-022

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
