export const CERTIFICATION_SCORES: Record<string, number> = {
  'en:fair-trade': 20,
  'en:fairtrade': 20,
  'en:organic': 15,
  'en:bio': 15,
  'en:b-corp': 25,
  'en:rainforest-alliance': 12,
  'en:msc': 12,
  'en:utz-certified': 10,
  'en:sa8000': 18,
  'en:fsc': 10,
  'en:vegetarian': 5,
  'en:vegan': 8,
  'en:no-preservatives': 5,
  'en:no-colorings': 5,
  'en:no-gluten': 3
};

export const DISPLAYABLE_CERTIFICATIONS = [
  'en:fair-trade', 'en:fairtrade', 'en:b-corp', 'en:rainforest-alliance',
  'en:msc', 'en:utz-certified', 'en:sa8000', 'en:fsc'
];

export const CERTIFICATION_MAPPING: Record<string, string> = {
  'fair-trade': 'Fair Trade',
  'fairtrade': 'Fair Trade',
  'b-corp': 'B Corp Certified',
  'rainforest-alliance': 'Rainforest Alliance',
  'sa800': 'SA800',
  'utz-certified': 'Utz Certified',
  'msc': 'MSC Marine Stewardship Council',
  'fsc': 'FSC/PEFC'
};

export const DEFAULT_SOCIAL_SCORE = 50;
export const RECYCLING_IMPACT_FACTOR = 0.8;
export const MAX_CO2_KG = 8;
