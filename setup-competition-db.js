#!/usr/bin/env node

/**
 * Competition Database Setup Script
 * 
 * This script helps you set up the competition system database schema.
 * Run this after your main database schema is set up.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏆 Competition System Database Setup');
console.log('====================================\n');

// Check if competition schema file exists
const schemaPath = path.join(__dirname, 'competition-schema.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Competition schema file found (competition-schema.sql)');
  console.log('📋 Next steps:');
  console.log('   1. Go to your Supabase project dashboard');
  console.log('   2. Navigate to SQL Editor');
  console.log('   3. Copy the contents of competition-schema.sql');
  console.log('   4. Paste and run the SQL in the editor');
  console.log('   5. This will create all competition tables and insert initial data\n');
  
  // Show a preview of what will be created
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const tables = [
    'divisions',
    'seasons', 
    'season_standings',
    'competition_races',
    'race_entries',
    'race_results',
    'ai_players',
    'ai_player_pigeons',
    'promotion_relegation_history',
    'pre_calculated_races',
    'race_progress_updates',
    'race_commentary',
    'race_standings_snapshots',
    'scheduled_races',
    'race_automation',
    'youth_race_eligibility'
  ];
  
  console.log('📊 Tables that will be created:');
  tables.forEach(table => console.log(`   - ${table}`));
  
  console.log('\n🎯 Initial data that will be inserted:');
  console.log('   - 3 divisions (Division 1, 2A, 2B)');
  console.log('   - Race automation rules');
  console.log('   - Scheduled race templates');
  console.log('   - Row Level Security policies');
  console.log('   - Database indexes for performance\n');
  
} else {
  console.log('❌ Competition schema file not found');
  console.log('   Please ensure competition-schema.sql exists in your project root\n');
}

// Check if .env.local exists and has Supabase config
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_SUPABASE_URL') && envContent.includes('VITE_SUPABASE_ANON_KEY')) {
    console.log('✅ Supabase configuration found in .env.local');
  } else {
    console.log('⚠️  Supabase configuration missing from .env.local');
    console.log('   Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set\n');
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('   Please run: node setup-supabase.js first\n');
}

console.log('🚀 After running the schema:');
console.log('   □ The competition page should load without errors');
console.log('   □ You should see 3 divisions listed');
console.log('   □ The "Failed to load divisions" error should be gone');
console.log('   □ You can start creating seasons and races\n');

console.log('📚 Need help?');
console.log('   - Check SUPABASE_SETUP.md for general setup');
console.log('   - Check COMPETITION_TODO.md for next steps');
console.log('   - Run: npm run dev to test the application\n');

console.log('🎯 Ready to set up the competition system! 🏆'); 