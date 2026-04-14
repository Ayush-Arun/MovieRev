-- 1. Insert Premium Theaters in Major Cities
INSERT INTO theatres (name, city, state, supported_formats) VALUES
-- Bangalore
('PVR ICON: Nexus Shantiniketan', 'Bangalore', 'Karnataka', 'IMAX, 4DX, Atmos'),
('INOX: Lido Mall, MG Road', 'Bangalore', 'Karnataka', 'Insignia, 3D'),
('Cinepolis: Forum Shantiniketan', 'Bangalore', 'Karnataka', 'IMAX, Atmos'),
('PVR Gold Class: Koramangala', 'Bangalore', 'Karnataka', 'Gold Class'),

-- Mumbai
('PVR ICON: Phoenix Palladium', 'Mumbai', 'Maharashtra', 'IMAX, Atmos'),
('INOX Insignia: Atria Mall', 'Mumbai', 'Maharashtra', 'Insignia, 4DX'),
('Carnival Movies: Metro Junction', 'Mumbai', 'Maharashtra', '2D, 3D'),
('PVR: Juhu (Dynamix Mall)', 'Mumbai', 'Maharashtra', '4DX, Atmos'),

-- Delhi
('PVR Director''s Cut: Ambience Mall', 'Delhi', 'NCR', 'Director''s Cut, Gold'),
('INOX: Eros One, Nehru Place', 'Delhi', 'NCR', 'Insignia, IMAX'),
('DT Star Cinemas: Saket', 'Delhi', 'NCR', '2D, 3D'),
('PVR: Select City Walk', 'Delhi', 'NCR', 'IMAX, Atmos'),

-- Hyderabad
('AMB Cinemas: Gachibowli', 'Hyderabad', 'Telangana', 'M-Plex, IMAX'),
('PVR: Gallaria Mall, Panjagutta', 'Hyderabad', 'Telangana', '4DX, Atmos'),
('INOX: GVK One, Banjara Hills', 'Hyderabad', 'Telangana', 'Insignia, 3D');

-- 2. Generate Showtimes for Popular Movies
DO $$
DECLARE
    m_record RECORD;
    t_record RECORD;
    show_date DATE;
    show_times TIME[] := ARRAY['10:00:00'::TIME, '13:30:00'::TIME, '17:00:00'::TIME, '21:00:00'::TIME];
    st TIME;
BEGIN
    FOR m_record IN (SELECT id FROM movies WHERE aggregate_rating > 0 ORDER BY aggregate_rating DESC LIMIT 10) LOOP
        FOR t_record IN (SELECT id FROM theatres) LOOP
            FOR i IN 0..2 LOOP -- Next 3 days
                show_date := CURRENT_DATE + i;
                FOREACH st IN ARRAY show_times LOOP
                    INSERT INTO showtimes (movie_id, theatre_id, show_date, show_time, screen_number, format, language_version, total_seats, available_seats)
                    VALUES (m_record.id, t_record.id, show_date, st, floor(random() * 5 + 1)::text, '2D', 'English', 150, 150)
                    ON CONFLICT DO NOTHING;
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$;
