# ADR-004: Financial Transaction Domain Model

## Status

Accepted

## Context

LekhaPulse processes financial transactions belonging to accounting clients.

Transactions may originate from manual entry, CSV imports, accounting-system integrations, or future automated ingestion pipelines.

Transactions are later processed by the AI categorization pipeline.

The domain model must therefore support financial precision, tenant isolation, duplicate detection, auditability, and asynchronous processing.

## Decision

LekhaPulse will model the business hierarchy as:

Organization → Client → Transaction

Each Client belongs to exactly one Organization.

Each Transaction belongs to exactly one Client.

Transactions will use Django DecimalField for monetary values rather than floating-point numbers.

Transactions will store the original transaction description separately from any AI-generated categorization.

Transaction processing state will be represented explicitly using a status field.

Initial transaction statuses:

- PENDING
- PROCESSING
- AI_SUGGESTED
- CONFIRMED
- FAILED

AI suggestions will not overwrite the original transaction data.

The original transaction description will remain immutable after ingestion unless an explicit correction workflow is introduced.

Transactions will contain a source identifier where available to support idempotent imports and duplicate detection.

## Monetary Precision

Financial amounts will use fixed-point decimal storage.

Floating-point values will not be used for monetary amounts because binary floating-point arithmetic can introduce precision errors.

## Currency

Transactions will store an ISO-style currency code separately from the amount.

This allows LekhaPulse to support multi-currency clients in the future.

## Tenant Isolation

Transactions inherit tenant ownership through:

Transaction → Client → Organization

All transaction queries must therefore be scoped to the authenticated user's organization.

## AI Processing

AI categorization is treated as a processing step rather than the source of truth.

The original transaction remains preserved.

The AI system produces a suggestion that can later be accepted or rejected by an accountant.

## Idempotency

External source identifiers will be used where available to prevent duplicate transaction creation during retries or repeated imports.

Application-level checks will be supplemented by database constraints where the source system provides a stable identifier.

## Indexing

Indexes will be added based on actual query patterns.

Expected access patterns include:

- transactions by client
- transactions by organization
- transactions by transaction date
- transactions by processing status

Indexes will be introduced deliberately rather than indiscriminately.

## Consequences

### Positive

- Accurate monetary representation
- Clear tenant ownership
- AI suggestions remain distinguishable from accountant decisions
- Supports asynchronous processing
- Supports retry-safe ingestion
- Provides a foundation for future accounting integrations

### Negative

- More fields and state management than a simple CRUD transaction model
- AI processing introduces asynchronous workflow complexity
- Duplicate prevention depends partly on source-system quality
- Financial corrections require explicit audit-aware workflows

## Future Evolution

The transaction model may later evolve to include:

- accounting categories
- tax treatment
- journal entries
- reconciliation state
- attachments
- external accounting-system IDs
- immutable audit events
- transaction versioning
- database partitioning for very large tenants
