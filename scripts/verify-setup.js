#!/usr/bin/env node

/**
 * Verification Script for Allen App Challenge 2026 Setup
 * 
 * This script checks if your environment is properly configured.
 * Run with: node scripts/verify-setup.js
 */

require('dotenv').config({ path: '.env.local' });

const checks = {
  envVars: false,
  supabaseConnection: false,
  databaseTables: false,
  participants: false,
  authUsers: false,
};

// Check environment variables
function checkEnvVars() {
  console.log('🔍 Checking environment variables...');
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.log('   Create a .env.local file with these variables.');
    return false;
  }

  console.log('✅ All environment variables present');
  checks.envVars = true;
  return true;
}

// Check Supabase connection
async function checkSupabaseConnection() {
  console.log('\n🔍 Checking Supabase connection...');
  
  if (!checks.envVars) {
    console.log('⏭️  Skipping (env vars not configured)');
    return false;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Try a simple query
    const { error } = await supabase.from('participants').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful');
    checks.supabaseConnection = true;
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
    return false;
  }
}

// Check database tables
async function checkDatabaseTables() {
  console.log('\n🔍 Checking database tables...');
  
  if (!checks.supabaseConnection) {
    console.log('⏭️  Skipping (Supabase connection failed)');
    return false;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const tables = ['participants', 'apps', 'transactions', 'change_log', 'monthly_winners'];
    const missing = [];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        missing.push(table);
      }
    }

    if (missing.length > 0) {
      console.error('❌ Missing tables:', missing.join(', '));
      console.log('   Run the database migrations from supabase/migrations/');
      return false;
    }

    console.log('✅ All required tables exist');
    checks.databaseTables = true;
    return true;
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    return false;
  }
}

// Check participants
async function checkParticipants() {
  console.log('\n🔍 Checking participants...');
  
  if (!checks.databaseTables) {
    console.log('⏭️  Skipping (database tables check failed)');
    return false;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('participants')
      .select('id, name, email, role');

    if (error) {
      console.error('❌ Error fetching participants:', error.message);
      return false;
    }

    const requiredParticipants = ['Azaria', 'Eden', 'Samara', 'Warwick', 'Wendy'];
    const requiredAdmin = ['Admin'];
    
    const participantNames = data.map(p => p.name);
    const missingParticipants = requiredParticipants.filter(name => !participantNames.includes(name));
    const hasAdmin = data.some(p => p.role === 'admin');

    if (missingParticipants.length > 0) {
      console.error('❌ Missing participants:', missingParticipants.join(', '));
      console.log('   Create users in Supabase Auth and link them in the participants table');
      return false;
    }

    if (!hasAdmin) {
      console.error('❌ No admin user found');
      console.log('   Create an admin user in Supabase Auth and link it in the participants table');
      return false;
    }

    console.log('✅ All participants configured');
    console.log(`   Found ${data.length} participant(s): ${participantNames.join(', ')}`);
    checks.participants = true;
    return true;
  } catch (error) {
    console.error('❌ Error checking participants:', error.message);
    return false;
  }
}

// Main verification function
async function verify() {
  console.log('🧀 Allen App Challenge 2026 - Setup Verification\n');
  console.log('=' .repeat(50));

  await checkEnvVars();
  await checkSupabaseConnection();
  await checkDatabaseTables();
  await checkParticipants();

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Verification Summary:\n');

  const allPassed = Object.values(checks).every(check => check === true);

  if (allPassed) {
    console.log('✅ All checks passed! Your setup looks good.');
    console.log('\n🎉 You can now:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Log in with a participant account');
  } else {
    console.log('⚠️  Some checks failed. Please fix the issues above.');
    console.log('\n📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md');
  }

  console.log('');
  process.exit(allPassed ? 0 : 1);
}

// Run verification
verify().catch(error => {
  console.error('\n❌ Verification script error:', error);
  process.exit(1);
});
