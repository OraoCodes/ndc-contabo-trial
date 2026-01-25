import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Use service role key for updates (bypasses RLS)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function updateWeights() {
  // Update weights to match About page: Governance 30%, MRV 20%, Mitigation 20%, Adaptation 15%, Finance 15%
  // First, get all thematic areas to see exact names
  const { data: currentAreas } = await supabase
    .from('thematic_areas')
    .select('name, sector, weight_percentage')
    .order('sector, name');

  console.log('Current thematic areas:');
  currentAreas.forEach(ta => {
    console.log(`  ${ta.sector} - ${ta.name}: ${ta.weight_percentage}%`);
  });
  console.log('\nUpdating weights to match About page...\n');

  // Update based on exact names found
  const updates = [
    { name: 'Adaptation & Resilience', sector: 'water', weight: 15.0 },
    { name: 'Finance & Resource Mobilization', sector: 'water', weight: 15.0 },
    { name: 'Adaptation & Resilience', sector: 'waste', weight: 15.0 },
    { name: 'Finance & Resource Mobilization', sector: 'waste', weight: 15.0 },
  ];

  for (const update of updates) {
    const { data, error } = await supabase
      .from('thematic_areas')
      .update({ weight_percentage: update.weight })
      .eq('name', update.name)
      .eq('sector', update.sector)
      .select();

    if (error) {
      console.error(`❌ Error updating ${update.name} (${update.sector}):`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✓ Updated ${update.name} (${update.sector}) to ${update.weight}%`);
    } else {
      console.log(`⚠️  No record found for ${update.name} (${update.sector})`);
    }
  }

  // Verify final weights
  console.log('\n--- Final Weights ---');
  const { data: finalAreas, error } = await supabase
    .from('thematic_areas')
    .select('name, sector, weight_percentage')
    .order('sector, name');

  if (error) {
    console.error('Error fetching weights:', error);
  } else {
    finalAreas.forEach(ta => {
      console.log(`  ${ta.sector} - ${ta.name}: ${ta.weight_percentage}%`);
    });
  }
}

updateWeights();
