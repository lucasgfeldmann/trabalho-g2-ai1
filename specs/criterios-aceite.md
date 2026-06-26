# Critérios de Aceite — CalisBot

> Cada critério deve ser verificável objetivamente (sim/não). Use-os para preencher `"evidence"` no `feature_list.json`.

---

## feat-001 · Project Setup ✅

- [x] `./init.sh` executa sem erros
- [x] `npm install` instala dependências sem conflitos
- [x] `npm test` retorna exit code 0

---

## feat-002 · Configurar Vite React TypeScript ✅

- [x] `npm run dev` inicia o servidor de desenvolvimento
- [x] `npm run build` gera o bundle sem erros
- [x] Arquivos `.tsx` compilam sem erros de TypeScript

---

## feat-003 · Verification Coverage ✅

- [x] `npm run lint` retorna 0 erros e 0 warnings
- [x] `npm run typecheck` sem erros de tipo
- [x] `npm test` executa ao menos 1 teste e todos passam
- [x] `init.sh` inclui lint → typecheck → test no pipeline

---

## feat-004 · Documentation Update ✅

- [x] `README.md` contém stack, comandos, estrutura e harness

---

## feat-005 · Cleanup and Handoff ✅

- [x] Todas as features com `"status": "completed"` no `feature_list.json`
- [x] Commit final realizado com mensagem descritiva
- [x] `./init.sh` passa do zero

---

## feat-006 · Interface de Chat (UI)

- [ ] Tela de chat renderiza com histórico de mensagens visível
- [ ] Campo de texto e botão "Enviar" presentes e funcionais
- [ ] Mensagens do usuário aparecem alinhadas à direita (bolha chumbo escuro com borda/accent verde-neon)
- [ ] Mensagens do bot aparecem alinhadas à esquerda (bolha escura contrastante)
- [ ] Interface é usável em tela de 320px (mobile antigo) sem scroll horizontal
- [ ] Ao enviar uma mensagem, o scroll desce automaticamente para a última mensagem
- [ ] O layout possui header e footer (campo de entrada/botões) fixos e não roláveis, permitindo scroll vertical apenas dentro do contêiner de mensagens
- [ ] Existe um botão/ícone de configurações na interface para abrir a gestão de API Key e Modelo
- [ ] Painel de configurações abre como modal ou aba lateral, contendo campo para API Key e um seletor de Modelo (dropdown com gemini-3-flash-preview, gemini-1.5-flash, gemini-1.5-pro e campo de texto para modelo customizado)
- [ ] O painel permite salvar e deletar as configurações (API Key e Modelo) no localStorage
- [ ] Teste: componente `ChatWindow` renderiza e exibe mensagens corretamente
- [ ] Teste: painel de configurações salva e apaga a chave e o modelo com sucesso
- [ ] `./init.sh` passa após a implementação

---

## feat-007 · Entrada por Áudio (Web Speech API)

- [ ] Botão de microfone visível na interface de chat
- [ ] Ao pressionar o botão (clique único), a gravação de voz inicia (indicador visual de gravação ativo)
- [ ] O texto transcrito aparece no campo de entrada do chat após o reconhecimento
- [ ] O usuário pode editar o texto transcrito no input antes de pressionar "Enviar" manualmente
- [ ] Ao pressionar novamente ou identificar silêncio prolongado, a gravação para
- [ ] Em browser sem suporte a SpeechRecognition, o botão fica desabilitado com tooltip explicativo
- [ ] Teste: mock da Web Speech API retorna transcrição e ela aparece no input
- [ ] `./init.sh` passa após a implementação

---

## feat-008 · Registro de Exercícios via Chat

- [ ] Caso a API Key do Gemini não esteja configurada, o bot instrui o usuário a configurá-la no painel e impede o envio
- [ ] Em caso de falha de conexão/rede, o bot exibe mensagem explicando que o usuário está offline
- [ ] Em caso de erro na chamada do Gemini (ex: chave inválida), exibe erro avisando problema com a chave ou cota
- [ ] Mensagens de erro de conexão, offline ou chave inválida exibem um botão "Tentar Novamente" que re-processa o comando anterior ao ser clicado
- [ ] Mensagem `"fiz 3x10 flexões"` é interpretada como: exercício=Flexão, séries=3, repetições=10
- [ ] Mensagem `"15 barras"` é interpretada como: exercício=Barra, séries=1, repetições=15
- [ ] Mensagem `"3 séries de 8 muscle up"` é interpretada corretamente
- [ ] Variações ortográficas são aceitas: "flexao", "flexão", "push up", "pushup"
- [ ] Bot confirma o que entendeu antes de salvar: *"Entendi: 3x10 Flexão. Confirma?"*
- [ ] Ao confirmar (sim/botão de confirmar), o exercício é salvo no banco local (IndexedDB)
- [ ] Ao negar (não/botão de cancelar), o bot pede para o usuário repetir o comando
- [ ] Exercício salvo aparece no histórico do dia atual
- [ ] Teste unitário: parser reconhece os formatos listados acima
- [ ] Teste: fluxo de tratamento de erro de rede e API Key vazia funciona
- [ ] `./init.sh` passa após a implementação

---

## feat-009 · Criação e Gestão do Plano de Exercícios

- [ ] Ao abrir o app pela primeira vez (sem plano), o bot pergunta: nível, dias/semana e objetivos
- [ ] Bot gera e exibe um plano de exercícios baseado nas respostas
- [ ] Plano é salvo no banco local e persiste após fechar e reabrir o app
- [ ] O plano ativo é exibível via comando no chat (ex: "ver meu plano")
- [ ] Ao criar novo plano, bot confirma substituição do anterior
- [ ] Teste: geração de plano para perfil "iniciante, 3 dias, força" retorna exercícios válidos
- [ ] Teste: plano salvo persiste no banco mockado entre renders
- [ ] `./init.sh` passa após a implementação

---

## feat-010 · Histórico de Treinos

- [ ] Existe uma tela/seção de histórico acessível a partir do chat
- [ ] Histórico exibe treinos agrupados por data (mais recente primeiro)
- [ ] Cada sessão exibe: data, hora de início, lista de exercícios e séries realizadas
- [ ] Histórico persiste após fechar e reabrir o app
- [ ] Sessão sem exercícios não aparece no histórico
- [ ] Teste: componente de histórico renderiza corretamente dados mockados
- [ ] Teste: exercícios do dia atual aparecem na sessão de hoje
- [ ] `./init.sh` passa após a implementação

---

## feat-011 · Contexto da Conversa (Sessão)

- [ ] A API do Gemini recebe o histórico completo da conversa atual (turnos alternados de `user` e `model`).
- [ ] O histórico da conversa é filtrado para remover mensagens com erro (`isError: true`) ou mensagens temporárias de carregamento.
- [ ] Múltiplos turnos consecutivos do mesmo autor (`user` ou `bot`) são agrupados/mesclados para garantir que os papéis estritamente alternem (`user`, `model`, `user`, `model`...).
- [ ] O parser reconhece pronomes e referências com base na mensagem anterior (ex: se o usuário diz "fiz 3x10 flexões" e depois diz "e mais 5", o bot interpreta "mais 5" como flexões).
- [ ] Teste unitário e de integração cobrem a passagem do histórico e resolução de pronomes/contexto.
- [ ] `./init.sh` passa após a implementação.

---

## feat-012 · Consulta de Dados Locais pela IA

- [ ] A chamada para a API do Gemini recebe dados contextuais atualizados obtidos do IndexedDB (`plano_ativo` e `historico_treinos`).
- [ ] O contexto enviado contém a data atual e o dia da semana atual do dispositivo do usuário.
- [ ] A IA responde a perguntas sobre o plano ativo do usuário (exercícios, séries e repetições) usando as informações repassadas.
- [ ] A IA responde a perguntas sobre o histórico de exercícios realizados (treino de hoje, de ontem, de um dia específico, etc.) de forma precisa.
- [ ] Testes unitários/integração validam que os dados do IndexedDB são lidos, injetados no prompt e processados corretamente pelo parser da IA.
- [ ] `./init.sh` passa após a implementação.

---

## feat-013 · Formatador de Respostas em Markdown

- [ ] Mensagens do bot contendo negrito (`**texto**`) são renderizadas usando a tag `<strong>`.
- [ ] Mensagens do bot contendo itálico (`*texto*`) são renderizadas usando a tag `<em>`.
- [ ] Mensagens do bot contendo listas (`- item` ou `* item`) são renderizadas em uma estrutura de `<ul>` e `<li>`.
- [ ] Mensagens do bot contendo títulos (`#`, `##`, `###`) são renderizadas em `<h2>`, `<h3>` ou `<h4>`.
- [ ] Mensagens do bot contendo código inline (`` `código` ``) são renderizadas usando a tag `<code>`.
- [ ] Estilização em `src/index.css` define cores neon para as tags `<code>` e marcadores de listas customizados (`::before`).
- [ ] Testes automatizados verificam que o componente `MarkdownRenderer` transforma as strings de markdown nas tags JSX correspondentes de forma correta.
- [ ] `./init.sh` passa após a implementação.

---

## feat-014 · Suporte a Tabelas no Markdown

- [ ] Tabelas do Markdown (linhas contendo `|` separando colunas) são identificadas e agrupadas pelo parser.
- [ ] O parser ignora ou processa a linha separadora/alinhamento (ex: `|---|---|`).
- [ ] A primeira linha da tabela é renderizada como cabeçalho (`<thead>` e `<th>`).
- [ ] As linhas seguintes da tabela são renderizadas como corpo (`<tbody>`, `<tr>` e `<td>`).
- [ ] Estilos em `src/index.css` fornecem um layout de tabela premium: bordas finas neon, linhas alternadas (zebra striping) e espaçamento elegante.
- [ ] Cabeçalhos de tabela (`<th>`) e células (`<td>`) não sofrem quebra de linha inadequada ou sobreposição de caracteres em telas estreitas ou bolhas de chat (usando `white-space: nowrap` e `word-break: normal`).
- [ ] Testes unitários validam a renderização de tabelas com diferentes colunas e conteúdo de texto.
- [ ] `./init.sh` passa após a implementação.

---

## feat-015 · Criação e Edição de Planos via IA

- [ ] A IA reconhece pedidos em linguagem natural livre no chat para criar um novo plano (ex: "crie um plano iniciante de 3 dias") ou para editar o plano ativo (ex: "adicione dips na segunda").
- [ ] No caso de criação, a IA retorna um JSON contendo `action: "create_plan"` e o novo `planoGeral` estruturado.
- [ ] No caso de edição, a IA utiliza o plano ativo fornecido em seu contexto, realiza as modificações solicitadas e retorna `action: "edit_plan"` e o `planoGeral` modificado completo.
- [ ] O app exibe o plano criado/atualizado com botões rápidos "Confirmar Plano" e "Cancelar".
- [ ] Ao clicar em "Confirmar Plano" (ou digitar "sim"), o plano é persistido na tabela `plano_ativo` do IndexedDB.
- [ ] Ao clicar em "Cancelar" (ou digitar "não"), a ação é descartada e o plano existente permanece inalterado.
- [ ] Testes de unidade e integração cobrem a criação e a edição de planos via chamada estruturada do Gemini.
- [ ] `./init.sh` passa após a implementação.

---

## feat-016 · Estruturação do Histórico de Exercícios em Tabela Limpa

- [ ] A tela de histórico (`HistoryPanel.tsx`) exibe os treinos em uma tabela geral corrida contendo as colunas: Data/Hora, Exercício, Séries, Repetições e Observações.
- [ ] A coluna Data/Hora exibe a data formatada (`DD/MM/AAAA`) seguida do horário de início (`HH:MM`) (ex: `25/06/2026 às 18:00`).
- [ ] A coluna Exercício exibe somente o nome do exercício (sem o emoji 💪 e sem a observação).
- [ ] As colunas Séries e Repetições exibem apenas os números puros correspondentes.
- [ ] A coluna Observações exibe somente a observação do exercício (ou `-` se não houver).
- [ ] A tabela utiliza os estilos visuais premium equivalentes às tabelas neon do aplicativo (como bordas neon finas, zebra striping e sem quebras de linha indesejadas).
- [ ] Os testes de renderização do `HistoryPanel` em `App.test.tsx` são adaptados para validar essa nova estrutura de colunas e dados.
- [ ] `./init.sh` passa após a implementação.

---

## feat-017 · Abas de Navegação Inferiores, Registro de Horário e Importação/Exportação CSV

- [ ] A interface exibe uma barra de navegação por abas inferiores no rodapé contendo os botões "Chat", "Histórico" e "Plano".
- [ ] Alternar entre as abas carrega as respectivas seções: a tela do Chat assistente, a tela do Histórico de Exercícios e a tela do Plano Ativo.
- [ ] A aba "Histórico" exibe por padrão apenas os treinos realizados na data de hoje.
- [ ] A aba "Histórico" possui um seletor de data que permite filtrar os treinos por uma data específica. Há uma opção/botão de limpar filtro ("Ver Todos") para listar todo o histórico.
- [ ] A aba "Histórico" exibe cada exercício com sua hora de realização específica (`hora_realizacao`), permitindo visualizar múltiplos treinos divididos durante o dia.
- [ ] A aba "Histórico" contém um botão "Exportar CSV" que gera e faz download de um arquivo contendo todas as sessões de exercícios no formato CSV (`Data,Hora,Exercício,Séries,Repetições,Observações`).
- [ ] A aba "Histórico" contém um input de arquivo para "Importar CSV" que lê o mesmo formato de arquivo CSV, agrupa os exercícios por data e mescla ou insere no IndexedDB.
- [ ] A aba "Plano" exibe o plano ativo estruturado. Se não houver plano ativo, apresenta uma mensagem convidando a criar um plano.
- [ ] Cada exercício listado na aba "Plano" exibe seu nome, séries e repetições de forma simplificada e legível.
- [ ] Testes de unidade/integração validam a lógica de filtragem, importação/exportação CSV e a reatividade das abas e renderização do plano.
- [ ] `./init.sh` passa após a implementação.

---

## feat-018 · Filtro Diário no Plano de Treinos e Alternância de Visualização Completa

- [ ] Por padrão, a aba de Plano exibe apenas o treino correspondente ao dia de hoje.
- [ ] Se o plano não possuir treinos cadastrados para o dia da semana de hoje, exibe uma mensagem de dia de descanso: "Hoje é seu dia de descanso! 🧘".
- [ ] A aba de Plano possui um botão ou controle de alternância para ver o plano completo.
- [ ] Ao ativar o modo completo, o app exibe a lista com todos os dias do plano semanal cadastrado.
- [ ] Testes cobrem o comportamento de filtragem padrão por dia e a alternância para visualização completa.
- [ ] `./init.sh` passa após a implementação.

---

## feat-019 · Modos de Visualização no Histórico (Tabela e Cards)

- [ ] A aba de Histórico exibe botões de alternância para selecionar entre o modo de visualização "Tabela" e "Cards".
- [ ] O modo "Tabela" exibe a tabela HTML tradicional de treinos com colunas dedicadas.
- [ ] O modo "Cards" exibe cada exercício realizado em um cartão individual com estilo premium, adequado para smartphones.
- [ ] Cada cartão exibe o nome do exercício em destaque, data/hora, séries, repetições e observações.
- [ ] Testes de integração validam a alternância de modos e a renderização do formato de cards.
- [ ] `./init.sh` passa após a implementação.

---

## feat-020 · Correção Conversacional de Operações e Reconhecimento de Datas no Registro de Treino

- [ ] Nos fluxos de confirmação de treino e de plano via chat, o bot oferece opções de "Confirmar", "Corrigir" e "Cancelar" (via botões ou por texto).
- [ ] Ao escolher "Corrigir" ou enviar uma frase de correção, o bot permite que o usuário digite o que deseja corrigir (seja data, séries, repetições, exercícios ou observações).
- [ ] O sistema envia a correção solicitada e o objeto original pendente para o Gemini reprocessar, exibindo o treino ou plano atualizado e perguntando novamente pela confirmação/correção/cancelamento.
- [ ] No registro de treinos, o bot identifica se o usuário especificou datas relativas (ex: "ontem", "anteontem", "terça-feira passada") ou absolutas na mensagem de treino, calculando e registrando o treino na data correspondente no histórico.
- [ ] Caso nenhuma data ou dia seja mencionado, o treino é registrado com a data do dia atual (hoje).
- [ ] Testes cobrem o cálculo correto de datas e o fluxo de correção conversacional de treinos.
- [ ] `./init.sh` passa após a implementação.

---

## feat-021 · Novos Modelos Gemini e Botão de Reset Completo

- [ ] O painel de configurações exibe no select de modelos as opções: `gemini-3.5-flash`, `gemini-3.1-flash-lite`, `gemini-3-flash-preview`, `gemini-flash-lite-latest`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, além da opção "Outro (Modelo customizado)".
- [ ] O painel de configurações exibe um botão de "Reset Completo da Aplicação" ou equivalente.
- [ ] Ao clicar no botão de reset, todos os dados locais do aplicativo armazenados no navegador são apagados (localStorage limpo, tabelas do IndexedDB limpas) e a página recarregada.
- [ ] Testes validam a presença dos novos modelos no select de configurações e a funcionalidade do botão de reset de dados.
- [ ] `./init.sh` passa após a implementação.

---

## feat-022 · Foco em Exercícios sem Equipamentos na Criação de Planos

- [ ] O texto do fluxo guiado de criação de plano no chat de boas-vindas inicial explicita que o plano gerado será voltado para exercícios de calistenia sem equipamentos (peso corporal).
- [ ] O texto de confirmação ou reinicialização de criação de plano do chatbot também menciona que o plano gerado será sem equipamentos.
- [ ] O prompt do gerador de planos no Gemini API (`generateCalisthenicsPlan` e `parseUserMessage`) exige e instrui explicitamente a IA a gerar planos de calistenia utilizando apenas o peso corporal, excluindo equipamentos pesados ou complexos de academia.
- [ ] Testes validam que as mensagens de fluxo contêm a menção a exercícios sem equipamentos.
- [ ] `./init.sh` passa após a implementação.

---





## Template para novas features

```markdown
## feat-XXX · [Nome da Feature]

- [ ] [Comportamento observável 1]
- [ ] [Comportamento observável 2]
- [ ] [Caso de erro tratado]
- [ ] Teste unitário/integração cobre os casos acima
- [ ] `./init.sh` passa após a implementação
```

### Boas práticas

| ✅ Bom critério | ❌ Ruim |
|---|---|
| `Mensagem "fiz 10 flexões" é salva com nome="Flexão", séries=1, reps=10` | `Registro de exercício funciona` |
| `Botão de microfone fica vermelho durante a gravação` | `Áudio funciona` |
| `Plano persiste após fechar e reabrir o app (localStorage/IndexedDB)` | `Dados são salvos` |
