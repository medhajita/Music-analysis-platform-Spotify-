-- ============================================
--   Music Analysis Platform - Spotify
-- ============================================

CREATE DATABASE IF NOT EXISTS music_analysis_platform_spotify;
USE music_analysis_platform_spotify;

-- ============================================
-- TABLE 1 : Artists
-- ============================================

CREATE TABLE IF NOT EXISTS Artists (
    artist_spotify_id       VARCHAR(100)    PRIMARY KEY,
    artist                  VARCHAR(255)    NOT NULL,
    artist_image_url        TEXT,
    country                 VARCHAR(100),
    language                VARCHAR(100),
    type                    VARCHAR(50),
    genre                   VARCHAR(100),
    followers               BIGINT          DEFAULT 0,
    daily_gain_followers    BIGINT          DEFAULT 0,
    weekly_gain_followers   BIGINT          DEFAULT 0,
    listeners               BIGINT          DEFAULT 0,
    daily_gain_listeners    BIGINT          DEFAULT 0,
    monthly_gain_listeners  BIGINT          DEFAULT 0,
    peak_listeners          BIGINT          DEFAULT 0,
    date_peak_listeners     DATE,
    total_streams           BIGINT          DEFAULT 0,
    solo_streams            BIGINT          DEFAULT 0,
    feat_streams            BIGINT          DEFAULT 0,
    tracks                  INT             DEFAULT 0,
    streams_1B              INT             DEFAULT 0,
    streams_100M            INT             DEFAULT 0,
    streams_10M             INT             DEFAULT 0,
    streams_1M              INT             DEFAULT 0
);

-- ============================================
-- TABLE 2 : Artists per Country
-- ============================================

CREATE TABLE IF NOT EXISTS different_artists_per_country (
    id                  INT             AUTO_INCREMENT PRIMARY KEY,
    artist_spotify_id   VARCHAR(100),
    artist              VARCHAR(255)    NOT NULL,
    country             VARCHAR(100),
    followers           BIGINT          DEFAULT 0,
    listeners           BIGINT          DEFAULT 0,
    FOREIGN KEY (artist_spotify_id) REFERENCES Artists(artist_spotify_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================
-- TABLE 3 : Most Streamed Albums
-- ============================================
CREATE TABLE IF NOT EXISTS most_streamed_albums (
    album_spotify_id                VARCHAR(100)    PRIMARY KEY,
    artist_spotify_id               VARCHAR(100),
    artist                          VARCHAR(255)    NOT NULL,
    album_title                     VARCHAR(255),
    album_image_url                 TEXT,
    type                            VARCHAR(50),
    genre                           VARCHAR(100),
    language                        VARCHAR(100),
    release_year_albums             YEAR,
    streams_albums                  BIGINT          DEFAULT 0,
    weekly_gain_streams_albums      BIGINT          DEFAULT 0,
    monthly_gain_streams_albums     BIGINT          DEFAULT 0,
    FOREIGN KEY (artist_spotify_id) REFERENCES Artists(artist_spotify_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================
-- TABLE 4 : Most Streamed Songs
-- ============================================
CREATE TABLE IF NOT EXISTS most_streamed_songs (
    id                      INT             AUTO_INCREMENT PRIMARY KEY,
    artist_spotify_id       VARCHAR(100),
    artist                  VARCHAR(255)    NOT NULL,
    song_title              VARCHAR(255),
    song_image_url          TEXT,
    release_year_songs      YEAR,
    genre                   VARCHAR(100),
    language                VARCHAR(100),
    streams_songs           BIGINT          DEFAULT 0,
    weekly_gain_songs       BIGINT          DEFAULT 0,
    FOREIGN KEY (artist_spotify_id) REFERENCES Artists(artist_spotify_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================
-- TABLE 5 : Different Streamed Songs Around the World
-- ============================================

CREATE TABLE IF NOT EXISTS different_streamed_songs_around_the_world (
    id                                  INT             AUTO_INCREMENT PRIMARY KEY,
    artist_spotify_id                   VARCHAR(100),
    artist                              VARCHAR(255)    NOT NULL,
    song_title                          VARCHAR(255),
    song_id                             VARCHAR(100),
    streamed_country                    VARCHAR(100),
    peak_streams                        BIGINT          DEFAULT 0,
    total_streams_song_per_country      BIGINT          DEFAULT 0,
    FOREIGN KEY (artist_spotify_id) REFERENCES Artists(artist_spotify_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);