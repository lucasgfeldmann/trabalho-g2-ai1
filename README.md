# trabalho-g2-ai1

Aplicação web moderna construída com **React 19**, **TypeScript** e **Vite**, desenvolvida com um harness de agentes de código para garantir qualidade, rastreabilidade e continuidade entre sessões.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework UI | React 19 |
| Linguagem | TypeScript 6 |
| Bundler / Dev Server | Vite 8 |
| Testes | Vitest + @testing-library/react |
| Linter | Oxlint |
| Gerenciador de Pacotes | npm |

---

## 📁 Estrutura do Projeto

```
trabalho-g2-ai1/
├── public/               # Assets estáticos
├── src/
│   ├── test/
│   │   ├── setup.ts      # Configuração global do Vitest (jest-dom)
│   │   └── App.test.tsx  # Testes do componente App
│   ├── App.tsx           # Componente raiz
│   ├── main.tsx          # Entry point da aplicação
│   └── vite-env.d.ts     # Tipos do Vite
├── AGENTS.md             # Instruções para agentes de código
├── feature_list.json     # Roadmap de features (fonte da verdade)
├── progress.md           # Log de progresso da sessão
├── session-handoff.md    # Template de handoff entre sessões
├── init.sh               # Script de verificação do ambiente
├── vite.config.ts        # Configuração do Vite + Vitest
├── tsconfig.json         # Configuração raiz do TypeScript
├── tsconfig.app.json     # TS config para o código da aplicação
└── tsconfig.node.json    # TS config para arquivos de tooling
```

---

## 🚀 Comandos Disponíveis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento com HMR
npm run dev
```

### Verificação (Pipeline Completo)

```bash
# Executa: install → lint → typecheck → testes
./init.sh
```

### Comandos Individuais

```bash
# Instalar dependências
npm install

# Rodar linter (oxlint)
npm run lint

# Verificar tipos (TypeScript)
npm run typecheck

# Rodar testes (Vitest)
npm test

# Build de produção
npm run build

# Preview do build de produção
npm run preview
```

---

## 🧪 Testes

Os testes utilizam **Vitest** com **@testing-library/react** e **jsdom** para simular o ambiente do browser.

```bash
# Rodar todos os testes uma vez
npm test

# Rodar testes em modo watch (durante o desenvolvimento)
npx vitest
```

Os arquivos de teste ficam em `src/test/` com extensão `.test.tsx`.

---

## 🤖 Harness de Agentes

Este repositório usa um harness estruturado para desenvolvimento assistido por agentes de IA:

- **[AGENTS.md](AGENTS.md)**: Regras e fluxo de trabalho para agentes
- **[feature_list.json](feature_list.json)**: Estado atual das features (fonte da verdade)
- **[progress.md](progress.md)**: Log de continuidade entre sessões
- **[init.sh](init.sh)**: Ponto de entrada para verificação do ambiente

Para iniciar uma nova sessão de desenvolvimento, sempre execute:

```bash
./init.sh
```

---

## 📋 Definição de Pronto (Definition of Done)

Uma feature só é considerada concluída quando:

1. O comportamento alvo foi implementado
2. `./init.sh` rodou sem erros (lint + typecheck + testes)
3. Evidências registradas em `feature_list.json` e `progress.md`
4. Repositório permanece restartável via `./init.sh`
