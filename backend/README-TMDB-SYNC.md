# Automated TMDB Synchronizer

The CineVault backend has been heavily upgraded to automatically pull data from The Movie Database (TMDB) rather than relying on unreliable web scraping.

## How it works automatically:
1. When you start the Spring Boot server (`mvn spring-boot:run`), a special file we created called `TmdbStartupConfig.java` is triggered.
2. This config intercepts the startup process and executes an automated synchronization sweep using your injected `api-key`.
3. It hits three different TMDB endpoints per movie:
   - Base details (Titles, Posters, Synopses)
   - `/credits` (To isolate exact Actors, Directors, and Character names)
   - `/reviews` (To pull system logs/critiques to calculate into the aggregate local rating)
4. It recursively merges all this data safely into your local PostgreSQL tables (`movies`, `movie_cast`, `movie_crew`, `reviews`, `people`).

Because of `TmdbStartupConfig.java`, **you never have to manually run an import script.** The database is guaranteed to always be populated whenever the backend boots up.

## Optional Manual Sync (For Admin Dashboards)
If you build an Admin Dashboard later and want a button to sync movies while the server is already running, you can connect your frontend button to this backend route:
`POST http://localhost:8080/api/admin/sync/bollywood`

*(Note: Triggering this manual route requires you to be logged in with an Admin JWT Token).*
