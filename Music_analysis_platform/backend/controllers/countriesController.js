const pool = require('../config/db');

const COUNTRY_SOURCES_CTE = `
  WITH country_sources AS (
    SELECT UPPER(country_code) AS country_code, country
    FROM most_streamed_albums
    WHERE country_code IS NOT NULL AND TRIM(country_code) != '' AND country IS NOT NULL AND TRIM(country) != ''
    UNION ALL
    SELECT UPPER(country_code) AS country_code, country
    FROM most_streamed_songs
    WHERE country_code IS NOT NULL AND TRIM(country_code) != '' AND country IS NOT NULL AND TRIM(country) != ''
    UNION ALL
    SELECT UPPER(streamed_country_code) AS country_code, streamed_country AS country
    FROM different_streamed_songs_around_the_world
    WHERE streamed_country_code IS NOT NULL AND TRIM(streamed_country_code) != '' AND streamed_country IS NOT NULL AND TRIM(streamed_country) != ''
  ),
  country_name_to_code AS (
    SELECT country_name, country_code
    FROM (
      SELECT
        LOWER(TRIM(country)) AS country_name,
        country_code,
        COUNT(*) AS occurrences,
        ROW_NUMBER() OVER (
          PARTITION BY LOWER(TRIM(country))
          ORDER BY COUNT(*) DESC, country_code ASC
        ) AS rn
      FROM country_sources
      GROUP BY LOWER(TRIM(country)), country_code
    ) ranked_names
    WHERE rn = 1
  ),
  country_lookup AS (
    SELECT country_code, country
    FROM (
      SELECT
        country_code,
        country,
        COUNT(*) AS occurrences,
        ROW_NUMBER() OVER (
          PARTITION BY country_code
          ORDER BY COUNT(*) DESC, country ASC
        ) AS rn
      FROM country_sources
      GROUP BY country_code, country
    ) ranked_countries
    WHERE rn = 1
  )
`;

// @desc    Get comprehensive country statistics
// @route   GET /api/countries
const getCountries = async (req, res, next) => {
  try {
    const query = `
      ${COUNTRY_SOURCES_CTE},
      artists_by_code AS (
        SELECT
          cnc.country_code,
          COUNT(*) AS artists_count,
          SUM(a.total_streams) AS total_artist_streams
        FROM artists a
        LEFT JOIN country_name_to_code cnc
          ON LOWER(TRIM(a.country)) = cnc.country_name
        WHERE a.country IS NOT NULL AND TRIM(a.country) != ''
        GROUP BY cnc.country_code
      ),
      catalog_artists_by_code AS (
        SELECT
          country_code,
          COUNT(DISTINCT artist) AS artists_count_catalog
        FROM (
          SELECT UPPER(country_code) AS country_code, artist
          FROM most_streamed_albums
          WHERE country_code IS NOT NULL AND TRIM(country_code) != '' AND artist IS NOT NULL AND TRIM(artist) != ''
          UNION ALL
          SELECT UPPER(country_code) AS country_code, artist
          FROM most_streamed_songs
          WHERE country_code IS NOT NULL AND TRIM(country_code) != '' AND artist IS NOT NULL AND TRIM(artist) != ''
        ) catalog_artists
        GROUP BY country_code
      ),
      albums_by_code AS (
        SELECT
          UPPER(country_code) AS country_code,
          COUNT(*) AS albums_count,
          SUM(streams_albums) AS total_album_streams
        FROM most_streamed_albums
        WHERE country_code IS NOT NULL AND TRIM(country_code) != ''
        GROUP BY UPPER(country_code)
      ),
      songs_by_code AS (
        SELECT
          UPPER(country_code) AS country_code,
          COUNT(*) AS songs_count
        FROM most_streamed_songs
        WHERE country_code IS NOT NULL AND TRIM(country_code) != ''
        GROUP BY UPPER(country_code)
      ),
      world_songs_by_code AS (
        SELECT
          UPPER(streamed_country_code) AS country_code,
          COUNT(DISTINCT song_id) AS songs_count
        FROM different_streamed_songs_around_the_world
        WHERE streamed_country_code IS NOT NULL AND TRIM(streamed_country_code) != ''
        GROUP BY UPPER(streamed_country_code)
      ),
      world_streams_by_code AS (
        SELECT
          UPPER(streamed_country_code) AS country_code,
          SUM(total_streams_song_per_country) AS total_world_streams
        FROM different_streamed_songs_around_the_world
        WHERE streamed_country_code IS NOT NULL AND TRIM(streamed_country_code) != ''
        GROUP BY UPPER(streamed_country_code)
      ),
      all_codes AS (
        SELECT country_code FROM artists_by_code WHERE country_code IS NOT NULL AND country_code != ''
        UNION
        SELECT country_code FROM albums_by_code
        UNION
        SELECT country_code FROM songs_by_code
        UNION
        SELECT country_code FROM world_songs_by_code
        UNION
        SELECT country_code FROM world_streams_by_code
      )
      SELECT
        COALESCE(cl.country, ac.country_code) AS country,
        ac.country_code,
        GREATEST(COALESCE(ab.artists_count, 0), COALESCE(cab.artists_count_catalog, 0)) AS artists_count,
        COALESCE(ab.total_artist_streams, 0) AS total_artist_streams,
        COALESCE(alb.albums_count, 0) AS albums_count,
        COALESCE(alb.total_album_streams, 0) AS total_album_streams,
        COALESCE(sng.songs_count, 0) + COALESCE(wld.songs_count, 0) AS total_songs_count,
        COALESCE(wst.total_world_streams, 0) AS total_world_streams
      FROM all_codes ac
      LEFT JOIN country_lookup cl ON ac.country_code = cl.country_code
      LEFT JOIN artists_by_code ab ON ac.country_code = ab.country_code
      LEFT JOIN catalog_artists_by_code cab ON ac.country_code = cab.country_code
      LEFT JOIN albums_by_code alb ON ac.country_code = alb.country_code
      LEFT JOIN songs_by_code sng ON ac.country_code = sng.country_code
      LEFT JOIN world_songs_by_code wld ON ac.country_code = wld.country_code
      LEFT JOIN world_streams_by_code wst ON ac.country_code = wst.country_code
      ORDER BY total_artist_streams DESC, total_album_streams DESC
    `;
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Get top artists, albums, and songs for a country
// @route   GET /api/countries/:code/details?name=France
const getCountryDetails = async (req, res, next) => {
  const { code } = req.params;
  const { name } = req.query;
  const normalizedCode = String(code || '').toUpperCase();
  
  try {
    const [artistsByCode] = await pool.query(
      `
      ${COUNTRY_SOURCES_CTE}
      SELECT
        a.artist,
        a.total_streams,
        a.artist_image_url
      FROM artists a
      LEFT JOIN country_name_to_code cnc
        ON LOWER(TRIM(a.country)) = cnc.country_name
      WHERE cnc.country_code = ?
      ORDER BY a.total_streams DESC
      LIMIT 5
      `,
      [normalizedCode]
    );

    let artists = artistsByCode;

    if (artists.length === 0) {
      const [fallbackArtists] = await pool.query(
        `
        SELECT
          artist,
          SUM(streams_value) AS total_streams,
          MAX(artist_image_url) AS artist_image_url
        FROM (
          SELECT artist, streams_albums AS streams_value, NULL AS artist_image_url
          FROM most_streamed_albums
          WHERE UPPER(country_code) = ?
          UNION ALL
          SELECT artist, streams_songs AS streams_value, song_image_url AS artist_image_url
          FROM most_streamed_songs
          WHERE UPPER(country_code) = ?
        ) as merged
        WHERE artist IS NOT NULL AND TRIM(artist) != ''
        GROUP BY artist
        ORDER BY total_streams DESC
        LIMIT 5
        `,
        [normalizedCode, normalizedCode]
      );
      artists = fallbackArtists;
    }

    if (artists.length === 0 && name) {
      const [rows] = await pool.query(
        'SELECT artist, total_streams, artist_image_url FROM artists WHERE country = ? ORDER BY total_streams DESC LIMIT 5',
        [name]
      );
      artists = rows;
    }

    const [albums] = await pool.query(
      'SELECT album_title, streams_albums, album_image_url, artist FROM most_streamed_albums WHERE country_code = ? ORDER BY streams_albums DESC LIMIT 5',
      [normalizedCode]
    );

    const [songs] = await pool.query(
      `SELECT song_title as title, streams_songs as streams, song_image_url as image, artist FROM most_streamed_songs WHERE country_code = ?
       UNION ALL
       SELECT song_title as title, total_streams_song_per_country as streams, NULL as image, artist FROM different_streamed_songs_around_the_world WHERE streamed_country_code = ?
       ORDER BY streams DESC LIMIT 5`,
      [normalizedCode, normalizedCode]
    );

    res.status(200).json({ artists, albums, songs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCountries,
  getCountryDetails
};
