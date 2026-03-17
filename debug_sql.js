const pool = require('./Music_analysis_platform/backend/config/db');

async function debugQueries() {
  try {
    console.log("Testing Genres Query...");
    const genresQuery = `
      SELECT 
        base.genre,
        SUM(COALESCE(art.artists_count, 0)) as artists_count
      FROM (
        SELECT genre FROM artists WHERE genre IS NOT NULL AND genre != ''
        UNION
        SELECT genre FROM most_streamed_albums WHERE genre IS NOT NULL AND genre != ''
        UNION
        SELECT genre FROM most_streamed_songs WHERE genre IS NOT NULL AND genre != ''
        UNION
        SELECT genre FROM different_streamed_songs_around_the_world WHERE genre IS NOT NULL AND genre != ''
      ) as base
      LEFT JOIN (
        SELECT genre, COUNT(*) as artists_count, SUM(total_streams) as total_artist_streams 
        FROM artists GROUP BY genre
      ) as art ON base.genre = art.genre
      GROUP BY base.genre
    `;
    await pool.query(genresQuery);
    console.log("Genres Query [Basic] Passed");

    const fullGenresQuery = `
       SELECT 
        base.genre,
        SUM(COALESCE(art.artists_count, 0)) as artists_count,
        SUM(COALESCE(art.total_artist_streams, 0)) as total_artist_streams,
        SUM(COALESCE(alb.albums_count, 0)) as albums_count,
        SUM(COALESCE(alb.total_album_streams, 0)) as total_album_streams,
        SUM(COALESCE(sng.songs_count, 0) + COALESCE(wld.songs_count, 0)) as total_songs_count,
        SUM(COALESCE(sng.total_song_streams, 0) + COALESCE(wld.total_song_streams, 0)) as total_song_streams,
        MAX(top_art.artist) as top_artist,
        MAX(top_art.total_streams) as top_artist_streams,
        MAX(top_alb.album_title) as top_album,
        MAX(top_alb.streams_albums) as top_album_streams,
        GROUP_CONCAT(DISTINCT country_list.country SEPARATOR ', ') as countries
      FROM (
        SELECT genre FROM artists WHERE genre IS NOT NULL AND genre != ''
        UNION
        SELECT genre FROM most_streamed_albums WHERE genre IS NOT NULL AND genre != ''
        UNION
        SELECT genre FROM most_streamed_songs WHERE genre IS NOT NULL AND genre != ''
        UNION
        SELECT genre FROM different_streamed_songs_around_the_world WHERE genre IS NOT NULL AND genre != ''
      ) as base
      LEFT JOIN (
        SELECT genre, COUNT(*) as artists_count, SUM(total_streams) as total_artist_streams 
        FROM artists GROUP BY genre
      ) as art ON base.genre = art.genre
      LEFT JOIN (
        SELECT genre, COUNT(*) as albums_count, SUM(streams_albums) as total_album_streams 
        FROM most_streamed_albums GROUP BY genre
      ) as alb ON base.genre = alb.genre
      LEFT JOIN (
        SELECT genre, COUNT(*) as songs_count, SUM(streams_songs) as total_song_streams 
        FROM most_streamed_songs GROUP BY genre
      ) as sng ON base.genre = sng.genre
      LEFT JOIN (
        SELECT genre, COUNT(DISTINCT song_id) as songs_count, SUM(total_streams_song_per_country) as total_song_streams 
        FROM different_streamed_songs_around_the_world GROUP BY genre
      ) as wld ON base.genre = wld.genre
      LEFT JOIN (
        SELECT genre, artist, total_streams
        FROM (
          SELECT genre, artist, total_streams,
          ROW_NUMBER() OVER(PARTITION BY genre ORDER BY total_streams DESC) as rn
          FROM artists
        ) a WHERE rn = 1
      ) as top_art ON base.genre = top_art.genre
      LEFT JOIN (
        SELECT genre, album_title, streams_albums
        FROM (
          SELECT genre, album_title, streams_albums,
          ROW_NUMBER() OVER(PARTITION BY genre ORDER BY streams_albums DESC) as rn
          FROM most_streamed_albums
        ) al WHERE rn = 1
      ) as top_alb ON base.genre = top_alb.genre
      LEFT JOIN (
        SELECT genre, country FROM artists WHERE country IS NOT NULL AND country != ''
        UNION
        SELECT genre, country FROM most_streamed_albums WHERE country IS NOT NULL AND country != ''
        UNION
        SELECT genre, country FROM most_streamed_songs WHERE country IS NOT NULL AND country != ''
        UNION
        SELECT genre, streamed_country as country FROM different_streamed_songs_around_the_world WHERE genre IS NOT NULL AND genre != ''
      ) as country_list ON base.genre = country_list.genre
      GROUP BY base.genre
    `;
    await pool.query(fullGenresQuery);
    console.log("Full Genres Query Passed");

  } catch (err) {
    console.error("QUERY ERROR:", err.message);
  } finally {
    process.exit();
  }
}

debugQueries();
