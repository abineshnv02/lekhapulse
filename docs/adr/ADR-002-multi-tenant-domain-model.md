# ADR-002: Multi-Tenant Domain Model

## Status

Accepted

## Context

LekhaPulse is a B2B SaaS platform for accounting professionals.

Multiple accounting organizations will use the same application infrastructure while their business data must remain strictly isolated.

The platform must support:

- Multiple organizations
- Multiple users per organization
- Users potentially belonging to multiple organizations
- Organization-specific clients
- Organization-specific transactions
- Strong tenant isolation
- Efficient PostgreSQL operations
- Straightforward schema migrations
- Future horizontal scaling

## Decision

LekhaPulse will initially use a shared PostgreSQL database with a shared schema.

Tenant-owned entities will contain an explicit `organization_id` identifying their owning organization.

Users will be separate from organizations and connected through a Membership model.

The initial relationship is:

User → Membership → Organization

Organization-owned business entities will include:

- Client
- Transaction
- Categorization
- Import
- Audit records

Tenant isolation will be enforced through:

1. Authentication
2. Organization membership validation
3. Authorization
4. Tenant-scoped service/query boundaries
5. Database constraints where appropriate
6. Automated cross-tenant security tests

## Rationale

Shared-schema multi-tenancy provides the best balance of operational simplicity, cost efficiency, migration simplicity, and scalability for the initial SaaS stage.

Database-per-tenant provides stronger physical isolation but introduces significant operational overhead.

Schema-per-tenant provides stronger logical isolation but increases migration and operational complexity.

The architecture can evolve if future requirements justify stronger isolation.

## Consequences

### Positive

- Simple PostgreSQL deployment
- Simple Django migrations
- Efficient resource utilization
- Easy horizontal application scaling
- Straightforward analytics
- Supports users belonging to multiple organizations

### Negative

- Tenant isolation must be designed carefully
- Application bugs could potentially cause cross-tenant data exposure
- Requires dedicated tenant-isolation tests
- Large tenants may eventually require partitioning or stronger isolation

## Future Evolution

If tenant size, regulatory requirements, performance, or customer isolation requirements increase significantly, the platform may evolve toward:

- PostgreSQL partitioning
- Schema-per-tenant
- Database-per-tenant
- Dedicated infrastructure for enterprise tenants

Such changes will require a new ADR.
