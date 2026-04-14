# CineVault: Technical Architecture & Feature Guide

This document provides a detailed breakdown of the CineVault system, explaining the core technologies, data pipelines, and architectural decisions made to ensure 100% data accuracy and a premium user experience.

---

## 🏗️ 1. Project Overview
CineVault is a full-stack movie review and booking platform built with the **"Glitch Noir"** aesthetic. It prioritizes **high-integrity data**, ensuring that every movie, rating, and cast member displayed is accurate and sourced directly from the The Movie Database (TMDB).

**Tech Stack:**
- **Backend**: Spring Boot (Java 25), Spring Data JPA, Spring Security (JWT).
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion.
- **Database**: PostgreSQL with custom triggers and full-text search.

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
        - `/movie/{id}/images`: To fetch high-resolution posters.
3.  **Accuracy Guarantee**:
    - We **removed all mock/fake ratings**. The system now stores the exact `vote_average` from TMDB.
    - **Transactional Integrity**: All sync operations are wrapped in `@Transactional` blocks to ensure that if a credit or genre fails, the movie isn't left in a partial state.

---

## 🏛️ 3. Database Normalization (The "Refinement")
We have refined the database from a "garbage-filled" sparsely populated state into a strictly normalized schema.

### Before vs. After:
- **Old (Denormalized)**: Movie genres were stored as a simple comma-separated string like `"Action, Drama"`. This made it impossible to filter movies efficiently by genre.
- **New (Normalized)**: movies are linked to a specific `genres` table via a `movie_genres` join table.
    - This allows for SQL queries like: `SELECT * FROM movies JOIN movie_genres ON ... WHERE genre_id = 28`.
    - It ensures that "Action" is the same entity across all movies.

---

## 🎟️ 4. Theater & Booking System
CineVault features a realistic theater booking system focused on major Indian hubs.

### Realistic Data Generation:
- **Cities**: We focused on **Bangalore (Default)**, Mumbai, Delhi, and Hyderabad.
- **Premium Theaters**: We inserted real-world venues like *PVR ICON Nexus Shantiniketan* and *AMB Cinemas*.
- **Dynamic Showtimes**: Instead of static labels, we use a SQL generator that:
    1.  Picks the **top 10 highest-rated movies** currently in our database.
    2.  Assigns them **4 shows per day** (Morning, Matinee, Evening, Night).
    3.  Calculates timings for the **next 3 days** dynamically from the current date.

### How it works in the UI:
1.  **City Selector**: The frontend fetches a distinct list of cities from the database.
2.  **Filtering**: When you select "Bangalore", the backend runs a join query:
    ```sql
    SELECT s.*, t.name, m.title 
    FROM showtimes s 
    JOIN theatres t ON s.theatre_id = t.id 
    JOIN movies m ON s.movie_id = m.id 
    WHERE t.city = 'Bangalore';
    ```
3.  **Booking Validation**: A PostgreSQL trigger (`trg_check_available_seats`) ensures that you can never book more seats than are available in a theater screen.

---

## 🗣️ 5. How to Explain CineVault (Talking Points)
If you are explaining this project to a third party, here is how to frame it:

1.  **Data Integrity First**: Highlight that unlike many movie apps that use "mock" data, CineVault has a self-healing sync engine that restores accuracy if any data is corrupted.
2.  **Modern Aesthetics**: Mention the "Glitch Noir" design—it's not just a movie list; it's a visual experience with high-contrast elements and smooth transitions.
3.  **Technical Depth**: Mention the **database triggers** and **Many-to-Many normalization**. This shows that the app isn't just a simple CRUD app, but a production-ready system.
4.  **Automatic Ingestion**: Explain that the "Best of Decade" section isn't curated by hand—the backend "searched" TMDB for the best content and brought it in automatically.

---

## 🛠️ 6. How to Run/Sync the Data
If you ever need to reset or refresh the data:
- **Reset Showtimes**: Run the script at `backend/db/populate_major_cities.sql`.
- **Trigger Sync**: The sync starts automatically when the backend boots up (`TmdbStartupConfig.java`).

---

> [!TIP]
> **Key Database Secret**: The `search_vector` column in the `movies` table uses GIN indexing for ultra-fast multi-word searches, making the "Search Terminal" feel extremely responsive.
