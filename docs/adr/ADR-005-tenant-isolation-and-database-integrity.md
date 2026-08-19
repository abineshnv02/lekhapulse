# ADR-005: Tenant Isolation and Database Integrity

## Status

Accepted

## Context

LekhaPulse is a multi-tenant B2B SaaS platform.

Multiple accounting organizations share the same application and PostgreSQL database.

Each authenticated user may belong to one or more organizations through the Membership model.

Business data such as Clients and Transactions must never be accessible across organization boundaries.

The application must therefore enforce tenant isolation through explicit organization context and tenant-scoped database queries.

Database constraints and indexes must also protect important data invariants and support expected query patterns.

## Decision

LekhaPulse will use application-level tenant isolation combined with database-enforced integrity constraints.

Every authenticated business operation will execute within an explicit organization context.

Authorization will verify that the authenticated user has an active Membership for that organization before accessing tenant-owned resources.

Business queries will always be scoped to the organization context.

The application will never rely on object IDs alone to establish authorization.

For example, accessing a Client by ID is insufficient. The Client must also belong to the active organization.

## Tenant Ownership

The ownership hierarchy is:

Organization
→ Client
→ Transaction

A Client belongs directly to an Organization.

A Transaction belongs to a Client and therefore indirectly belongs to an Organization.

Tenant-aware queries will traverse this relationship when necessary.

## Database Integrity

Important business invariants will be enforced at the PostgreSQL level wherever practical.

The database will enforce:

- Unique user + organization membership
- Unique organization slug
- Referential integrity between related entities

Application-level validation will still be used for user-friendly error messages, but database constraints remain the final protection against invalid states and race conditions.

## Organization Context

The API will establish an active organization context before executing tenant-scoped business operations.

The organization context must be associated with the authenticated user through Membership.

A client-supplied organization identifier will never be trusted without membership validation.

## Authorization

Authentication answers:

"Who is the user?"

Tenant authorization answers:

"Does this user have access to this organization?"

Resource authorization answers:

"Does this resource belong to this organization?"

All three checks are distinct.

## Object-Level Authorization

An authenticated user must not gain access to a resource simply because they know its UUID.

For example:

GET /clients/{client_id}

must verify:

Client.organization == active_organization

The same principle applies to Transactions and future tenant-owned resources.

## Indexing Strategy

Indexes will be based on actual query patterns.

Expected queries include:

- Clients by organization
- Transactions by client
- Transactions by transaction date
- Transactions by processing status
- Transactions by source identifier

Indexes will be introduced only where they provide meaningful query performance benefits.

## Query Safety

The application will prefer tenant-scoped querysets such as:

Client.objects.filter(
    organization=organization
)

instead of retrieving an object globally and checking ownership afterward.

This reduces the chance of accidental cross-tenant access.

## Consequences

### Positive

- Strong tenant isolation
- Clear authorization model
- Database-backed integrity
- Reduced risk of IDOR vulnerabilities
- Predictable query patterns
- Foundation for horizontal scaling

### Negative

- Tenant context must be established for every business request
- Authorization logic becomes more explicit
- Additional joins may be required
- Developers must consistently use tenant-scoped querysets

## Future Evolution

If LekhaPulse reaches very large scale, tenant isolation may evolve toward:

- PostgreSQL Row-Level Security
- Tenant-specific database schemas
- Database-per-tenant isolation
- Partitioning
- Read replicas
- Dedicated enterprise data regions

These strategies will only be introduced when scale, compliance, or customer requirements justify their operational complexity.
