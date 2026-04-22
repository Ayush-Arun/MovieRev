# CineVault File Map

This document explains what each file in the repository is responsible for.

## Root-level files

- `.vscode/settings.json` - Workspace-specific editor settings for this project.
- `docker-compose.yml` - Orchestrates the Database, Backend API, and Frontend web-server for rapid production deployment.
- `CINEVAULT_ARCHITECTURE_GUIDE.md` - High-level architecture overview of the full CineVault system.
- `FILE_MAP.md` - Complete file-by-file responsibility map (this file).
- `PROJECT_PLAN.md` - Project planning notes, milestones, and implementation direction.
- `README.md` - Root project introduction and setup/run instructions.
- `TASK_LIST.md` - Task tracking checklist for development work.
- `WALKTHROUGH.md` - Step-by-step project walkthrough and usage flow.
- `instruction.md` - Custom project guidance/instructions used during development.
- `package-lock.json` - Lockfile for any root-level Node dependency resolution.

## Backend: build/config/meta

- `backend/Dockerfile` - Multi-stage build script binding Spring Boot with an Eclipse Temurin Runtime JVM.
- `backend/.gitignore` - Ignore rules for backend artifacts (build output, generated files, etc.).
- `backend/.idea/.gitignore` - IDE-specific ignore settings for backend IntelliJ project files.
- `backend/.idea/compiler.xml` - IntelliJ compiler configuration for backend module.
- `backend/.idea/encodings.xml` - IntelliJ file encoding settings for backend.
- `backend/.idea/jarRepositories.xml` - IntelliJ Maven/JAR repository metadata.
- `backend/.idea/misc.xml` - Miscellaneous IntelliJ backend project settings.
- `backend/.idea/vcs.xml` - IntelliJ VCS integration settings.
- `backend/package-lock.json` - Lockfile for any backend-side Node tooling dependencies.
- `backend/pom.xml` - Maven build file defining backend dependencies, plugins, and Java build config.
- `backend/README-TMDB-SYNC.md` - Notes and usage details for TMDB synchronization behavior.
- `backend/delombok.py` - Utility script related to Lombok processing/expanded-source handling.
- `backend/seed.sql` - Seed data script for initial backend database population.

## Backend: database scripts (`backend/db`)

- `backend/db/schema.sql` - Core database schema (tables, constraints, structure).
- `backend/db/views.sql` - Database views used for reporting/query convenience.
- `backend/db/fix_ratings.sql` - Data correction script for movie rating values.
- `backend/db/refine_movies.sql` - Data refinement script for movie records/cleanup.
- `backend/db/restore_accuracy.sql` - Script to restore canonical/accurate movie-related data.
- `backend/db/populate_major_cities.sql` - Inserts theatre/showtime data for major cities.
- `backend/db/populate_bangalore_truth.sql` - Bangalore-specific population/accuracy data script.

## Backend: Spring Boot entry/config

- `backend/src/main/java/com/cinevault/CineVaultApplication.java` - Spring Boot application entry point.
- `backend/src/main/java/com/cinevault/config/SecurityConfig.java` - Security filter chain, auth rules, and endpoint protection setup.
- `backend/src/main/java/com/cinevault/config/TmdbStartupConfig.java` - Startup configuration/triggers for TMDB sync behavior.
- `backend/src/main/resources/application.yml` - Environment/application properties (DB, JWT, API keys, server config).

## Backend: controllers (`backend/src/main/java/com/cinevault/controller`)

- `AdminController.java` - Admin-only API endpoints for privileged operations.
- `AuthController.java` - Authentication APIs (register, login, refresh, auth-related responses).
- `MovieController.java` - Movie listing/detail/search/filter APIs.
- `NotificationController.java` - Fetches unread system notifications broadcasted to the user.
- `PeopleController.java` - APIs for person/cast/crew related movie data.
- `ReviewController.java` - Review CRUD/read APIs tied to users and movies.
- `ShowtimeController.java` - APIs for showtime querying and management.
- `TheatreController.java` - APIs for theatre listing and theatre-level data.
- `UserController.java` - User profile, details API and setting mutation hooks.
- `WatchlistController.java` - APIs for watchlist add/remove/fetch operations.

## Backend: DTOs (`backend/src/main/java/com/cinevault/dto`)

- `AuthDtos.java` - Auth request/response DTOs used by authentication endpoints.
- `UserDtos.java` - Response mapping records for User metadata pipelines.

### TMDB DTOs (`backend/src/main/java/com/cinevault/dto/tmdb`)

- `TmdbResponse.java` - Generic TMDB response container model(s).
- `TmdbMovieDto.java` - TMDB movie payload mapping.
- `TmdbCreditsDto.java` - TMDB credits payload mapping (cast and crew).
- `TmdbReleaseDatesDto.java` - TMDB release dates/certification payload mapping.
- `TmdbReviewsDto.java` - TMDB reviews payload mapping.
- `TmdbVideosDto.java` - TMDB trailers/videos payload mapping.
- `TmdbWatchProvidersDto.java` - TMDB streaming/watch provider payload mapping.

## Backend: entities (`backend/src/main/java/com/cinevault/entity`)

- `Genre.java` - JPA entity for genre records.
- `Language.java` - JPA entity for movie language records.
- `Movie.java` - JPA entity for movies and their metadata/relationships.
- `Notification.java` - JPA entity storing system global/local alerts for users.
- `OttPlatform.java` - JPA entity for OTT/streaming platforms.
- `OtpToken.java` - Short life cycle email verification token container.
- `Person.java` - JPA entity for cast/crew/person records.
- `RefreshToken.java` - JPA entity for refresh token persistence.
- `Review.java` - JPA entity for user movie reviews.
- `Showtime.java` - JPA entity for theatre showtimes.
- `Theatre.java` - JPA entity for theatre data.
- `User.java` - JPA entity for application users/accounts.
- `Watchlist.java` - JPA entity for saved user watchlist entries.

## Backend: repositories (`backend/src/main/java/com/cinevault/repository`)

- `GenreRepository.java` - Data access interface for `Genre`.
- `MovieRepository.java` - Data access interface and custom queries for `Movie`.
- `NotificationRepository.java` - Data interface resolving notification fetches per user.
- `OttPlatformRepository.java` - Data access interface for `OttPlatform`.
- `OtpTokenRepository.java` - Token store access mechanism.
- `RefreshTokenRepository.java` - Data access interface for `RefreshToken`.
- `ReviewRepository.java` - Data access interface for `Review`.
- `ShowtimeRepository.java` - Data access interface for `Showtime`.
- `TheatreRepository.java` - Data access interface for `Theatre`.
- `UserRepository.java` - Data access interface and lookup methods for `User`.

## Backend: security (`backend/src/main/java/com/cinevault/security`)

- `CustomUserDetails.java` - Spring Security user principal wrapper.
- `CustomUserDetailsService.java` - Loads users for authentication from persistence layer.
- `JwtAuthenticationFilter.java` - Request filter that validates/parses JWT and sets auth context.
- `JwtUtil.java` - JWT creation, parsing, and validation helpers.

## Backend: services (`backend/src/main/java/com/cinevault/service`)

- `EmailService.java` - Integration protocol with SMTP handlers to send OTP links and system alerts.
- `TmdbSyncService.java` - Orchestration logic fetching TMDB data, building database schema states, and triggering System alerts.

## Frontend: build/config/meta

- `frontend/Dockerfile` - Map Vite build static assets onto Alpine Nginx via staged deployment.
- `frontend/nginx.conf` - Nginx proxy/routing logic for pushing fallback logic to index.html and proxying `/api` natively without CORS.
- `frontend/.gitignore` - Ignore rules for frontend build/cache artifacts.
- `frontend/README.md` - Frontend-specific setup, scripts, and local dev instructions.
- `frontend/eslint.config.js` - ESLint rules and linting behavior for frontend code.
- `frontend/index.html` - Vite HTML entry template for mounting the React app.
- `frontend/package.json` - Frontend scripts and dependency manifest.
- `frontend/package-lock.json` - Lockfile for frontend npm dependencies.
- `frontend/postcss.config.js` - PostCSS configuration (used by Tailwind/CSS pipeline).
- `frontend/tailwind.config.js` - Tailwind theme/content configuration.
- `frontend/vite.config.js` - Vite dev server/build configuration.

## Frontend: public assets (`frontend/public`)

- `frontend/public/favicon.svg` - Browser tab icon.
- `frontend/public/icons.svg` - Shared SVG icon sprite/static icon definitions.

## Frontend: source entry and global styles (`frontend/src`)

- `frontend/src/main.jsx` - React app bootstrap and root render call.
- `frontend/src/App.jsx` - App-level route/layout composition.
- `frontend/src/App.css` - App-scoped styling layer.
- `frontend/src/index.css` - Global CSS and Tailwind base/utilities imports.

## Frontend: API + context

- `frontend/src/api/axios.js` - Shared Axios client setup (base URL/interceptors/default headers).
- `frontend/src/context/AuthContext.jsx` - Global authentication state/context provider.
- `frontend/src/context/SidebarContext.jsx` - State engine resolving application-side navigation/slide-outs.

## Frontend: components (`frontend/src/components`)

- `AuthModal.jsx` - Login/register modal UI and auth form handling.
- `Carousel.jsx` - Reusable carousel/slider UI component for movie content.
- `HeroCarousel.jsx` - Hero/banner style carousel component for prominent home content.
- `Navbar.jsx` - Top navigation bar with links, auth actions, and app navigation controls.
- `ProtectedRoute.jsx` - Route guard component that restricts pages to authenticated users.

## Frontend: pages (`frontend/src/pages`)

- `Admin.jsx` - Admin dashboard/management page.
- `Home.jsx` - Landing/home page with featured and discoverable movie content.
- `MovieDetail.jsx` - Detailed movie page (metadata, reviews, providers, etc.).
- `Profile.jsx` - User profile/account page.
- `Settings.jsx` - Premium settings terminal regulating user aesthetics.
- `Showtimes.jsx` - Showtimes browsing page (city/theatre/time discovery).
- `Watchlist.jsx` - User watchlist management page.

## Frontend: bundled source assets (`frontend/src/assets`)

- `hero.png` - Hero section image asset used in UI.
- `react.svg` - React logo/static visual asset.
- `vite.svg` - Vite logo/static visual asset.
