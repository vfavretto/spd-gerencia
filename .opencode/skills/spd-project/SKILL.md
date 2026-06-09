---
name: spd-project
description: Use ONLY when the user needs a quick overview of the SPD-Gerencia project, asks about project status, or references the project context. Do NOT use for general coding tasks unrelated to this project.
---

# SPD Project — Leitura Rápida

## Health Check (executar antes de qualquer resposta)

1. Verificar `SUMMARY.md` em `/Documentos/SPD/SPD-Second-Brain/SUMMARY.md`
2. Verificar data de última modificação (mais de 7 dias → `[⚠️ DESATUALIZADO]`)
3. Contar ADRs com status `proposto` em `/Documentos/SPD/SPD-Second-Brain/ADRs/` (mais de 3 → `[⚠️ X ADRs pendentes]`)
4. Listar arquivos em `/home/victorvf/Documentos/SPD/spd-gerencia/docs/battleplan/` com status `em execução` (existe algum → `[⚠️ Battleplan em aberto]`)

## Procedimento

1. Carregar **apenas** `SUMMARY.md` do second-brain
2. Apresentar resumo do estado atual: o que está feito, em andamento, próximos passos
3. Responder dúvidas com base no `SUMMARY.md`
4. Se a pergunta exigir profundidade, carregar nota específica sob demanda (nunca carregar tudo)
5. Se não souber a resposta, sinalizar `[não documentado]`

## Regras

- Nunca assumir contexto que não esteja documentado
- Nunca carregar notas completas sem necessidade explícita
- Nunca reescrever `SUMMARY.md` — apenas diffs/append
- Respostas sem preamble: direto ao output
