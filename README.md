# CineVault <span style="color:#ff706f">_</span>

A premium full-stack movie discovery platform featuring a stark, high-fidelity **"Glitch Noir"** aesthetic. Engineered with React, Spring Boot, and PostgreSQL.

CineVault autonomously scrapes the TMDB API to ingest global cinema metadata, seamlessly manages cross-platform Watchlists (merging guest tokens to authenticated state automatically), and pushes real-time global notifications the moment restricted metadata arrives in the vault.

## Architecture & Data Pipeline

*   **Frontend**: React + Vite + Tailwind CSS. Interface styled in raw monochrome and brutalist typography. Sessions are tracked via HTTP JWT Bearer interceptors, with `UUID`-based localStorage for ghost/guest cart persistence.
*   **Backend**: Java 17 + Spring Boot 3. Stateless REST API protected by Spring Security (JWT). Houses the `TmdbSyncService` which autonomously hydrates the DB with rich API metadata, automatically linking OTT logo streams via deep indexing.
*   **Database**: PostgreSQL 15+. 17 tightly mapped logic tables enforcing strict constraints. Pushes direct JDBC bulk alerts to user tables upon ingress of new movies.
*   **Remote Data**: Powered by the TMDB API. Includes robust content-filtering arrays to block inappropriate media before it touches the schema.

## Starting the Vault (Docker Compose)

The easiest and only supported production way to boot the entire CineVault infrastructure (Database, Backend API, Frontend Server) is using Docker Compose.

### 1. Configure the Environment
Ensure your configurations in `backend/src/main/resources/application.yml` have your **TMDB API Key** injected. Default database routing assumes `localhost:5432`, but Docker maps everything natively.

### 2. Ignite the Containers
From the root directory of the application:
```bash
docker-compose --build up -d
```

### 3. Access
* The **Frontend** runs on Nginx and is available at `http://localhost`.
* The **Backend** API proxy is mapped on `http://localhost:5000/api`.
* The **Database** will be auto-instantiated based on the `docker-compose.yml` mounts.

> Note: To tear down the system, use `docker-compose down`.

### Legacy Raw Boot
*(If you do not wish to use Docker)*
1. Start postgres manually on `5432` with a database named `cinevault`. Apply `backend/db/schema.sql`.
2. Enter `/backend` and run `./mvnw spring-boot:run`.
3. Enter `/frontend`, run `npm install` and `npm run dev`.
