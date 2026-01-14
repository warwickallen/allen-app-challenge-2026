-- Add app_id column to change_log table
-- This allows us to always display the app name, even for deleted transactions
ALTER TABLE change_log
ADD COLUMN app_id UUID REFERENCES apps(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_change_log_app_id ON change_log(app_id);
