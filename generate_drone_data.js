/**
 * Generate demo market data for East Africa Crop Monitoring Drones Market dashboard.
 * Outputs: public/data/value.json, volume.json, segmentation_analysis.json
 */
const fs = require('fs');
const path = require('path');

const years = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];

const GEO_HIERARCHY = {
  'East Africa': ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Ethiopia', 'Rest of East Africa'],
};

const REGIONS = Object.keys(GEO_HIERARCHY);
const ALL_COUNTRIES = REGIONS.flatMap((r) => GEO_HIERARCHY[r]);
const TOP_GEO = 'East Africa';
const ALL_GEOS = [...REGIONS, ...ALL_COUNTRIES];

const REGION_WEIGHTS = {
  'East Africa': 1,
};

const COUNTRY_WEIGHTS = {
  'East Africa': {
    Kenya: 0.32,
    Tanzania: 0.22,
    Uganda: 0.18,
    Rwanda: 0.08,
    Ethiopia: 0.14,
    'Rest of East Africa': 0.06,
  },
};

const FLAT_SEGMENT_TYPES = {
  'By Drone Type': {
    'Fixed-Wing Drones': 0.28,
    'Rotary-Wing Drones': 0.52,
    'Hybrid VTOL Drones': 0.2,
  },
  'By Application': {
    'Field Mapping and Surveying': 0.18,
    'Crop Health and Stress Monitoring': 0.22,
    'Pest and Disease Detection': 0.16,
    'Irrigation and Water Management': 0.14,
    'Plant Counting and Yield Estimation': 0.15,
    'Soil and Nutrient Assessment': 0.15,
  },
  'By Farm Size': {
    'Smallholder Farms (Less than 20 Hectares)': 0.35,
    'Commercial Farms (20-500 Hectares)': 0.42,
    'Large Commercial Farms and Plantations (More than 500 Hectares)': 0.23,
  },
  'By Sales Channel': {
    'Direct Sales': 0.38,
    'Distributor and Dealer Sales': 0.62,
  },
  'By End User': {
    'Individual Farmers': 0.28,
    'Commercial Farms and Plantations': 0.45,
    'Government and Research Institutions': 0.27,
  },
};

const BY_COMPONENT_HARDWARE = {
  'Airframes and Structures': 0.18,
  'Propulsion Systems': 0.2,
  'Imaging Cameras': 0.16,
  'Sensing Systems (Multispectral, Thermal, LiDAR, Hyperspectral)': 0.22,
  'Communication and Navigation Systems': 0.24,
};

const BY_COMPONENT_SERVICES = {
  'Crop Monitoring Services': 0.28,
  'Aerial Mapping Services': 0.22,
  'Precision Agriculture Consulting Services': 0.18,
  'Training and Certification Services': 0.14,
  'Maintenance and Support Services': 0.18,
};

const GLOBAL_BASE_VALUE_2021 = 245;
const GLOBAL_GROWTH = 0.148;
const VOLUME_PER_MILLION_USD = 180;

let seed = 42;
function seededRandom() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

function addNoise(value, noiseLevel = 0.025) {
  return value * (1 + (seededRandom() - 0.5) * 2 * noiseLevel);
}

function roundTo1(val) {
  return Math.round(val * 10) / 10;
}

function roundToInt(val) {
  return Math.round(val);
}

function generateTimeSeries(baseValue, growthRate, roundFn) {
  const series = {};
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const rawValue = baseValue * Math.pow(1 + growthRate, i);
    series[year] = roundFn(addNoise(rawValue));
  }
  return series;
}

function getGeoMultiplier(geo) {
  if (geo === TOP_GEO) return 1;
  if (REGIONS.includes(geo)) return REGION_WEIGHTS[geo] || 1;
  for (const region of REGIONS) {
    if (GEO_HIERARCHY[region].includes(geo)) {
      const rw = REGION_WEIGHTS[region];
      const cw = COUNTRY_WEIGHTS[region][geo] || 0.1;
      return rw * cw;
    }
  }
  return 0.01;
}

function segmentGrowthMultiplier(segType, segName) {
  const hash = (segType + segName).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 0.92 + (hash % 17) * 0.01;
}

function buildFlatSegmentData(geo, segType, segments, isVolume) {
  const roundFn = isVolume ? roundToInt : roundTo1;
  const multiplier = isVolume ? VOLUME_PER_MILLION_USD : 1;
  const geoMult = getGeoMultiplier(geo);
  const geoBase = GLOBAL_BASE_VALUE_2021 * multiplier * geoMult;
  const result = {};

  for (const [segName, share] of Object.entries(segments)) {
    const growth = GLOBAL_GROWTH * segmentGrowthMultiplier(segType, segName);
    const shareVar = 1 + (seededRandom() - 0.5) * 0.06;
    const segBase = geoBase * share * shareVar;
    result[segName] = generateTimeSeries(segBase, growth, roundFn);
  }
  return result;
}

function sumTimeSeries(seriesList) {
  const total = {};
  for (const year of years) {
    total[year] = 0;
    for (const s of seriesList) {
      total[year] += s[year] || 0;
    }
  }
  return total;
}

function buildNestedChildren(geo, segType, parentShare, children, isVolume) {
  const roundFn = isVolume ? roundToInt : roundTo1;
  const multiplier = isVolume ? VOLUME_PER_MILLION_USD : 1;
  const geoMult = getGeoMultiplier(geo);
  const geoBase = GLOBAL_BASE_VALUE_2021 * multiplier * geoMult;
  const parentBase = geoBase * parentShare * (1 + (seededRandom() - 0.5) * 0.04);
  const parentNode = {};
  const childSeries = [];

  for (const [leaf, leafShare] of Object.entries(children)) {
    const growth = GLOBAL_GROWTH * segmentGrowthMultiplier(segType, leaf);
    const leafBase = parentBase * leafShare * (1 + (seededRandom() - 0.5) * 0.05);
    const series = generateTimeSeries(leafBase, growth, roundFn);
    parentNode[leaf] = series;
    childSeries.push(series);
  }

  const parentTotals = sumTimeSeries(childSeries);
  for (const year of years) {
    parentNode[year] = roundFn(parentTotals[year]);
  }
  return parentNode;
}

function buildByComponentData(geo, isVolume) {
  const roundFn = isVolume ? roundToInt : roundTo1;
  const multiplier = isVolume ? VOLUME_PER_MILLION_USD : 1;
  const geoMult = getGeoMultiplier(geo);
  const geoBase = GLOBAL_BASE_VALUE_2021 * multiplier * geoMult;

  const hardware = buildNestedChildren(geo, 'By Component', 0.48, BY_COMPONENT_HARDWARE, isVolume);
  const services = buildNestedChildren(geo, 'By Component', 0.32, BY_COMPONENT_SERVICES, isVolume);

  const softwareGrowth = GLOBAL_GROWTH * segmentGrowthMultiplier('By Component', 'Software');
  const softwareBase = geoBase * 0.2 * (1 + (seededRandom() - 0.5) * 0.04);
  const software = generateTimeSeries(softwareBase, softwareGrowth, roundFn);

  return {
    Hardware: hardware,
    Software: software,
    Services: services,
  };
}

function buildByRegionData(isVolume) {
  const roundFn = isVolume ? roundToInt : roundTo1;
  const multiplier = isVolume ? VOLUME_PER_MILLION_USD : 1;
  const result = {};
  for (const region of REGIONS) {
    const base = GLOBAL_BASE_VALUE_2021 * multiplier * (REGION_WEIGHTS[region] || 1);
    const growth = GLOBAL_GROWTH * (0.98 + seededRandom() * 0.08);
    result[region] = generateTimeSeries(base, growth, roundFn);
  }
  return result;
}

function buildByCountryData(region, isVolume) {
  const roundFnVal = isVolume ? roundToInt : roundTo1;
  const multiplier = isVolume ? VOLUME_PER_MILLION_USD : 1;
  const regionBase = GLOBAL_BASE_VALUE_2021 * multiplier * (REGION_WEIGHTS[region] || 1);
  const weights = COUNTRY_WEIGHTS[region];
  const result = {};
  for (const country of GEO_HIERARCHY[region]) {
    const share = weights[country] || 0.1;
    const base = regionBase * share;
    const growth = GLOBAL_GROWTH * segmentGrowthMultiplier('By Country', country);
    result[country] = generateTimeSeries(base, growth, roundFnVal);
  }
  return result;
}

function buildGeoEntry(geo, isVolume) {
  const entry = {};
  entry['By Drone Type'] = buildFlatSegmentData(geo, 'By Drone Type', FLAT_SEGMENT_TYPES['By Drone Type'], isVolume);
  entry['By Component'] = buildByComponentData(geo, isVolume);
  for (const [segType, segments] of Object.entries(FLAT_SEGMENT_TYPES)) {
    if (segType === 'By Drone Type') continue;
    entry[segType] = buildFlatSegmentData(geo, segType, segments, isVolume);
  }
  if (REGIONS.includes(geo)) {
    entry['By Country'] = buildByCountryData(geo, isVolume);
    if (geo === TOP_GEO) {
      entry['By Region'] = buildByRegionData(isVolume);
    }
  }
  return entry;
}

function buildFullData(isVolume) {
  const data = {};
  for (const geo of ALL_GEOS) {
    data[geo] = buildGeoEntry(geo, isVolume);
  }
  return data;
}

function buildSegmentationAnalysis() {
  const analysis = { [TOP_GEO]: {} };

  for (const [segType, segments] of Object.entries(FLAT_SEGMENT_TYPES)) {
    analysis[TOP_GEO][segType] = {};
    for (const seg of Object.keys(segments)) {
      analysis[TOP_GEO][segType][seg] = {};
    }
  }

  analysis[TOP_GEO]['By Component'] = {
    Hardware: {},
    Software: {},
    Services: {},
  };
  for (const leaf of Object.keys(BY_COMPONENT_HARDWARE)) {
    analysis[TOP_GEO]['By Component'].Hardware[leaf] = {};
  }
  for (const leaf of Object.keys(BY_COMPONENT_SERVICES)) {
    analysis[TOP_GEO]['By Component'].Services[leaf] = {};
  }

  analysis[TOP_GEO]['By Region'] = {};
  for (const region of REGIONS) {
    analysis[TOP_GEO]['By Region'][region] = {};
    for (const country of GEO_HIERARCHY[region]) {
      analysis[TOP_GEO]['By Region'][region][country] = {};
    }
  }

  return analysis;
}

seed = 42;
const valueData = buildFullData(false);
seed = 7777;
const volumeData = buildFullData(true);
const segmentationAnalysis = buildSegmentationAnalysis();

const outDir = path.join(__dirname, 'public', 'data');
fs.writeFileSync(path.join(outDir, 'value.json'), JSON.stringify(valueData, null, 2));
fs.writeFileSync(path.join(outDir, 'volume.json'), JSON.stringify(volumeData, null, 2));
fs.writeFileSync(
  path.join(outDir, 'segmentation_analysis.json'),
  JSON.stringify(segmentationAnalysis, null, 2)
);

console.log('Generated East Africa Crop Monitoring Drones market data successfully');
console.log('Geographies:', Object.keys(valueData).length, Object.keys(valueData));
console.log(
  `Segment types at ${TOP_GEO}:`,
  Object.keys(valueData[TOP_GEO]).filter((k) => k !== 'By Region' && k !== 'By Country')
);
console.log('Regions:', Object.keys(valueData[TOP_GEO]['By Region'] || {}));
console.log(
  `Sample ${TOP_GEO} By Drone Type 2023:`,
  valueData[TOP_GEO]['By Drone Type']['Rotary-Wing Drones']['2023']
);
