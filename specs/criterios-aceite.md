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
- [ ] Existe um botão/ícone de configurações na interface para abrir a gestão de API Key e Modelo
- [ ] Painel de configurações abre como modal ou aba lateral, contendo campo para API Key e um seletor de Modelo (dropdown com gemini-1.5-flash, gemini-1.5-pro e campo de texto para modelo customizado)
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
