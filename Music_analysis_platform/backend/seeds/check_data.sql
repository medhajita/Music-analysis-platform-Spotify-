-- SQL script to validate imported data integrity

-- Artists table stats
SELECT 'artists' as table_name, 
       COUNT(*) as total_rows, 
       COUNT(DISTINCT country) as unique_countries,
       AVG(total_streams) as avg_streams,
       MAX(total_streams) as max_streams,
       MIN(total_streams) as min_streams
FROM artists;

-- Most Streamed Albums stats
SELECT 'most_streamed_albums' as table_name, 
       COUNT(*) as total_rows, 
       AVG(streams_albums) as avg_streams,
       MAX(streams_albums) as max_streams,
       MIN(streams_albums) as min_streams
FROM most_streamed_albums;

-- Most Streamed Songs stats
SELECT 'most_streamed_songs' as table_name, 
       COUNT(*) as total_rows, 
       AVG(streams_songs) as avg_streams,
       MAX(streams_songs) as max_streams
FROM most_streamed_songs;

-- Worldwide Streamed Songs stats
SELECT 'different_streamed_songs_around_the_world' as table_name, 
       COUNT(*) as total_rows, 
       COUNT(DISTINCT streamed_country) as unique_countries,
       SUM(total_streams_song_per_country) as total_global_streams
FROM different_streamed_songs_around_the_world;

-- Check for NULLs in critical columns
SELECT 'null_checks' as check_type,
       (SELECT COUNT(*) FROM artists WHERE artist IS NULL) as null_artists,
       (SELECT COUNT(*) FROM artists WHERE total_streams IS NULL) as null_streams,
       (SELECT COUNT(*) FROM most_streamed_albums WHERE album_title IS NULL) as null_albums;
