// Official Kenya County Names
// These names match exactly with the GeoJSON data used in the interactive map
// Source: https://raw.githubusercontent.com/abugasavio/ke.counties/master/counties.geojson

export const KENYA_COUNTIES = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Keiyo-Marakwet",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita Taveta",
  "Tana River",
  "Tharaka",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot"
] as const;

export type KenyaCounty = typeof KENYA_COUNTIES[number];

// Helper function to check if a string is a valid Kenya county
export function isValidCounty(name: string): name is KenyaCounty {
  return KENYA_COUNTIES.includes(name as KenyaCounty);
}
