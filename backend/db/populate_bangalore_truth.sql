-- Clear existing Bangalore Data to ensure 100% truth
DELETE FROM showtimes WHERE theatre_id IN (SELECT id FROM theatres WHERE city = 'Bangalore');
DELETE FROM theatres WHERE city = 'Bangalore';

-- Insert Official Bangalore Premium Malls
INSERT INTO theatres (name, city) VALUES 
('Cinepolis: Nexus Shantiniketan', 'Bangalore'),
('PVR: Orion Mall', 'Bangalore'),
('PVR: Phoenix Marketcity', 'Bangalore'),
('INOX: Megaplex Mall of Asia', 'Bangalore'),
('Cinepolis: Lulu Mall', 'Bangalore');

-- Map IDs (Internal Logic)
-- Note: Assuming these are the relative IDs after insertion
DO $$ 
DECLARE 
    m_hail_mary INT := 129;
    m_mario INT := 360;
    m_drama INT := 670;
    t_nexus INT;
    t_orion INT;
    t_phoenix INT;
    t_moa INT;
    t_lulu INT;
BEGIN
    SELECT id INTO t_nexus FROM theatres WHERE name = 'Cinepolis: Nexus Shantiniketan';
    SELECT id INTO t_orion FROM theatres WHERE name = 'PVR: Orion Mall';
    SELECT id INTO t_phoenix FROM theatres WHERE name = 'PVR: Phoenix Marketcity';
    SELECT id INTO t_moa FROM theatres WHERE name = 'INOX: Megaplex Mall of Asia';
    SELECT id INTO t_lulu FROM theatres WHERE name = 'Cinepolis: Lulu Mall';

    -- Project Hail Mary Showtimes
    -- Nexus Shantiniketan
    INSERT INTO showtimes (movie_id, theatre_id, show_date, show_time, format, language_version, total_seats, available_seats) VALUES 
    (m_hail_mary, t_nexus, CURRENT_DATE, '10:00:00', 'IMAX 3D', 'English', 200, 145),
    (m_hail_mary, t_nexus, CURRENT_DATE, '15:50:00', 'IMAX 3D', 'English', 200, 120),
    (m_hail_mary, t_nexus, CURRENT_DATE, '19:10:00', 'IMAX 3D', 'English', 200, 80),
    (m_hail_mary, t_nexus, CURRENT_DATE, '22:30:00', 'IMAX 3D', 'English', 200, 190);

    -- Orion Mall
    INSERT INTO showtimes (movie_id, theatre_id, show_date, show_time, format, language_version, total_seats, available_seats) VALUES 
    (m_hail_mary, t_orion, CURRENT_DATE, '10:00:00', '2D', 'English', 150, 100),
    (m_hail_mary, t_orion, CURRENT_DATE, '13:20:00', '2D', 'English', 150, 45),
    (m_hail_mary, t_orion, CURRENT_DATE, '18:40:00', '2D', 'English', 150, 10),
    (m_hail_mary, t_orion, CURRENT_DATE, '22:00:00', '2D', 'English', 150, 140);

    -- Phoenix Marketcity
    INSERT INTO showtimes (movie_id, theatre_id, show_date, show_time, format, language_version, total_seats, available_seats) VALUES 
    (m_hail_mary, t_phoenix, CURRENT_DATE, '09:50:00', '4DX', 'English', 100, 30),
    (m_hail_mary, t_phoenix, CURRENT_DATE, '18:40:00', '4DX', 'English', 100, 5),
    (m_hail_mary, t_phoenix, CURRENT_DATE, '22:00:00', '4DX', 'English', 100, 80);

    -- The Super Mario Galaxy Movie Showtimes
    INSERT INTO showtimes (movie_id, theatre_id, show_date, show_time, format, language_version, total_seats, available_seats) VALUES 
    (m_mario, t_phoenix, CURRENT_DATE, '13:10:00', '2D', 'English', 150, 20),
    (m_mario, t_phoenix, CURRENT_DATE, '18:00:00', '2D', 'English', 150, 0),
    (m_mario, t_orion, CURRENT_DATE, '16:40:00', '2D', 'English', 150, 10),
    (m_mario, t_nexus, CURRENT_DATE, '18:25:00', '2D', 'English', 150, 50);

    -- The Drama Showtimes
    INSERT INTO showtimes (movie_id, theatre_id, show_date, show_time, format, language_version, total_seats, available_seats) VALUES 
    (m_drama, t_orion, CURRENT_DATE, '09:30:00', '2D', 'Hindi', 100, 40),
    (m_drama, t_orion, CURRENT_DATE, '14:05:00', '2D', 'Hindi', 100, 10),
    (m_drama, t_moa, CURRENT_DATE, '13:30:00', '2D', 'Hindi', 150, 60),
    (m_drama, t_moa, CURRENT_DATE, '16:10:00', '2D', 'Hindi', 150, 120),
    (m_drama, t_lulu, CURRENT_DATE, '20:05:00', '2D', 'Hindi', 120, 15);

END $$;
