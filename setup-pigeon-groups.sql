-- Complete setup for pigeon groups functionality
-- Run this in your Supabase SQL editor

-- Create the pigeon_groups table
CREATE TABLE IF NOT EXISTS pigeon_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(owner_id, name)
);

-- Create the pigeon_group_members table
CREATE TABLE IF NOT EXISTS pigeon_group_members (
    group_id UUID REFERENCES pigeon_groups(id) ON DELETE CASCADE NOT NULL,
    pigeon_id UUID REFERENCES pigeons(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (group_id, pigeon_id)
);

-- Create function to enforce max 20 groups per owner
CREATE OR REPLACE FUNCTION enforce_max_20_groups_per_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM pigeon_groups WHERE owner_id = NEW.owner_id) >= 20 THEN
        RAISE EXCEPTION 'You can only have up to 20 pigeon groups.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for max groups enforcement
DROP TRIGGER IF EXISTS trg_max_20_groups_per_owner ON pigeon_groups;
CREATE TRIGGER trg_max_20_groups_per_owner
    BEFORE INSERT ON pigeon_groups
    FOR EACH ROW EXECUTE FUNCTION enforce_max_20_groups_per_owner();

-- Enable Row Level Security
ALTER TABLE pigeon_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pigeon_group_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pigeon_groups
CREATE POLICY "Users can view own pigeon groups" ON pigeon_groups
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own pigeon groups" ON pigeon_groups
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own pigeon groups" ON pigeon_groups
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own pigeon groups" ON pigeon_groups
    FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for pigeon_group_members
CREATE POLICY "Users can view own pigeon group members" ON pigeon_group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pigeon_groups 
            WHERE pigeon_groups.id = pigeon_group_members.group_id 
            AND pigeon_groups.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own pigeon group members" ON pigeon_group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pigeon_groups 
            WHERE pigeon_groups.id = pigeon_group_members.group_id 
            AND pigeon_groups.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own pigeon group members" ON pigeon_group_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pigeon_groups 
            WHERE pigeon_groups.id = pigeon_group_members.group_id 
            AND pigeon_groups.owner_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pigeon_groups_owner_id ON pigeon_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_pigeon_group_members_group_id ON pigeon_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_pigeon_group_members_pigeon_id ON pigeon_group_members(pigeon_id);

-- Add trigger for updating updated_at column on pigeon_groups
CREATE TRIGGER update_pigeon_groups_updated_at 
    BEFORE UPDATE ON pigeon_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 'pigeon_groups table created successfully' as status;
SELECT 'pigeon_group_members table created successfully' as status; 