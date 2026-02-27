---
name: code-quality-architecture-review
description: Review code for logic correctness, maintainability, and architectural quality. Use when the user asks to assess code quality, detect bugs/regressions, verify adherence to Clean Code, Clean Architecture, and SOLID, or request a technical review before merge/deploy.
---

# Code Quality Architecture Review

## Overview
Apply a structured code-review workflow focused on correctness first, then maintainability and architecture. Prioritize concrete findings with severity, evidence, and actionable fixes.

## Review Workflow
1. Inspect scope first.
- Read changed files and related interfaces/tests.
- Confirm expected behavior from use cases, controllers, and contracts.

2. Find correctness risks.
- Detect logic bugs, invalid assumptions, null/edge-case failures, and behavioral regressions.
- Verify data mapping, type safety, error handling, and API contract consistency.

3. Evaluate design quality.
- Check Clean Code: naming, cohesion, duplication, function/class size, readability.
- Check SOLID: single responsibility, extensibility, dependency direction, interface quality.
- Check Clean Architecture: boundaries between domain/use case/infrastructure/http, dependency inversion, leakage of framework details.

4. Verify safety nets.
- Ensure tests cover changed behavior and critical edge cases.
- Identify missing assertions, weak mocks, and untested failure paths.

5. Report in priority order.
- Output `Critical`, `High`, `Medium`, `Low` findings.
- For each finding include: file path, issue, impact, and exact remediation.
- If no issues are found, explicitly state that and list residual risks/gaps.

## Output Contract
Use this structure:
- `Findings` (ordered by severity)
- `Open Questions / Assumptions`
- `Suggested Fixes`
- `Test Gaps`

Keep findings specific and verifiable. Prefer evidence tied to concrete code locations and behavior.

## Reference Usage
Load [references/review-checklist.md](references/review-checklist.md) when you need a detailed checklist for Clean Code, Clean Architecture, and SOLID verification.
