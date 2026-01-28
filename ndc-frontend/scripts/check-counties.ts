/**
 * Script to check how many counties are in the database
 */

import { supabase } from '../client/lib/supabase';

async function checkCounties() {
  try {
    // Get all counties
    const { data: counties, error: countiesError } = await supabase
      .from('counties')
      .select('id, name')
      .order('name');

    if (countiesError) {
      console.error('Error fetching counties:', countiesError);
      return;
    }

    console.log('\n=== COUNTIES IN DATABASE ===');
    console.log('Total counties:', counties?.length || 0);
    console.log('\nCounty names:');
    counties?.forEach((county, index) => {
      console.log(`${index + 1}. ${county.name} (ID: ${county.id})`);
    });

    // Check performance data for water
    const { data: waterPerf, error: waterError } = await supabase
      .from('county_performance')
      .select('county_id, sector_score, counties(name)')
      .eq('sector', 'water')
      .eq('year', new Date().getFullYear());

    if (!waterError) {
      console.log('\n=== WATER PERFORMANCE DATA ===');
      console.log('Counties with water performance data:', waterPerf?.length || 0);
      waterPerf?.slice(0, 5).forEach((p: any) => {
        console.log(`- ${p.counties?.name}: ${p.sector_score}`);
      });
    }

    // Check performance data for waste
    const { data: wastePerf, error: wasteError } = await supabase
      .from('county_performance')
      .select('county_id, sector_score, counties(name)')
      .eq('sector', 'waste')
      .eq('year', new Date().getFullYear());

    if (!wasteError) {
      console.log('\n=== WASTE PERFORMANCE DATA ===');
      console.log('Counties with waste performance data:', wastePerf?.length || 0);
      wastePerf?.slice(0, 5).forEach((p: any) => {
        console.log(`- ${p.counties?.name}: ${p.sector_score}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkCounties();
