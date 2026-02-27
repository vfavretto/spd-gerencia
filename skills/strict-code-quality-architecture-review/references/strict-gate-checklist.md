# Strict Gate Checklist

## Blocking: Correctness
- Any proven logic bug in changed behavior.
- Any regression against existing contract/use-case expectation.
- Null/undefined/empty-path crash risk in realistic execution.
- Inconsistent HTTP/domain error behavior that changes client semantics.

## Blocking: Architecture
- Domain/use-case depending directly on framework/transport/ORM types.
- Cross-layer leakage that bypasses repository/use-case boundaries.
- New coupling that prevents isolated testing of business logic.

## Blocking: SOLID/Clean Code
- SRP breach in core classes (multiple unrelated responsibilities).
- Duplicate business rule in multiple locations without single source.
- Interface pollution (fat interfaces for unrelated consumers).
- Unsafe abstraction that violates substitutability.

## Blocking: Testing
- Changed behavior without coverage of happy/failure/edge paths.
- No regression test for a fixed production bug.
- Test suite cannot detect the identified high-risk failure mode.

## Non-Blocking (Must Report)
- Readability improvements (naming, extraction, simplification).
- Performance concerns without immediate correctness risk.
- Low-impact refactors that improve long-term maintainability.
