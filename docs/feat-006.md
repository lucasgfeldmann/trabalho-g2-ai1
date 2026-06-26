# feat-006 — Interface de Chat (UI)

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-005

---

## Objetivo

Construir a interface do chatbot responsiva e interativa (CalisBot) e o painel de configurações para gerenciamento local de API Keys e modelos do Gemini.

---

## O que foi implementado

- **Componente ChatWindow**: Painel de exibição de mensagens com bolhas alinhadas de forma diferente para o usuário (bolha chumbo e borda verde-neon) e para o bot (bolha escura contrastante). Possui barra de controle de voz (desabilitada por padrão) e botão de configurações.
- **Componente SettingsPanel**: Interface (modal com backdrop e animação de fade) para configurar a API Key do Gemini, selecionar o modelo (`gemini-3-flash-preview` por padrão, `gemini-1.5-flash`, `gemini-1.5-pro` ou customizado com input de texto).
- **Auto-scroll de Mensagens**: Rolagem automática e suave para a mensagem mais recente ao receber/enviar interações.
- **Persistência de Configurações**: Salvamento local seguro das configurações do Gemini em `localStorage`.
- **Mock de Resposta**: Simulação temporária de resposta do bot contendo a mensagem do usuário e o modelo configurado ativo.
- **Estilização Neon Calisthenics**: Centralizada no `index.css`, oferecendo um visual premium escuro responsivo desde 320px (iPhone SE antigo) até 1280px+ (desktop).

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/ChatWindow.tsx` | criado | Componente da janela de chat e fluxo de input |
| `src/components/SettingsPanel.tsx` | criado | Componente do modal de configurações de chaves/modelos |
| `src/App.tsx` | modificado | Integração principal dos componentes e gerenciador de estado |
| `src/index.css` | modificado | Estilização global com design system Neon Calisthenics |
| `src/App.css` | modificado | Arquivo esvaziado para não haver interferências |
| `src/test/App.test.tsx` | modificado | Testes do fluxo de chat, modal e localStorage |

---

## Decisões técnicas

- **Verificação de `scrollIntoView`**: Para evitar erros no ambiente JSDOM, adicionamos uma verificação antes de chamar o método nativo de animação de scroll, garantindo robustez caso executado em ambientes simulados ou navegadores legados.
- **Armazenamento no `localStorage`**: Escolhido para API Key e Escolha de Modelo por ser síncrono e simples de consultar no mount da aplicação, mantendo o escopo local e evitando exposição na nuvem.
- **Desativação de Input sem API Key**: Garante boa usabilidade, instruindo o usuário a configurar a chave de API antes de iniciar a conversa e exibindo alertas claros.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| Renderiza boas-vindas sem chave | `App.test.tsx` | ✅ pass |
| Abre e fecha painel de configurações | `App.test.tsx` | ✅ pass |
| Salva e limpa chave/modelo no localStorage | `App.test.tsx` | ✅ pass |
| Envia mensagem e recebe mock bot | `App.test.tsx` | ✅ pass |
| Renderiza lista de mensagens na ChatWindow | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
=== npm run lint ===
Found 0 warnings and 0 errors.

=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/App.test.tsx (5 tests) 679ms
Test Files  1 passed (1) | Tests  5 passed (5)
=== Verification Complete ===
```

---

## Como usar / Notas para o próximo agente

- A interface já possui âncoras para o botão de microfone (gravação por voz) com a classe `.mic-btn`. Ela deve ser ativada na próxima feature (`feat-007`).
- O estado de mensagens no `App.tsx` usa objetos do tipo `Message` (com `id`, `text`, `sender`, `timestamp`). Ao implementar o interpretador com LLM (`feat-008`), basta substituir a resposta simulada no `setTimeout` pela requisição real à Gemini API usando a biblioteca `@google/genai`.
