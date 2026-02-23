# Review Checklist

## Correctness & Logic
- Validate business rules against existing use cases/contracts.
- Check null/undefined handling, empty collections, and optional fields.
- Verify date/time, numeric conversions, rounding, and unit assumptions.
- Confirm error handling paths preserve expected HTTP/status/domain semantics.

## Clean Code
- Use clear names for domain intent.
- Keep functions/classes focused on one concern.
- Remove duplication and dead code.
- Avoid hidden side effects and implicit coupling.

## SOLID
- SRP: each class/use case has one reason to change.
- OCP: prefer extension points over editing many call sites.
- LSP: derived/implementation behavior must respect contracts.
- ISP: interfaces should be minimal and role-specific.
- DIP: depend on abstractions, not concrete frameworks.

## Clean Architecture
- Preserve dependency direction toward domain/use cases.
- Keep transport/infrastructure concerns out of domain logic.
- Avoid leaking ORM, HTTP, or framework types into core business logic.
- Keep DTO/controller validation separate from use-case rules.

## Testing
- Cover happy path, failure path, and edge cases for changed logic.
- Assert behavior, not implementation details.
- Ensure tests fail for meaningful regressions.
