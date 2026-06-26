# feat-002 — Configurar Vite React TypeScript

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-001

---

## Objetivo

Criar o projeto React 19 com TypeScript via Vite 8, integrando as dependências ao harness existente sem perder os artefatos de controle.

---

## O que foi implementado

- Scaffolding com `create-vite` usando o template `react-ts`
- Dependências de produção: `react`, `react-dom`
- Dependências de desenvolvimento: `typescript`, `vite`, `@vitejs/plugin-react`, `oxlint`, `@types/react`, `@types/react-dom`
- Script `test` integrado ao `package.json` gerado pelo Vite
- Estrutura de pastas `src/`, `public/` criada

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/App.tsx` | criado | Componente raiz gerado pelo template |
| `src/main.tsx` | criado | Entry point da aplicação |
| `src/App.css` | criado | Estilos do componente App |
| `src/index.css` | criado | Estilos globais |
| `src/vite-env.d.ts` | criado | Tipos do Vite |
| `index.html` | criado | HTML de entrada do Vite |
| `vite.config.ts` | criado | Configuração do Vite |
| `tsconfig.json` | criado | Configuração raiz do TypeScript |
| `tsconfig.app.json` | criado | TS config para código da aplicação |
| `tsconfig.node.json` | criado | TS config para tooling (vite.config.ts) |
| `package.json` | modificado | Scripts e dependências do Vite React TS |
| `.gitignore` | criado | Ignora node_modules, dist, etc. |
| `.oxlintrc.json` | criado | Configuração do linter Oxlint |

---

## Decisões técnicas

- **create-vite com `--overwrite`**: Necessário pois o diretório já existia com os artefatos do harness. Os arquivos do harness foram preservados manualmente.
- **Script `test` mantido**: O `package.json` gerado pelo Vite não incluía script `test`. Foi adicionado para compatibilidade com o `init.sh`.

---

## Testes

| Teste | Resultado |
|---|---|
| `npm run dev` inicia sem erro | ✅ pass |
| `npm run build` gera bundle sem erro | ✅ pass |
| `./init.sh` completo | ✅ pass |

---

## Evidência de verificação

```
$ ./init.sh
=== npm install ===
added 27 packages, audited 28 packages in 23s
=== npm test ===
No tests specified yet
=== Verification Complete ===
```
