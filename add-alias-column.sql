-- Add alias column to pigeons table
-- This allows players to set custom names for their pigeons

-- Add alias column to pigeons table
ALTER TABLE pigeons 
ADD COLUMN IF NOT EXISTS alias TEXT;

-- Add index for performance when searching by alias
CREATE INDEX IF NOT EXISTS idx_pigeons_alias ON pigeons(alias);

-- Add comment for documentation
COMMENT ON COLUMN pigeons.alias IS 'Custom name that can override the original pigeon name'; 