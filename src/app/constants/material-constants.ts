export const MATERIAL_MAPPING: Record<string, string> = {
  'en:clear-glass': 'vidrio',
  'en:brown-glass': 'vidrio',
  'en:glass': 'vidrio',
  'en:paper': 'papel',
  'es:papel': 'papel',
  'en:non-corrugated-cardboard': 'carton',
  'en:corrugated-cardboard': 'carton',
  'en:cardboard': 'carton',
  'xx:82-c-pap': 'cartonPAP',
  'en:aluminum': 'aluminio',
  'en:steel': 'acero',
  'en:tinplate': 'acero',
  'en:plastic': 'plastico',
  'en:pet-1-polyethylene-terephthalate': 'plasticoPET',
  'en:pp-5-polypropylene': 'plasticoPP',
  'en:pvc-3-polyvinyl-chloride': 'plasticoPVC',
  'en:hdpe-2-high-density-polyethylene': 'plasticoHDPE',
  'en:ldpe-4-low-density-polyethylene': 'plasticoLDPE',
  'en:other-plastics': 'plastico',
  'en:tetrapak': 'tetrapak',
  'en:tetra-brik': 'tetra-brik'
};

export const MATERIAL_IMPACT: Record<string, number> = {
  papel: 0.9,
  vidrio: 1.2,
  carton: 0.8,
  plasticoPP: 2,
  plasticoPET: 2.5,
  plasticoPVC: 3,
  plasticoLDPE: 2,
  plasticoHDPE: 1.8,
  aluminio: 8,
  acero: 2,
  tetrapak: 3,
  cartonPAP: 1,
  other: 2
};

export const MATERIAL_RULES: Record<string, [number, number, number]> = {
  papel: [75, 5, -10],
  vidrio: [70, 10, -15],
  carton: [80, 5, -10],
  plasticoPP: [45, 2, -20],
  plasticoPET: [60, 5, -20],
  plasticoPVC: [30, 0, -25],
  plasticoLDPE: [40, 2, -20],
  plasticoHDPE: [55, 4, -20],
  aluminio: [60, 5, -10],
  acero: [55, 5, -10],
  tetrapak: [45, 5, -15],
  cartonPAP: [65, 5, -10],
  other: [50, 0, -10]
};

export const RECYCLABLE_TAGS = ['en:recycle', 'en:recyclable'];
export const NON_RECYCLABLE_TAG = 'en:non-recyclable';
export const PLASTIC_RECYCLABLE_TAGS = ['en:recycle-in-plastic-bin', 'en:recycle-with-plastics-metal-and-bricks'];

export const MATERIAL_TAG_PATTERNS: Record<string, string[]> = {
  recyclable: ['paper', 'glass', 'cardboard', 'pap', 'aluminum', 'steel', 'tinplate', 'tetra-brik'],
  plasticRecyclable: ['polyethylene', 'polyvinyl', 'polypropylene', 'plastic'],
  glassRecyclable: ['glass'],
  paperRecyclable: ['paper', 'papel']
};
