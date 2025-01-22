export const totalAreaPatterns = [
  /Total Roof Area\s*=\s*([\d,.]+) sq ft/i,
  /Total Area \(All Pitches\)\s*=\s*([\d,.]+) sq ft/i,
  /Total Square Footage\s*=\s*([\d,.]+) sq ft/i,
  /Total SF\s*=\s*([\d,.]+) sq ft/i,
  /Area\s*=\s*([\d,.]+) sq ft/i
];

export const generalAreaPattern = /(\d{2,}(?:,\d{3})*(?:\.\d+)?)\s*(?:sq\.?\s*ft\.?|square\s*feet|SF)/i;

export const pitchPatterns = [
  /Predominant Pitch\s*=\s*([\d/]+)/i,
  /Primary Pitch\s*=\s*([\d/]+)/i,
  /Main Pitch\s*=\s*([\d/]+)/i
];

export const lengthPatterns = {
  ridges: /Total Ridges\/Hips\s*=\s*([\d.]+) ft/i,
  valleys: /Total Valleys\s*=\s*([\d.]+) ft/i,
  rakes: /Total Rakes\s*=\s*([\d.]+) ft/i,
  eaves: /Total Eaves\s*=\s*([\d.]+) ft/i,
  flashing: /Flashing\s*=\s*([\d.]+) ft/i,
  stepFlashing: /Step flashing\s*=\s*([\d.]+) ft/i,
  parapetWalls: /Parapet Walls\s*=\s*([\d.]+) ft/i,
  dripEdge: /Drip Edge \(Eaves \+ Rakes\)\s*=\s*([\d.]+) ft/i
};

export const penetrationPatterns = {
  count: /Total Penetrations\s*=\s*(\d+)/i,
  area: /Total Penetrations Area\s*=\s*([\d.]+) sq ft/i,
  perimeter: /Total Penetrations Perimeter\s*=\s*([\d.]+) ft/i
};

export const facetPatterns = {
  total: /Total Roof Facets\s*=\s*(\d+)/i,
  stories: /Number of Stories\s*<=\s*(\d+)/i
};

export const areaLessPenetrations = /Total Roof Area Less Penetrations\s*=\s*([\d.]+) sq ft/i;