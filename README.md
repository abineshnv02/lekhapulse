# LekhaPulse.io

LekhaPulse.io is a production-oriented B2B SaaS platform for accountants and bookkeepers.

The platform uses deterministic rules, AI-assisted transaction classification, confidence scoring, and human review to reduce repetitive transaction categorization work while keeping the accountant as the final decision maker.

## Architecture

- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Django 6 + Django Ninja
- Database: PostgreSQL 16
- Task Queue: Celery 5
- Broker/Cache: Redis 8
- AI: Google Gemini
- Deployment: Docker Compose (local production-like environment)

### Runtime architecture

```text
Browser
   |
   v
React + Nginx :3000
   |
   v
Django API :8000
   |\
   | \__ Redis :6379
   |          |
   |          v
   |       Celery worker
   |          |
   |          v
   |       Gemini API
   |
   v
PostgreSQL :5432
