# AGENTS.md

## Stack
- Use Node.js, Go, and gRPC.
- Do not introduce Python code or Python-specific conventions.
- Prefer protobuf-first APIs for service contracts.

## Design Rules
- Keep one responsibility per module.
- Keep one thing per function.
- Functions should usually be 4 to 20 lines.
- Split functions if they grow beyond one clear task.
- Keep files under 500 lines.
- Split files by responsibility, not by convenience.
- Prefer small focused modules over god files.
- Domain code must not import infrastructure code.
- External I/O must stay behind adapters.
- No direct DB or HTTP calls inside business logic.
- Time, randomness, and external calls must be injectable.
- Prefer deterministic functions when possible.
- Avoid hidden state.

## Types and Schemas
- Use explicit types everywhere.
- Do not use `any` or untyped functions.
- Do not pass raw dictionaries between layers.
- Validate at creation, not later.
- Prefer explicit schemas for input/output objects.
- Use clear, domain-specific names.
- Names must encode intent, not type.
- Avoid abbreviations unless they are domain-standard.
- Boolean names should read as predicates: `is_`, `has_`, `can_`.

## Control Flow
- Use guard clauses first.
- Prefer early returns over nested `if` blocks.
- Keep indentation shallow, with at most 2 nested levels in core logic.
- Prefer explicit code over clever code.
- No code duplication; extract shared logic into a function or module.

## Errors
- Error messages must include the offending value and the expected shape.
- Fail fast on invalid inputs.
- Keep parsing and validation errors close to the boundary.

## Go Guidance
- Keep packages small and purpose-driven.
- Prefer interfaces at boundaries, not everywhere.
- Use typed structs for request and response models.
- Keep gRPC transport code separate from domain services.
- Return explicit errors and wrap context when useful.

## Node Guidance
- Use TypeScript when possible.
- Prefer `interface` or `type` definitions for API shapes.
- Keep async I/O at the edge.
- Do not mix transport, orchestration, and domain logic in the same file.
- Use small modules for protobuf clients, adapters, and business rules.

## gRPC Guidance
- Keep proto files stable and minimal.
- Use unary methods for simple request/response flows.
- Use streaming only when the demo truly needs it.
- Define clear message shapes for file transfer and processing results.
- Keep server implementations thin; place real logic in domain services.

## Review Standard
- Check each change for naming, boundaries, typing, and duplication.
- Prefer the smallest change that preserves clarity.
- If a rule conflicts with the task, keep the architecture explicit and explain the tradeoff.
