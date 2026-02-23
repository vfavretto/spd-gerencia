---
name: strict-code-quality-architecture-review
description: Enforce a strict code-quality gate for logic correctness, maintainability, Clean Code, Clean Architecture, and SOLID. Use when the user wants approval/reproval criteria before merge/deploy, zero-tolerance review for regressions, or a blocking technical audit.
---

# Strict Code Quality Architecture Review

## Overview
Apply a strict review gate. Prioritize defect prevention and architectural integrity over speed. Produce an explicit `PASS` or `FAIL` decision with blocking reasons.

## Strict Gate Workflow
1. Define scope and contracts.
- Inspect changed files plus impacted interfaces, DTOs, use cases, repositories, and tests.
- Validate contract compatibility (types, API payloads, persistence mappings).

2. Run blocking correctness checks.
- Block on logic bugs, regressions, invalid assumptions, unsafe casts, and broken edge cases.
- Block on data loss/corruption risks and inconsistent error semantics.

3. Run blocking architecture checks.
- Block on violations of dependency direction or layer leakage.
- Block when use-case/domain logic is coupled to transport/framework/ORM details.

4. Run SOLID/Clean Code checks.
- Block on SRP breaks that create multi-reason-to-change hotspots.
- Block on duplicated critical logic, low-cohesion abstractions, or opaque naming in core paths.

5. Validate test obligations.
- Block when behavior changed without tests for happy path, failure path, and key edge cases.
- Block when tests are brittle or assert implementation internals instead of behavior.

## Decision Policy
Output only one decision:
- `PASS`: no blocking findings.
- `FAIL`: at least one blocking finding exists.

Blocking severity rules:
- `Critical`: must fail immediately.
- `High`: fails unless fixed in the same change.
- `Medium/Low`: non-blocking, but include remediation plan.

## Output Contract
Use this exact structure:
- `Decision: PASS | FAIL`
- `Blocking Findings` (Critical/High only)
- `Non-Blocking Findings` (Medium/Low)
- `Required Fixes Before Merge`
- `Required Test Additions`
- `Residual Risks`

Keep each finding concrete: file path, issue, impact, and exact fix.

## Reference Usage
Load [references/strict-gate-checklist.md](references/strict-gate-checklist.md) for detailed blocking criteria and consistency checks.
