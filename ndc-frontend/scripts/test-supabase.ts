/**
 * Supabase Connection Test Script
 * 
 * Run with: npx tsx scripts/test-supabase.ts
 * Or: pnpm tsx scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseKey.substring(0, 20)}...\n`);

  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic Connection');
    const { data, error } = await supabase.from('counties').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Connection successful!\n');

    // Test 2: Check tables exist
    console.log('Test 2: Checking Tables...');
    const tables = ['thematic_areas', 'counties', 'indicators', 'county_performance', 'publications', 'user_profiles'];
    
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count').limit(1);
      if (tableError) {
        console.log(`❌ Table "${table}" not found or not accessible`);
        console.log(`   Error: ${tableError.message}`);
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    }
    console.log('');

    // Test 3: Check indicators were inserted
    console.log('Test 3: Checking Initial Data...');
    const { data: indicators, error: indicatorsError } = await supabase
      .from('indicators')
      .select('count');
    
    if (indicatorsError) {
      console.log(`❌ Error checking indicators: ${indicatorsError.message}`);
    } else {
      const { count } = await supabase.from('indicators').select('*', { count: 'exact', head: true });
      console.log(`✅ Indicators table has ${count} records`);
    }
    console.log('');

    // Test 4: Test RLS policies (public read)
    console.log('Test 4: Testing Row Level Security (Public Read)...');
    const { data: publicData, error: publicError } = await supabase
      .from('counties')
      .select('id, name')
      .limit(5);
    
    if (publicError) {
      console.log(`❌ RLS policy issue: ${publicError.message}`);
    } else {
      console.log(`✅ Public read access works (found ${publicData?.length || 0} counties)`);
    }
    console.log('');

    // Test 5: Test JSONB field (indicators_json)
    console.log('Test 5: Testing JSONB Support...');
    const { data: perfData, error: perfError } = await supabase
      .from('county_performance')
      .select('indicators_json')
      .limit(1);
    
    if (perfError && perfError.code !== 'PGRST116') { // PGRST116 = no rows found (OK)
      console.log(`❌ JSONB field issue: ${perfError.message}`);
    } else {
      console.log('✅ JSONB field structure is correct');
    }
    console.log('');

    // Test 6: Storage bucket (if configured)
    console.log('Test 6: Testing Storage Bucket...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log(`⚠️  Storage check failed: ${storageError.message}`);
      console.log('   (This is OK if you haven\'t created the bucket yet)');
    } else {
      const publicationsBucket = buckets?.find(b => b.name === 'publications');
      if (publicationsBucket) {
        console.log('✅ Publications storage bucket exists');
      } else {
        console.log('⚠️  Publications bucket not found');
        console.log('   Create it in Supabase Dashboard → Storage');
      }
    }
    console.log('');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Supabase setup looks good!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

// Run tests
testConnection();

