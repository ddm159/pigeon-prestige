-- Drop old/backup/duplicate tables related to races and competition
DROP TABLE IF EXISTS races_backup CASCADE;
DROP TABLE IF EXISTS race_participants_backup CASCADE;
DROP TABLE IF EXISTS competition_races CASCADE;
DROP TABLE IF EXISTS competition_entries CASCADE;
DROP TABLE IF EXISTS competition_results CASCADE;
-- Add any other legacy/duplicate tables you want to remove below
-- Example:
-- DROP TABLE IF EXISTS old_races CASCADE;
-- DROP TABLE IF EXISTS old_race_entries CASCADE; 