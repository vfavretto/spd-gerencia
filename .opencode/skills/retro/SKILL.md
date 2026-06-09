---
name: retro
description: Use ONLY when the user wants to run a retrospective for a completed battleplan (e.g., 'run retro for BP-007'). This skill closes the learning cycle and feeds the second-brain. Do NOT use for planning or coding.
---

# Retro — Retrospectiva de Battleplan

## Inicialização

Receber ID do battleplan (ex: `/retro BP-007`).

## Procedimento

1. Ler todos os handoffs YAML registrados durante a execução do battleplan
2. Identificar padrões de atrito:
   - Tarefas com `status: bloqueado`
   - Handoffs com `status: revisão necessária`
   - Gaps de tempo entre dependências consecutivas
3. Gerar documento de retrospectiva em `/home/victorvf/Documentos/SPD/spd-gerencia/docs/retro/YYYY-MM-DD_BP-XXX_retro.md`

## Estrutura do Documento

```markdown
# Retro: <título do battleplan> (BP-XXX)
**Data:** YYYY-MM-DD

## O que funcionou bem
## O que gerou atrito ou retrabalho
## Decisões que impactaram o fluxo
## Aprendizados para os próximos battleplans
## Ações de melhoria (opcional)
```

## Atualizações Obrigatórias

1. Atualizar `SUMMARY.md` do second-brain com insights mais relevantes (via diff)
2. Criar ou atualizar notas de padrão em `/Documentos/SPD/SPD-Second-Brain/patterns/`:
   - Se mesmo tipo de problema apareceu em 2+ retros → vira padrão documentado

## Regras

- O `/planner` consulta `/docs/retro/` e `/patterns/` ao iniciar qualquer novo planejamento
- Fluxo se torna progressivamente mais preciso com base no histórico real — não em boas práticas genéricas
- Respostas sem preamble
- Atualizações por diff
