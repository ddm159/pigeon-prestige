-- Add missing RLS policies for pigeon groups
-- Run this in your Supabase SQL editor

-- Enable RLS on pigeon groups tables
ALTER TABLE pigeon_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pigeon_group_members ENABLE ROW LEVEL SECURITY;

-- Users can only see their own pigeon groups
CREATE POLICY "Users can view own pigeon groups" ON pigeon_groups
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own pigeon groups" ON pigeon_groups
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own pigeon groups" ON pigeon_groups
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own pigeon groups" ON pigeon_groups
    FOR DELETE USING (auth.uid() = owner_id);

-- Users can only see pigeon group members for groups they own
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