# feat-003 — Verification Coverage

**Status:** completed
**Concluída em:** 2026-06-26
**Depende de:** feat-002

---

## Objetivo

Estabelecer um pipeline de verificação completo com linting (oxlint), type checking (tsc) e testes unitários (Vitest), garantindo que qualquer regressão seja detectada automaticamente a cada `./init.sh`.

---

## O que foi implementado

- Vitest configurado com ambiente `jsdom` para testes de componentes React
- `@testing-library/react`, `@testing-library/jest-dom` e `jsdom` instalados
- Arquivo de setup `src/test/setup.ts` importando `jest-dom`
- 4 testes de integração para o componente `App`
- Script `typecheck` adicionado ao `package.json`
- Script `test` atualizado para `vitest run`
- `init.sh` atualizado com pipeline: lint → typecheck → test

---

## Arquivos criados / modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/test/setup.ts` | criado | Importa `@testing-library/jest-dom` globalmente |
| `src/test/App.test.tsx` | criado | 4 testes do componente App |
| `vite.config.ts` | modificado | Adicionado bloco `test` com jsdom e setup |
| `tsconfig.node.json` | modificado | Adicionado `vitest/globals` aos tipos |
| `package.json` | modificado | Scripts `typecheck` e `test` atualizados |
| `init.sh` | modificado | Pipeline: install → lint → typecheck → test |

---

## Decisões técnicas

- **`defineConfig` de `vitest/config`**: Necessário porque o Vitest v3+ não reconhece o campo `test` quando `defineConfig` é importado de `vite` diretamente. Usar `vitest/config` resolve o erro de tipo `TS2769`.
- **jsdom como ambiente**: Simula o DOM do browser nos testes sem necessidade de browser real.
- **`vitest/globals` no tsconfig.node.json**: Necessário para que o TypeScript reconheça `describe`, `it`, `expect` como globais no arquivo de configuração.

---

## Testes

| Teste | Arquivo | Resultado |
|---|---|---|
| Renderiza o título "Get started" | `App.test.tsx` | ✅ pass |
| Renderiza botão de contador em 0 | `App.test.tsx` | ✅ pass |
| Incrementa contador ao clicar | `App.test.tsx` | ✅ pass |
| Renderiza seções Documentation e Social | `App.test.tsx` | ✅ pass |

---

## Evidência de verificação

```
$ ./init.sh
=== npm run lint ===
Found 0 warnings and 0 errors.
Finished in 31ms on 10 files with 103 rules.

=== npm run typecheck ===
(sem erros)

=== npm test ===
✓ src/test/App.test.tsx (4 tests) 104ms
Test Files  1 passed (1) | Tests  4 passed (4)

=== Verification Complete ===
```
