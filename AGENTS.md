# AGENTS.md

Project harness for reliable agent-assisted development in a node codebase.

## Startup Workflow

Before writing code:

1. **Confirm working directory** with `pwd`
2. **Read this file** completely
3. **Read project docs if present** (`specs/projeto.md`, `specs/requisitos.md`, `specs/criterios-aceite.md`, README, or equivalent)
4. **Run `./init.sh`** to verify environment is healthy
5. **Read `feature_list.json`** to see current feature state
6. **Review recent commits** with `git log --oneline -5`

If baseline verification is failing, repair that first before adding new scope.

## Working Rules

- **One feature at a time**: Pick exactly one unfinished feature from `feature_list.json`
- **Verification required**: Don't claim done without running verification commands
- **Update artifacts**: Before ending session, update `progress.md` and `feature_list.json`
- **Stay in scope**: Don't modify files unrelated to the current feature
- **Leave clean state**: Next session must be able to run `./init.sh` immediately
- **Auto-document features**: Immediately after completing a feature, create `docs/feat-XXX.md` using the template in `docs/TEMPLATE.md`. Documentation is mandatory — a feature without its doc file is not done.
- **Passo a passo de teste**: Sempre que implementar e concluir uma feature, passe um guia passo a passo claro e objetivo contendo instruções manuais para o usuário validar o comportamento visual e funcional da funcionalidade no navegador.
- **Atualização de Documentação de Requisitos**: Sempre que receber uma tarefa que seja um requisito do sistema, o agente deve obrigatoriamente atualizar o arquivo de requisitos (`specs/requisitos.md`), revisar se o arquivo de projetos (`specs/projeto.md`) está condizente e também criar/atualizar os critérios de aceite (`specs/criterios-aceite.md`).
- **Planejamento de Features Prévio**: Nunca codifique ou desenvolva qualquer funcionalidade sem antes escrever a respectiva feature para implementar/desenvolver no arquivo `feature_list.json`.

## Required Artifacts

- `feature_list.json` — Feature state tracker (source of truth)
- `progress.md` — Session continuity log
- `init.sh` — Standard startup and verification path
- `session-handoff.md` — Optional, for larger sessions
- `docs/feat-XXX.md` — Feature documentation (one file per completed feature)
- `docs/TEMPLATE.md` — Template used to generate feature docs

## Definition of Done

A feature is done only when ALL of the following are true:

- [ ] Target behavior is implemented
- [ ] Required verification actually ran (tests / lint / type-check)
- [ ] Evidence recorded in `feature_list.json` or `progress.md`
- [ ] `docs/feat-XXX.md` created using `docs/TEMPLATE.md`
- [ ] Repository remains restartable from standard startup path

## End of Session

Before ending a session:

1. Update `progress.md` with current state
2. Update `feature_list.json` with new feature status
3. **Create `docs/feat-XXX.md`** for every feature completed this session
4. Record any unresolved risks or blockers
5. Commit with descriptive message once work is in safe state
6. Leave repo clean enough for next session to run `./init.sh` immediately

## Verification Commands

```bash
# Full verification (recommended)
./init.sh
```

Required checks:
- `npm install`
- `npm test`

## Escalation

If you encounter:
- **Architecture decisions**: Consult project architecture docs if present, otherwise ask user
- **Unclear requirements**: Check product/requirements docs if present, otherwise ask user
- **Repeated test failures**: Update progress, flag for human review
- **Scope ambiguity**: Re-read `feature_list.json` for definition of done
