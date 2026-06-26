# feat-007 — Entrada por Áudio (Web Speech API)

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-006

---

## Objetivo

Permitir que o usuário dite comandos e registre exercícios por voz no CalisBot utilizando a API nativa do navegador (Web Speech API), integrando o texto transcrito ao campo de mensagem de chat.

---

## O que foi implementado

- **Integração com a Web Speech API**: Configuração do `SpeechRecognition` nativo do navegador para o idioma português do Brasil (`pt-BR`).
- **Comportamento por Clique Único**: Início e parada da gravação de áudio por clique único no botão do microfone.
- **Interim e Final Results**: Exibição dos resultados parciais e finais em tempo real diretamente no input de chat à medida que o usuário fala.
- **Edição da Transcrição**: O texto transcrito é depositado no input do chat, permitindo que o usuário altere ou edite manualmente o texto antes de clicar em "Enviar".
- **Estado de Gravação com Animação**: Animação de pulso neon vermelho e sombra brilhante na classe CSS `.mic-btn.recording` ao gravar.
- **Fallback e Degradação Graciosa**: O botão de microfone é desabilitado em navegadores sem suporte ao recurso (ex: Firefox sem flags) com uma mensagem informativa explicativa no tooltip (`title`).
- **Desativação Sem API Key**: O botão de microfone segue o estado do input principal e permanece bloqueado até que o usuário configure a API Key do Gemini.

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/components/ChatWindow.tsx` | modificado | Conexão do `SpeechRecognition` ao botão de microfone e atualização do input |
| `src/index.css` | modificado | Adição dos estilos e animação `@keyframes mic-pulse` para gravação ativa |
| `src/test/App.test.tsx` | modificado | Adição de teste unitário mockando o comportamento do reconhecimento de voz |

---

## Decisões técnicas

- **Uso do `window.webkitSpeechRecognition`**: Adicionada compatibilidade cruzada para navegadores baseados no WebKit (Safari, Chrome).
- **Testes de Integração com Mock**: Criado um mock simples da Web Speech API anexada ao objeto `window` simulado do JSDOM para testar se a transcrição assíncrona é injetada corretamente no input e os callbacks são chamados.
- **Abort em Unmount**: Limpeza do manipulador de áudio no ciclo de vida de desmontagem do componente (`useEffect` cleanup) para evitar vazamento de memória e interrupções inesperadas de recursos de hardware.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| Toggles recording & updates input | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
=== npm run lint ===
Found 0 warnings and 0 errors.

=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ App.test.tsx (6 tests)
Test Files  1 passed | Tests  6 passed
=== Verification Complete ===
```

---

## Como usar / Notas para o próximo agente

- Para testar no navegador, lembre-se de que a gravação requer acesso ao microfone, o qual costuma ser bloqueado pelo navegador se não estiver rodando em ambiente seguro (`localhost` ou `HTTPS`).
- O texto final é salvo no estado local `inputText` do componente `ChatWindow`.
- A próxima feature (`feat-008`) integrará esse input ao processamento com a Gemini API usando o SDK `@google/genai` instalado.
