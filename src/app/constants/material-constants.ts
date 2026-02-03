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

export const CATEGORY_TO_PACKAGING: Record<string, { packaging: string[]; reciclable: boolean; nota?: string }> = {
  'en:beverages': { packaging: ['en:pet-1-polyethylene-terephthalate', 'en:glass', 'en:aluminum'], reciclable: true },
  'en:alcoholic-beverages': { packaging: ['en:glass', 'en:aluminum', 'en:cardboard'], reciclable: true },
  'en:beers': { packaging: ['en:brown-glass', 'en:aluminum', 'en:steel'], reciclable: true },
  'en:wines': { packaging: ['en:glass', 'en:tetrapak', 'en:cardboard'], reciclable: true },
  'en:non-alcoholic-beverages': { packaging: ['en:pet-1-polyethylene-terephthalate', 'en:aluminum'], reciclable: true },
  'en:sodas': { packaging: ['en:pet-1-polyethylene-terephthalate', 'en:aluminum', 'en:glass'], reciclable: true },
  'en:waters': { packaging: ['en:pet-1-polyethylene-terephthalate', 'en:glass'], reciclable: true },
  'en:juices-and-nectars': { packaging: ['en:tetrapak', 'en:pet-1-polyethylene-terephthalate', 'en:glass'], reciclable: true },
  'en:dairies': { packaging: ['en:tetrapak', 'en:hdpe-2-high-density-polyethylene', 'en:pp-5-polypropylene'], reciclable: true },
  'en:milks': { packaging: ['en:tetrapak', 'en:hdpe-2-high-density-polyethylene', 'en:glass'], reciclable: true },
  'en:yogurts': { packaging: ['en:pp-5-polypropylene', 'en:aluminum', 'en:plastic'], reciclable: true },
  'en:cheeses': { packaging: ['en:plastic', 'en:ldpe-4-low-density-polyethylene', 'en:paper'], reciclable: true },
  'en:snacks': { packaging: ['en:plastic', 'en:ldpe-4-low-density-polyethylene', 'en:aluminum'], reciclable: false, nota: 'Bolsas flexibles multicapa suelen no reciclarse efectivamente' },
  'en:salty-snacks': { packaging: ['en:plastic', 'en:ldpe-4-low-density-polyethylene', 'en:cardboard'], reciclable: false, nota: 'Multicapa común' },
  'en:chips-and-fries': { packaging: ['en:plastic', 'en:ldpe-4-low-density-polyethylene', 'en:other-plastics'], reciclable: false, nota: 'Bolsas típicas multicapa difíciles de reciclar' },
  'en:sweet-snacks': { packaging: ['en:plastic', 'en:aluminum', 'en:cardboard'], reciclable: true },
  'en:chocolates': { packaging: ['en:aluminum', 'en:paper', 'en:cardboard'], reciclable: true },
  'en:biscuits-and-cakes': { packaging: ['en:cardboard', 'en:plastic', 'en:non-corrugated-cardboard'], reciclable: true },
  'en:biscuits': { packaging: ['en:cardboard', 'en:plastic', 'en:paper'], reciclable: true },
  'en:cereals-and-their-products': { packaging: ['en:cardboard', 'en:non-corrugated-cardboard', 'en:plastic'], reciclable: true },
  'en:breakfast-cereals': { packaging: ['en:cardboard', 'en:ldpe-4-low-density-polyethylene', 'en:corrugated-cardboard'], reciclable: true },
  'en:coffees': { packaging: ['en:aluminum', 'en:plastic', 'en:steel'], reciclable: true },
  'en:teas': { packaging: ['en:cardboard', 'en:paper', 'en:plastic'], reciclable: true },
  'en:frozen-foods': { packaging: ['en:cardboard', 'en:plastic', 'en:corrugated-cardboard'], reciclable: true },
  'en:meals': { packaging: ['en:plastic', 'en:cardboard', 'en:aluminum'], reciclable: true },
  'en:cocoa-and-hazelnuts-spreads': {packaging: ['en:clear-glass','en:aluminum','en:paper'],reciclable: true,},
  'en:margarines': { packaging: ['en:pp-5-polypropylene', 'en:aluminum', 'en:plastic'], reciclable: true },
};
