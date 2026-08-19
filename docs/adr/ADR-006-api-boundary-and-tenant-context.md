# ADR-006: API Boundary, Versioning and Tenant Context

## Status

Accepted

## Context

LekhaPulse exposes a REST API consumed by the React frontend and potentially future external integrations.

The API must provide a stable contract while protecting multi-tenant resources.

The API must distinguish authentication, tenant selection, authorization, validation, and business operations.

## Decision

LekhaPulse will expose a versioned REST API under:

/api/v1/

Django Ninja will be used as the API framework.

API endpoints will use resource-oriented URLs.

Initial resource groups:

/api/v1/auth/
/api/v1/organizations/
/api/v1/clients/
/api/v1/transactions/

## API Versioning

The API will use URL-based major versioning.

Example:

/api/v1/clients/

Future breaking changes may introduce:

/api/v2/clients/

Non-breaking changes will remain within the existing version.

## Tenant Context

Tenant context will be established from the authenticated user's organization membership.

The API will not trust an organization identifier merely because it was supplied by the client.

If an endpoint receives an organization identifier, the authenticated user must have a valid Membership for that organization.

The organization context will be passed explicitly into tenant-scoped business operations.

## Authorization

Authentication establishes the identity of the caller.

Membership establishes whether the caller can operate within an organization.

Role-based authorization determines whether the caller can perform a particular operation.

Object-level authorization ensures that requested resources belong to the active organization.

## Resource URLs

Tenant-owned resources will use resource-oriented endpoints.

Examples:

GET /api/v1/clients/
GET /api/v1/clients/{client_id}
POST /api/v1/clients/

GET /api/v1/transactions/
GET /api/v1/transactions/{transaction_id}
POST /api/v1/transactions/

Tenant filtering will be handled by the backend rather than relying solely on URL structure.

## Request Validation

Django Ninja/Pydantic schemas will validate incoming API data before it reaches domain logic.

API schemas will be separate from Django database models.

The API layer will therefore control the public contract without exposing database models directly.

## Response Schemas

Responses will use explicit schemas.

Database models will not automatically become public API contracts.

This allows internal database changes without unnecessarily breaking API consumers.

## Error Handling

The API will return consistent HTTP status codes and structured JSON error responses.

Examples:

400 - Invalid request
401 - Authentication required
403 - Authenticated but not authorized
404 - Resource not found within the accessible tenant
409 - Resource conflict
422 - Validation error
500 - Unexpected server error

Sensitive internal exception details will not be returned to clients in production.

## Business Logic

API handlers should remain thin.

The preferred flow is:

Request
→ Authentication
→ Tenant context
→ Authorization
→ Validation
→ Service/domain operation
→ Database
→ Response schema

Complex business logic should not accumulate inside route functions.

## Consequences

### Positive

- Stable API contract
- Clear tenant boundaries
- Explicit validation
- Better separation of concerns
- Easier frontend integration
- Easier future API evolution
- Easier automated testing

### Negative

- Additional schemas and layers
- More code than directly serializing Django models
- Developers must maintain API and database contracts separately

## Future Evolution

The API may later introduce:

- pagination
- filtering
- sorting
- rate limiting
- idempotency keys
- API keys for integrations
- webhooks
- OAuth/OIDC
- OpenAPI-based client generation
