-- 1. Clear all mock reviews
TRUNCATE TABLE reviews CASCADE;

-- 2. Modify the trigger function to only calculate avg if reviews exist.
-- Otherwise, it should preserve the 'aggregate_rating' (which comes from TMDB).
CREATE OR REPLACE FUNCTION update_movie_aggregate_rating()
RETURNS TRIGGER AS $$
DECLARE
    review_avg DECIMAL(4, 2);
    review_count INT;
BEGIN
    -- Only calculate if there are actually reviews
    SELECT AVG(rating), COUNT(*) INTO review_avg, review_count
    FROM reviews
    WHERE movie_id = COALESCE(NEW.movie_id, OLD.movie_id);

    IF review_count > 0 THEN
        UPDATE movies
        SET aggregate_rating = review_avg
        WHERE id = COALESCE(NEW.movie_id, OLD.movie_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. Reset all ratings to 0.00 temporarily or just leave them.
-- The next sync will populate them with exact TMDB values.
-- However, we can use the existing ones if we just want to remove the '8.00' defaults.
-- Since we just randomized them, we should probably reset them to a clean state
-- or wait for the sync.
UPDATE movies SET aggregate_rating = 0.00;
