# Atlas Wspomnien

Atlas Wspomnien is a web application for collecting, managing, and browsing historical photographs. The project combines a public archive experience with creator and administrator workflows for uploading, organizing, moderating, and exploring materials.

## Tech Stack

- FastAPI backend
- Next.js frontend
- PostgreSQL database
- Docker Compose for local development

## Repository Structure

- `backend/` - FastAPI application, API endpoints, business logic, database models, migrations, and tests
- `frontend/` - Next.js application, public archive views, creator flows, administrator views, and shared UI components
- `docker-compose.yml` - local multi-service setup for backend, frontend, and PostgreSQL

## Requirements

To run the project locally you need:

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:

```bash
git clone git@github.com:pvtrov/AtlasWspomnien.git
cd AtlasWspomnien
```

2. Create your local environment file:

```bash
cp .env.example .env
```

3. Start the application:

```bash
docker compose up --build
```

The first startup can take a while because:

- the backend installs Python dependencies with `uv`,
- runs Alembic database migrations,
- and starts the FastAPI development server,
- while the frontend installs Node dependencies and starts the Next.js development server.

## Application URLs

After startup, the main services are available at:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

## Optional: Create an Administrator Account

You can create the first administrator account or promote an existing user with:

```bash
docker compose exec backend sh -c 'UV_DEFAULT_INDEX=https://pypi.org/simple UV_INDEX=https://pypi.org/simple PIP_INDEX_URL=https://pypi.org/simple uv run python scripts/create_admin.py --email admin@example.com --username admin --password "change-me-now"'
```

Optional flag:

- `--update-password` updates the password if the target user already exists.

## Stopping the Project

To stop the containers:

```bash
docker compose down
```

## Notes

- Photo files are stored locally in `backend/storage`.
- Photo metadata, user accounts, categories, and moderation-related data are stored in PostgreSQL.
- Local configuration can be adjusted through `.env`.
