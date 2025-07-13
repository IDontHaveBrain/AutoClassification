-- Initialize test database for DockerIntegrationTest
-- This script is executed when the PostgreSQL TestContainer starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create any additional test-specific configurations if needed
-- The actual schema will be created by Hibernate with ddl-auto: create-drop

-- Set timezone for consistent testing
SET timezone = 'UTC';

-- Log initialization
SELECT 'Test database initialized successfully' AS status;