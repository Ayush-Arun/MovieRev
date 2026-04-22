-- Enable UUID extension for session IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- TABLES
-- =========================================================

CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE people (
    id SERIAL PRIMARY KEY,
    tmdb_id INT UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_photo_url TEXT,
    birth_date DATE,
    nationality VARCHAR(100),
    biography TEXT
);

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    tmdb_id INT UNIQUE,
    title VARCHAR(255) NOT NULL,
    original_language VARCHAR(50),
    release_date DATE,
    synopsis TEXT,
    poster_url TEXT,
    trailer_url TEXT,
    age_certificate VARCHAR(20),
    status VARCHAR(50),
    runtime_minutes INT CHECK (runtime_minutes > 0),
    format VARCHAR(50),
    production_house VARCHAR(255),
    budget BIGINT,
    box_office BIGINT CHECK (box_office >= 0 OR box_office IS NULL),
    aggregate_rating DECIMAL(3, 2) DEFAULT 0.00
);

CREATE TABLE movie_genres (
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE movie_cast (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    person_id INT REFERENCES people(id) ON DELETE CASCADE,
    character_name VARCHAR(255),
    character_type VARCHAR(50),
    screen_time_minutes INT
);

CREATE TABLE movie_crew (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    person_id INT REFERENCES people(id) ON DELETE CASCADE,
    role_type VARCHAR(100)
);

CREATE TABLE ott_platforms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE movie_ott (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    platform_id INT REFERENCES ott_platforms(id) ON DELETE CASCADE,
    streaming_url TEXT,
    available_from DATE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE theatres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    supported_formats TEXT
);

CREATE TABLE showtimes (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    theatre_id INT REFERENCES theatres(id) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    screen_number VARCHAR(50),
    format VARCHAR(50),
    language_version VARCHAR(50),
    total_seats INT NOT NULL,
    available_seats INT NOT NULL CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email LIKE '%@%.%'),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('guest', 'user', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    review_title VARCHAR(255),
    review_body TEXT,
    sentiment VARCHAR(50),
    helpful_votes INT DEFAULT 0,
    is_reported BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Partial unique indexes to satisfy constraints cleanly while allowing NULLs
CREATE UNIQUE INDEX idx_reviews_unique_user ON reviews(movie_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_reviews_unique_session ON reviews(movie_id, session_id) WHERE session_id IS NOT NULL;

CREATE TABLE review_edits (
    id SERIAL PRIMARY KEY,
    review_id INT REFERENCES reviews(id) ON DELETE CASCADE,
    old_rating INT,
    old_body TEXT,
    new_rating INT,
    new_body TEXT,
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rating_snapshots (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    avg_rating DECIMAL(3, 2),
    snapshot_date DATE DEFAULT CURRENT_DATE,
    UNIQUE (movie_id, snapshot_date)
);

CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_watched BOOLEAN DEFAULT FALSE
);

CREATE TABLE seat_booking_log (
    id SERIAL PRIMARY KEY,
    showtime_id INT REFERENCES showtimes(id) ON DELETE CASCADE,
    seats_booked INT NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_movies_title ON movies (title);
CREATE INDEX idx_movies_lang ON movies (original_language);
CREATE INDEX idx_movies_date ON movies (release_date);
CREATE INDEX idx_movies_rating ON movies (aggregate_rating);

CREATE INDEX idx_reviews_movie_user ON reviews (movie_id, user_id);
CREATE INDEX idx_reviews_movie_session ON reviews (movie_id, session_id);

CREATE INDEX idx_showtimes_date ON showtimes (show_date);
CREATE INDEX idx_showtimes_movie_id ON showtimes (movie_id);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens (token_hash);

-- Full-text search index (tsvector) on movies.title + movies.synopsis
ALTER TABLE movies ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(synopsis, '')), 'B')
) STORED;
CREATE INDEX idx_movies_search ON movies USING GIN (search_vector);


-- =========================================================
-- TRIGGERS & FUNCTIONS
-- =========================================================

-- Trigger for showdate >= CURRENT_DATE (PostgreSQL CHECK constraints don't support volatile functions like CURRENT_DATE)
CREATE OR REPLACE FUNCTION enforce_showtime_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.show_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'show_date must be >= CURRENT_DATE on insert';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_showtime_date
BEFORE INSERT ON showtimes
FOR EACH ROW EXECUTE FUNCTION enforce_showtime_date();


-- Trigger 1 — Auto-calculate aggregate rating
CREATE OR REPLACE FUNCTION update_movie_aggregate_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE movies
    SET aggregate_rating = (
        SELECT COALESCE(AVG(rating), 0.00)
        FROM reviews
        WHERE movie_id = COALESCE(NEW.movie_id, OLD.movie_id)
    )
    WHERE id = COALESCE(NEW.movie_id, OLD.movie_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_movie_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_movie_aggregate_rating();


-- Trigger 2 — Auto-set review sentiment
CREATE OR REPLACE FUNCTION set_review_sentiment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rating >= 7 THEN
        NEW.sentiment = 'Positive';
    ELSIF NEW.rating >= 4 AND NEW.rating <= 6 THEN
        NEW.sentiment = 'Mixed';
    ELSE
        NEW.sentiment = 'Negative';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_review_sentiment
BEFORE INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION set_review_sentiment();


-- Trigger 3 — Block OTT-only status without active OTT record
CREATE OR REPLACE FUNCTION check_ott_status()
RETURNS TRIGGER AS $$
DECLARE
    active_ott_count INT;
BEGIN
    -- Only check if status is modifying to 'ott_only'
    IF NEW.status = 'ott_only' AND (OLD.status IS NULL OR OLD.status != 'ott_only') THEN
        SELECT COUNT(*) INTO active_ott_count
        FROM movie_ott
        WHERE movie_id = NEW.id AND is_active = TRUE;
        
        IF active_ott_count = 0 THEN
            RAISE EXCEPTION 'Cannot set status to ott_only: no active OTT records found for movie_id %', NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_ott_status
BEFORE UPDATE ON movies
FOR EACH ROW EXECUTE FUNCTION check_ott_status();


-- Trigger 4 — Block seat count going below zero
-- Note: the CHECK constraint already handles this natively, but added as a trigger explicitly requested.
CREATE OR REPLACE FUNCTION check_available_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.available_seats < 0 THEN
        RAISE EXCEPTION 'Available seats cannot go below 0. Attempted value: %', NEW.available_seats;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_available_seats
BEFORE UPDATE ON showtimes
FOR EACH ROW EXECUTE FUNCTION check_available_seats();


-- Trigger 5 — Archive review edits
CREATE OR REPLACE FUNCTION archive_review_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.rating IS DISTINCT FROM NEW.rating OR OLD.review_body IS DISTINCT FROM NEW.review_body THEN
        INSERT INTO review_edits (review_id, old_rating, old_body, new_rating, new_body)
        VALUES (OLD.id, OLD.rating, OLD.review_body, NEW.rating, NEW.review_body);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_archive_review_edit
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION archive_review_edit();


-- Trigger 6 — Daily rating snapshot
CREATE OR REPLACE FUNCTION update_daily_rating_snapshot()
RETURNS TRIGGER AS $$
DECLARE
    current_avg DECIMAL(3, 2);
BEGIN
    SELECT COALESCE(AVG(rating), 0.00) INTO current_avg
    FROM reviews
    WHERE movie_id = NEW.movie_id;

    INSERT INTO rating_snapshots (movie_id, avg_rating, snapshot_date)
    VALUES (NEW.movie_id, current_avg, CURRENT_DATE)
    ON CONFLICT (movie_id, snapshot_date) 
    DO UPDATE SET avg_rating = EXCLUDED.avg_rating;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_daily_rating_snapshot
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_daily_rating_snapshot();


-- Trigger 7 — Auto-set updated_at on users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_users_updated_at();

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- REGISTER, RESET_PASSWORD
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
