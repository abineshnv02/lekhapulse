# LekhaPulse.io — System Overview

## Product

LekhaPulse.io is a B2B SaaS platform for accountants and bookkeepers.

The system assists with transaction categorization using:

1. Deterministic rules
2. AI-assisted classification
3. Confidence scoring
4. Human review
5. Audit history

## High-Level Architecture

React Frontend
        |
        | HTTPS / REST
        v
Django + Django Ninja
        |
        +---- PostgreSQL
        |
        +---- Redis
                  |
                  v
                Celery
                  |
                  v
              AI Provider

## Architectural Principle

AI provides recommendations.

The accountant remains the final decision maker.
