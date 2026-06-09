---
name: planner
description: Use ONLY when the user wants to plan a new feature, task, or change to the SPD-Gerencia project. This skill drives the SDD + TDD planning phase and produces a battleplan. Do NOT use for coding or execution tasks.
---

# Planner — SDD + TDD Battleplan

## Filosofia

- **Spec before code:** nenhuma linha de código sem battleplan aprovado
- **Test before implementation:** testes especificados antes do código
- **Architecture before execution:** arquiteto valida antes de distribuir

## Procedimento

1. Conduzir brainstorming colaborativo de requisitos com o usuário
2. Carregar `SUMMARY.md` do second-brain para alinhamento
3. Carregar ADRs específicos sob demanda se impactarem a decisão
4. Consultar retrospectivas existentes em `/home/victorvf/Documentos/SPD/spd-gerencia/docs/retro/` para incorporar aprendizados
5. Estruturar o trabalho no esquema **SDD (Spec Development Driven)**
6. Incorporar princípios **TDD (Test Driven Development)**

## Output: Battleplan

Gerar documento em `/home/victorvf/Documentos/SPD/spd-gerencia/docs/battleplan/YYYY-MM-DD_<slug>.md` com estrutura obrigatória:

```markdown
# Battleplan: <título>
**ID:** BP-XXX
**Data:** YYYY-MM-DD
**Status:** draft | aprovado | em execução | concluído

## Contexto e Objetivo

## Impacto Arquitetural (ADRs relacionados)

## [agent: arquiteto] Decisões de Arquitetura

## [agent: frontend] Especificação Frontend

## [agent: backend] Especificação Backend

## [agent: qa] Casos de Teste e Critérios de Aceite

## Grafo de Dependências e Paralelismo

| ID      | Tarefa | Depende de | Agent     | Pode paralelizar com |
|---------|--------|------------|-----------|----------------------|
| TASK-01 | ...    | —          | arquiteto | —                    |
| TASK-02 | ...    | TASK-01    | backend   | TASK-03              |
| TASK-03 | ...    | TASK-01    | frontend  | TASK-02              |
| TASK-04 | ...    | TASK-02    | qa        | —                    |
```

## Restrições Críticas

- **NUNCA produzir ou sugerir código**
- Escopo termina no battleplan aprovado
- Execução é responsabilidade exclusiva da skill `/dev-team`
- Usar IDs para referenciar specs e ADRs (ex: `ADR-003`, `SPEC-012`) — nunca repetir conteúdo
