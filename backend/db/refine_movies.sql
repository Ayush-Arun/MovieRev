-- 1. Migrate Existing Genres from String to Join Table
DO $$
DECLARE
    m_record RECORD;
    g_name TEXT;
    g_id INT;
BEGIN
    FOR m_record IN SELECT id, genres FROM movies WHERE genres IS NOT NULL LOOP
        FOR g_name IN SELECT trim(s) FROM unnest(string_to_array(m_record.genres, ',')) s LOOP
            SELECT id INTO g_id FROM genres WHERE name = g_name;
            IF g_id IS NOT NULL THEN
                INSERT INTO movie_genres (movie_id, genre_id) VALUES (m_record.id, g_id) ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

-- 2. Drop the redundant genres column
ALTER TABLE movies DROP COLUMN IF EXISTS genres;
