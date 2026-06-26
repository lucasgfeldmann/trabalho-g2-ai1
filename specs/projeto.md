# Projeto — CalisBot

## Visão Geral

**CalisBot** é um chatbot de treinamento de calistenia que funciona como um assistente pessoal de academia no bolso. O usuário pode criar planos de exercício, registrar treinos rapidamente via texto ou áudio, e acompanhar seu histórico de atividades — tudo salvo localmente no dispositivo, sem necessidade de conta ou internet.

**Nome do projeto:** CalisBot
**Repositório:** https://github.com/lucasgfeldmann/trabalho-g2-ai1

---

## Contexto

Praticantes de calistenia precisam registrar seus treinos de forma rápida, geralmente enquanto estão se exercitando — com as mãos suadas, sem tempo para digitar muito. As soluções existentes são ou complexas demais (apps de academia completos) ou simples demais (planilhas). O CalisBot resolve isso com uma interface conversacional que aceita comandos rápidos por voz ou texto.

**Público-alvo:** Pessoas que praticam ou desejam iniciar calistenia (street workout, treino funcional com peso corporal).

---

## Objetivos

- [x] Configurar o ambiente de desenvolvimento (React + TypeScript + Vite)
- [ ] Criar a interface de chat (UI do chatbot)
- [ ] Implementar entrada de texto e áudio (Web Speech API)
- [ ] Criar e gerenciar planos de exercício via conversa
- [ ] Registrar exercícios realizados rapidamente via chat
- [ ] Salvar todos os dados localmente (IndexedDB / localStorage)
- [ ] Exibir histórico de treinos realizados
- [ ] Interpretar comandos de linguagem natural para registro de exercícios

---

## Escopo

### Dentro do escopo

- Interface de chat responsiva — web, mobile e desktop (320px a 1280px+)
- Tema Neon Calisthenics como padrão: Fundo chumbo (#0f172a), detalhes/botões em verde-esmeralda/neon (#10b981) e tipografia moderna (Inter)
- Entrada por texto e por áudio (Web Speech API / SpeechRecognition)
- Interpretação de linguagem natural via Gemini API (chave e modelo de LLM configurados no PWA pelo usuário final e armazenados localmente)
- Botões rápidos para consultar informações cadastradas (plano ativo, último treino)
- Criação e edição de plano de treino diretamente por IA conversacional (bot sugere criação/modificação com confirmação interativa do usuário)
- Registro rápido de exercícios durante o treino (ex: "fiz 15 flexões" ou "3 séries de muscle up")
- Histórico de treinos com data/hora e exercícios realizados
- Banco de dados local (IndexedDB via Dexie.js) — sem backend, sem conta
- Reconhecimento de exercícios de calistenia mais comuns
- Manutenção de contexto conversacional (sessão) com a API do Gemini
- Acesso e consulta da IA sobre plano ativo e histórico local do usuário
- Renderização e formatação de Markdown em tempo de execução nas bolhas do chat (incluindo tabelas)
- Barra de navegação inferior por abas (Chat, Histórico de Exercícios, Plano)
- Exportação e importação do histórico de treinos em formato CSV
- Visualização simplificada e rápida do plano ativo diário na aba de Plano
- Modos de visualização alternáveis no Histórico (Tabela tradicional e Cards otimizados para mobile)
- Fluxo de correção conversacional para operações pendentes de confirmação (treinos e planos) e cálculo automático de datas específicas no registro de exercícios
- Novos modelos oficiais do Gemini nas configurações da aplicação e botão de reset completo de todos os dados do navegador
- Foco em exercícios sem equipamentos e com o peso do corpo na criação e geração de planos de calistenia
- Bloqueio de entrada de texto e voz no chat durante as etapas obrigatórias de seleção do plano guiado
- Gráficos de progresso (volume por semana, exercícios mais feitos) — Marco M8

### Fora do escopo

- Sincronização com nuvem ou conta de usuário
- Exportação de dados em formatos complexos (JSON estruturado completo, PDF formatado)
- Integração com wearables (smartwatch, monitor cardíaco)
- Cálculo de calorias ou métricas nutricionais
- Social features (compartilhar treinos, ranking)
- Backend / API própria
- Versão nativa mobile (React Native)
- Armazenamento em nuvem ou banco de dados externo

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework UI | React 19 + TypeScript |
| Bundler | Vite 8 |
| Banco local | IndexedDB via Dexie.js |
| Entrada de voz | Web Speech API (SpeechRecognition) — clique único para gravar/parar, permitindo edição no input de chat antes de enviar |
| IA / LLM | Google Gen AI SDK (`@google/genai`) — Conexão com Gemini API (chave e modelo inseridos pelo usuário no painel local) |
| Testes | Vitest + @testing-library/react |
| Linter | Oxlint |
| Estilização | CSS Vanilla — Tema Neon Calisthenics, mobile-first |
| Gráficos (futuro) | Recharts |

---

## Fluxo Principal do Usuário

```
Usuário abre o app
       │
       ▼
  Tem plano ativo?
  ├── NÃO → Chatbot pergunta nível e objetivos → gera plano
  └── SIM → Exibe plano atual na lateral/drawer
       │
       ▼
  Tela de chat aberta
       │
  Usuário fala ou digita: "fiz 3x10 flexões"
       │
       ▼
  Chatbot interpreta e confirma: "Anotado! 3 séries de 10 flexões ✓"
       │
       ▼
  Exercício salvo no histórico do dia
       │
       ▼
  Usuário pode ver histórico, editar plano ou continuar registrando
```

---

## Estrutura de Dados (Banco Local)

### `plano_ativo`
```json
{
  "id": 1,
  "nome": "Plano Iniciante - Semana 1",
  "nivel": "iniciante",
  "criado_em": "2026-06-26",
  "dias": [
    {
      "dia_semana": "Segunda",
      "exercicios": [
        { "nome": "Flexão", "series": 3, "repeticoes": 10 },
        { "nome": "Agachamento", "series": 3, "repeticoes": 15 }
      ]
    }
  ]
}
```

### `historico_treinos`
```json
{
  "id": 1,
  "data": "2026-06-26",
  "hora_inicio": "07:30",
  "hora_fim": "08:15",
  "exercicios_realizados": [
    { "nome": "Flexão", "series": 3, "repeticoes": 10, "observacao": "" },
    { "nome": "Barra", "series": 2, "repeticoes": 6, "observacao": "ainda difícil" }
  ]
}
```

---

## Marcos / Milestones

| Marco | Descrição | Status |
|---|---|---|
| M1 | Configuração do ambiente (Vite + React + TS + testes) | ✅ Concluído |
| M2 | Interface de chat básica (UI + entrada de texto) | ⬜ Pendente |
| M3 | Entrada por áudio (Web Speech API) | ⬜ Pendente |
| M4 | Banco de dados local (Dexie.js) | ⬜ Pendente |
| M5 | Interpretação de comandos e registro de exercícios | ⬜ Pendente |
| M6 | Criação e exibição de plano de exercícios | ⬜ Pendente |
| M7 | Tela de histórico de treinos | ⬜ Pendente |
| M8 | Polimento visual e testes de integração | ⬜ Pendente |

---

## Links e Referências

- [feature_list.json](../feature_list.json) — Roadmap de features
- [AGENTS.md](../AGENTS.md) — Regras para agentes de código
- [requisitos.md](./requisitos.md) — Requisitos funcionais e não funcionais
- [criterios-aceite.md](./criterios-aceite.md) — Critérios de aceite por feature
