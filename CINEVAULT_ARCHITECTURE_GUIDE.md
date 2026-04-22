# CineVault: Technical Architecture & Feature Guide

This document provides a detailed breakdown of the CineVault system, explaining the core technologies, data pipelines, and architectural decisions made to ensure 100% data accuracy and a premium user experience.

---

## 🏗️ 1. Project Overview
CineVault is a full-stack movie review and booking platform built with the **"Glitch Noir"** aesthetic. It prioritizes **high-integrity data**, ensuring that every movie, rating, and cast member displayed is accurate and sourced directly from the The Movie Database (TMDB).

**Tech Stack:**
- **Backend**: Spring Boot, Spring Data JPA, Spring Security (JWT).
- **Frontend**: React (Vite), Tailwind CSS.
- **Database**: PostgreSQL with custom triggers and full-text search.
- **DevOps**: Docker Multi-Container Architecture (Nginx + Spring Boot + Postgres).

---

## 🔄 2. The TMDB Ingestion Pipeline
The heart of CineVault is the `TmdbSyncService`. This service handles the bridge between external movie data and our local database.

### How Movie Data is Fetched:
1.  **Multiple Sync Strategies**:
    - **Hollywood Sync**: Fetches top English-language movies with high vote counts.
    - **Indian Regional Sync (Bolly/South)**: Targeted fetching for Hindi, Tamil, Telugu, Malayalam, and Kannada films.
    - **Historical Sync ("Best of Decade")**: Automatically fetches the highest-rated films from 2015 to 2024.
2.  **Deep Detail Sync**:
    - For every movie identified, the system makes three additional API calls:
        - `/movie/{id}`: Detailed metadata (synopsis, runtime, budget).
        - `/movie/{id}/credits`: To extract the top 10 actors and the Director.
        - `/movie/{id}/images`: To fetch high-resolution posters (fallbacks generated instantly).
3.  **Global Notification Broadcast**:
    - Immediately following a successful ingestion of a net-new movie, the backend fires a direct JDBC bulk insert into the `notifications` table, instantly alerting all registered users to the new content in their UI bell icon.

---

## 🏛️ 3. Database Normalization (The "Refinement")
We have refined the database from a "garbage-filled" sparsely populated state into a strictly normalized schema.

### Before vs. After:
- **Old (Denormalized)**: Movie genres were stored as a simple comma-separated string.
- **New (Normalized)**: movies are linked to a specific `genres` table via a `movie_genres` join table, allowing instantaneous relational filtering.

---

## 🎟️ 4. Watchlist Persistence 
CineVault handles Watchlists efficiently using a dual-state resolution system:
- **Guest State**: Users without an account receive a uniquely generated LocalStorage UUID, tied to the PostgreSQL `session_id`.
- **Merge Resolve**: Upon Authentication, the `AuthController` hooks a merge phase where all session-tied watchlist entries are hard-mapped to the new authenticated `user_id`, clearing ghost states automatically so no data is lost during Sign-Up.

---

## 🚢 5. Docker Production Architecture
CineVault is completely containerized.
1. **Frontend**: Standard Vite build, mapped to a hyper-lightweight Alpine `nginx` server. `nginx.conf` has been injected to properly proxy all `/api` calls down back to the Spring Service, while cleanly mapping React Router paths to `index.html`.
2. **Backend**: Standard Multi-stage build via Maven and Eclipse Temurin JRE. Serves on port `5000`.
3. **Database**: Direct PostgreSQL 15 boot that maps natively to the Java service through Docker's internal DNS (`cinevault-db`).

---

## 🗣️ 6. How to Explain CineVault (Talking Points)
If you are explaining this project to a third party, here is how to frame it:

1.  **Data Integrity First**: Highlight that unlike many movie apps that use "mock" data, CineVault has a self-healing sync engine that restores accuracy if any data is corrupted.
2.  **Modern Aesthetics**: Mention the "Glitch Noir" design—it's not just a movie list; it's a visual experience with high-contrast elements and smooth transitions.
3.  **Technical Depth**: Mention the **Postgres bulk JDBC injections**, and **Watchlist Ghosting resolution**. This shows that the app isn't just a simple CRUD app, but a production-ready system tackling real-world distributed state issues.

---

> [!TIP]
> **Key Database Secret**: The `search_vector` column in the `movies` table uses GIN indexing for ultra-fast multi-word searches, making the "Search Terminal" feel extremely responsive.
