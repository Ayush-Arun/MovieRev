-- =========================================================
-- CineVault Master Database Setup
-- Run this file to initialize everything from scratch
-- =========================================================

-- 1. Schema (tables, indexes, triggers)
\i schema.sql

-- 2. Views, functions, procedures
\i views.sql

-- 3. Seed data (movies)
\i ../seed.sql

-- 4. Fix ratings precision + re-create affected views
\i fix_ratings.sql
