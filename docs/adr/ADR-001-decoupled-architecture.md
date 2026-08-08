# ADR-001: Decoupled Frontend and Backend

## Status

Accepted

## Context

LekhaPulse.io is a B2B SaaS product that requires an independent
frontend and backend architecture.

The frontend must be able to evolve independently from the backend API.

## Decision

We will use:

- React 19 + TypeScript for the frontend
- Django 6 + Django Ninja for the backend
- REST APIs as the communication boundary

The frontend will not directly access PostgreSQL.

## Consequences

### Positive

- Independent frontend/backend deployment
- Clear API boundary
- Easier scaling
- Easier testing
- Better separation of concerns
- Potential future mobile clients

### Negative

- More deployment complexity
- CORS configuration required
- API versioning becomes important
- Authentication crosses an API boundary

## Principle

The frontend communicates with the backend through explicit APIs.
