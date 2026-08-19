# ADR-003: Identity and Organization Membership

## Status

Accepted

## Context

LekhaPulse is a multi-tenant B2B SaaS platform.

A user represents an individual identity and an organization represents an accounting business using LekhaPulse.

A user may need to belong to multiple organizations, potentially with different roles in each organization.

Therefore, user identity and organization membership must be modeled separately.

## Decision

LekhaPulse will use a custom Django User model with email as the primary authentication identifier.

Users will be connected to organizations through an explicit Membership model.

The relationship will be:

User → Membership → Organization

A user may belong to multiple organizations, and each membership will define the user's role within that organization.

Initial roles:

- OWNER
- ADMIN
- ACCOUNTANT
- VIEWER

A membership must be unique for each User + Organization combination.

## Rationale

Separating identity from organization membership allows:

- One user to belong to multiple organizations
- Different roles for the same user in different organizations
- Organization invitations
- Organization switching
- Future SSO integration
- Clear tenant boundaries
- Flexible RBAC evolution

Placing `organization_id` directly on the User model would incorrectly couple a global identity to a single tenant.

## Authentication

Email will be the primary login identifier.

Django's authentication framework will be reused rather than implementing custom password hashing or authentication infrastructure.

## Authorization

Authentication answers:

"Who is this user?"

Membership and roles answer:

"What can this user do inside this organization?"

Authorization will therefore be evaluated in the context of the active organization.

## Consequences

### Positive

- Clean separation of identity and tenancy
- Supports multi-organization users
- Supports organization-specific roles
- Simplifies future invitations and SSO
- Provides a strong foundation for RBAC

### Negative

- Requests must establish an active organization context
- Authorization logic becomes organization-aware
- Additional membership queries are required
- Tenant isolation must be tested carefully

## Future Evolution

The initial role model may evolve into granular permissions or custom organization roles if enterprise requirements justify it.

Authentication may later support external identity providers using OAuth2, OpenID Connect, or SAML without changing the core User → Membership → Organization relationship.
