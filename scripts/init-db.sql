
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


CREATE OR REPLACE FUNCTION create_performance_indexes()
RETURNS void AS $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recordings') THEN
        CREATE INDEX IF NOT EXISTS idx_recordings_location ON recordings USING btree (latitude, longitude);
        
        CREATE INDEX IF NOT EXISTS idx_recordings_moderation_active ON recordings (moderation_status, is_active);
        
        CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON recordings (user_id);
        
        CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings (created_at DESC);
        
        CREATE INDEX IF NOT EXISTS idx_recordings_status_active_created ON recordings (moderation_status, is_active, created_at DESC);
        
        CREATE INDEX IF NOT EXISTS idx_recordings_search ON recordings USING gin (to_tsvector('english', title || ' ' || COALESCE(description, '')));
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
        
        CREATE INDEX IF NOT EXISTS idx_users_reputation ON users (reputation DESC);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'votes') THEN
        CREATE INDEX IF NOT EXISTS idx_votes_recording_user ON votes (recording_id, user_id);
        CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes (user_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
