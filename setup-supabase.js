#!/usr/bin/env node

/**
 * Supabase Setup Script for Pigeon Racing Game
 * 
 * This script helps you set up your Supabase project with the correct configuration.
 * Run this after creating your Supabase project.
 */

const fs = require('fs');
const path = require('path');

console.log('🐦 Pigeon Racing Game - Supabase Setup');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env.local file already exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('your-supabase-url') || envContent.includes('your-anon-key')) {
    console.log('⚠️  Please update your .env.local file with your actual Supabase credentials');
    console.log('   - Go to your Supabase project dashboard');
    console.log('   - Navigate to Settings → API');
    console.log('   - Copy your Project URL and Anon Key');
    console.log('   - Update the values in .env.local\n');
  } else {
    console.log('✅ Environment variables appear to be configured\n');
  }
} else {
  console.log('📝 Creating .env.local file...');
  
  const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file');
  console.log('⚠️  Please update it with your actual Supabase credentials\n');
}

// Check if database schema file exists
const schemaPath = path.join(process.cwd(), 'database-schema.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Database schema file found (database-schema.sql)');
  console.log('📋 Next steps:');
  console.log('   1. Go to your Supabase project dashboard');
  console.log('   2. Navigate to SQL Editor');
  console.log('   3. Copy the contents of database-schema.sql');
  console.log('   4. Paste and run the SQL in the editor\n');
} else {
  console.log('❌ Database schema file not found');
  console.log('   Please ensure database-schema.sql exists in your project root\n');
}

// Check if setup guide exists
const guidePath = path.join(process.cwd(), 'SUPABASE_SETUP.md');
if (fs.existsSync(guidePath)) {
  console.log('✅ Setup guide found (SUPABASE_SETUP.md)');
  console.log('📖 Read the guide for detailed instructions\n');
} else {
  console.log('❌ Setup guide not found');
  console.log('   Please ensure SUPABASE_SETUP.md exists in your project root\n');
}

console.log('🚀 Quick Start Checklist:');
console.log('   □ Create Supabase project at https://supabase.com');
console.log('   □ Get your Project URL and Anon Key from Settings → API');
console.log('   □ Update .env.local with your credentials');
console.log('   □ Run the database schema in Supabase SQL Editor');
console.log('   □ Configure authentication settings');
console.log('   □ Test your connection with: npm run dev');
console.log('   □ Run tests with: npm run test\n');

console.log('📚 Additional Resources:');
console.log('   - Supabase Documentation: https://supabase.com/docs');
console.log('   - Supabase Discord: https://discord.supabase.com');
console.log('   - Project README: README.md\n');

console.log('🎯 You\'re all set! Happy coding! 🐦'); 