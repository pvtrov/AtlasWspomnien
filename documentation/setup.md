# Setup

## Local Tooling

The local development environment is designed to run through Docker. The host machine should only need:

- Git
- Docker
- Docker Compose

## Environment File

Create a local `.env` file based on `.env.example` before starting the stack.

The environment file is used by:

- the PostgreSQL container,
- the backend container,
- the frontend container.

For local frontend-to-backend communication, the backend CORS allow-list is also configured through the environment file.

Example:

```bash
CORS_ALLOW_ORIGINS=["http://localhost:3000"]
```

For backend package installation, the project environment may also define Python package index settings such as `UV_DEFAULT_INDEX`, `UV_INDEX`, and `PIP_INDEX_URL`.

The default project configuration is intended to use the official PyPI index.

## Start the Development Environment

Run:

```bash
docker compose up --build
```

This starts:

- the backend container,
- the frontend container,
- the PostgreSQL database container.

## Backend Commands Outside Docker

If backend package installation or test commands are run outside Docker and the local shell environment forces a company package mirror, explicitly target the official PyPI index for this project.

Use:

```bash
cd backend
unset UV_INDEX_URL UV_EXTRA_INDEX_URL PIP_INDEX_URL PIP_EXTRA_INDEX_URL

UV_DEFAULT_INDEX=https://pypi.org/simple \
UV_INDEX=https://pypi.org/simple \
PIP_INDEX_URL=https://pypi.org/simple \
uv sync --dev

UV_DEFAULT_INDEX=https://pypi.org/simple \
UV_INDEX=https://pypi.org/simple \
PIP_INDEX_URL=https://pypi.org/simple \
uv run pytest tests/test_health.py
```

This ensures local backend dependency resolution and test execution use the official PyPI index even when the wider machine environment is configured differently.

## Database Migration Commands

After backend dependencies are installed, run Alembic commands from `backend/`.

Example:

```bash
cd backend
unset UV_INDEX_URL UV_EXTRA_INDEX_URL PIP_INDEX_URL PIP_EXTRA_INDEX_URL

UV_DEFAULT_INDEX=https://pypi.org/simple \
UV_INDEX=https://pypi.org/simple \
PIP_INDEX_URL=https://pypi.org/simple \
uv run alembic upgrade head
```

This uses the backend environment configuration and the `DATABASE_URL` value to apply migrations against the configured PostgreSQL database.

## Current Development State

At this stage, Docker is the primary local development environment for the implemented Sprint 1 foundation.

That means:

- PostgreSQL is ready to run immediately,
- the backend FastAPI scaffold is implemented,
- the frontend Next.js scaffold is implemented,
- the frontend can perform a simple backend health-check request,
- the same Docker setup is intended to remain the main development workflow as the project grows.

## Intended Workflow

The project is being structured so that:

- backend development happens inside the backend container,
- frontend development happens inside the frontend container,
- database state is stored in a Docker volume,
- application source code remains in the repository and is mounted into containers during development.

## Planned Next Evolution

The next infrastructure step after application scaffolding may include:

- object storage for uploaded photos,
- additional development helpers,
- production-oriented container refinements when needed.
