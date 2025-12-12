CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(500),
    profile_picture_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

--==========================================================================================================================
CREATE TABLE IF NOT EXISTS movies (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    production_year INTEGER,
    imdb_rating NUMERIC(3,1) CHECK (imdb_rating >= 0 AND imdb_rating <= 10),
    runtime_minutes INTEGER CHECK (runtime_minutes > 0),
    summary TEXT,
    cover_image_url VARCHAR(500),
    file_path VARCHAR(500),
    file_size BIGINT CHECK (file_size >= 0),
    video_format VARCHAR(20),
    video_codec VARCHAR(50),
    audio_codec VARCHAR(50),
    last_watched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_movies_last_watched ON movies(last_watched_at) WHERE last_watched_at IS NOT NULL;
CREATE INDEX idx_movies_imdb_rating ON movies(imdb_rating DESC NULLS LAST);
CREATE INDEX idx_movies_production_year ON movies(production_year DESC NULLS LAST);

--==========================================================================================================================

CREATE TABLE IF NOT EXISTS user_movie_views (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    watch_progress INTEGER DEFAULT 0 CHECK (watch_progress >= 0 AND watch_progress <= 100),
    last_position_seconds INTEGER DEFAULT 0,
    watched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_user_movie_views UNIQUE(user_id, movie_id)
);

CREATE INDEX idx_views_user_id ON user_movie_views(user_id);
CREATE INDEX idx_views_movie_id ON user_movie_views(movie_id);
CREATE INDEX idx_views_watched_at ON user_movie_views(watched_at DESC);

--==========================================================================================================================


CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_comments_movie_id ON comments(movie_id, created_at DESC);
CREATE INDEX idx_comments_user_id ON comments(user_id, created_at DESC);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

--==========================================================================================================================

CREATE TABLE IF NOT EXISTS genre (
    id BIGSERIAL PRIMARY KEY,
    genre_type VARCHAR(80) NOT NULL
);

--==========================================================================================================================

CREATE TABLE IF NOT EXISTS movie_genre (
    id BIGSERIAL PRIMARY KEY,
    genre_id BIGINT NOT NULL REFERENCES genre(id) ON DELETE CASCADE,
    movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    CONSTRAINT unique_movie_genre UNIQUE(genre_id, movie_id)
);

CREATE INDEX idx_movie_genre_id ON movie_genre(genre_id);
CREATE INDEX idx_genre_movie_id ON movie_genre(movie_id);

--==========================================================================================================================

CREATE TABLE IF NOT EXISTS user_movie_watch_later (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_user_movie_watch_later UNIQUE(user_id, movie_id)
);

CREATE INDEX idx_watch_later_user_id ON user_movie_watch_later(user_id);
CREATE INDEX idx_watch_later_movie_id ON user_movie_watch_later(movie_id);

--==========================================================================================================================

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movies_updated_at 
    BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_movie_views_updated_at 
    BEFORE UPDATE ON user_movie_views
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--==========================================================================================================================

-- ============================================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ============================================================================

-- Function to mark movie as watched
CREATE OR REPLACE FUNCTION mark_movie_watched(p_user_id BIGINT, p_movie_id BIGINT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_movie_views (user_id, movie_id, watched_at)
    VALUES (p_user_id, p_movie_id, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, movie_id) 
    DO UPDATE SET watched_at = CURRENT_TIMESTAMP;
    
    -- Update last_watched_at on movie
    UPDATE movies 
    SET last_watched_at = CURRENT_TIMESTAMP 
    WHERE id = p_movie_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old unwatched movies (removed download_status reference)
CREATE OR REPLACE FUNCTION cleanup_old_movies()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM movies 
    WHERE last_watched_at < CURRENT_TIMESTAMP - INTERVAL '1 month';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

