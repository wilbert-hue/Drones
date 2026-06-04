const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SOURCE_FILE =
  'Sample Framework_Customer Database_East Africa Crop Monitoring Drones Market_CMI.xlsx';
const OUTPUT_FILE = path.join(__dirname, 'public', 'data', 'customer-intelligence.json');

const EXCLUDED_COMPANIES = new Set([]);

const SHEET_CONFIG = {
  proposition1: {
    sheet: 'Proposition 1 - Basic',
    label: 'Proposition 1 - Basic',
    id: 'proposition-1',
    columns: [
      'customerNameCompanyName',
      'countryCoverage',
      'businessOverview',
      'exactCustomerType',
      'cropMonitoringDroneUseCase',
      'revenueOrBudgetStatus',
      'customerSizeScale',
      'keyContactPerson',
      'designationRole',
      'emailAddress',
      'phoneWhatsappNumber',
      'linkedInProfile',
    ],
  },
  proposition2: {
    sheet: 'Proposition 2 - Advance',
    label: 'Proposition 2 - Advance',
    id: 'proposition-2',
    columns: [
      'customerNameCompanyName',
      'countryCoverage',
      'businessOverview',
      'exactCustomerType',
      'cropMonitoringDroneUseCase',
      'revenueOrBudgetStatus',
      'customerSizeScale',
      'keyContactPerson',
      'designationRole',
      'emailAddress',
      'phoneWhatsappNumber',
      'linkedInProfile',
      'websiteUrl',
      'keyBuyingCriteria',
      'keyPainPoints',
      'upcomingTriggersAndInitiatives',
      'budgetOwnership',
    ],
  },
  proposition3: {
    sheet: 'Proposition 3 - Premium',
    label: 'Proposition 3 - Premium',
    id: 'proposition-3',
    columns: [
      'customerNameCompanyName',
      'countryCoverage',
      'businessOverview',
      'exactCustomerType',
      'cropMonitoringDroneUseCase',
      'revenueOrBudgetStatus',
      'customerSizeScale',
      'keyContactPerson',
      'designationRole',
      'emailAddress',
      'phoneWhatsappNumber',
      'linkedInProfile',
      'websiteUrl',
      'keyBuyingCriteria',
      'keyPainPoints',
      'upcomingTriggersAndInitiatives',
      'budgetOwnership',
      'procurementModel',
      'vendorSelectionCriteria',
      'preferredEngagementType',
      'preferredDeploymentModel',
      'preferredSolutionType',
      'integrationTechnicalServiceRequirements',
      'performanceExpectations',
      'customerBenchmarkingSummary',
    ],
  },
};

function normalizeCell(value, preserveNewlines = false) {
  const raw = String(value ?? '');
  if (preserveNewlines) {
    return raw
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n');
  }
  return raw.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractTitleLines(rows) {
  const raw = String(rows[0]?.[0] || rows[0]?.[1] || '');
  return raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

function findHeaderRow(rows) {
  for (let r = 0; r < Math.min(rows.length, 12); r++) {
    const idx = rows[r].findIndex((cell) => {
      const text = String(cell).trim();
      return (
        text === 'Customer or Company Name' ||
        text === 'Customer Name/Company Name' ||
        text.startsWith('Customer Name/Company') ||
        text.startsWith('Customer or Company')
      );
    });
    if (idx !== -1) {
      return { headerRowIdx: r, companyColIdx: idx };
    }
  }
  return null;
}

function appendMultilineField(existing, value) {
  const next = normalizeCell(value, true);
  if (!next) return existing;
  return existing ? `${existing}\n${next}` : next;
}

function isPlaceholder(value) {
  const text = normalizeCell(value).toLowerCase();
  if (!text) return true;
  if (text === 'xx') return true;
  if (text === 'to be mapped') return true;
  if (text.includes('to be mapped')) return true;
  return false;
}

/** Demo contact and budget data aligned to each East Africa crop-monitoring customer row */
const DEMO_FILLS_BY_INDEX = [
  {
    revenueOrBudgetStatus: 'USD 42 Million annual group revenue, 2024',
    keyContactPerson: 'James Mwangi',
    emailAddress: 'james.mwangi@kakuzi.co.ke',
    phoneWhatsappNumber: '+254 722 415 803',
    linkedInProfile: 'linkedin.com/in/james-mwangi-kakuzi-agronomy',
  },
  {
    revenueOrBudgetStatus: 'USD 28 Million annual revenue, 2024',
    keyContactPerson: 'Grace Wanjiru',
    emailAddress: 'grace.wanjiru@sasini.co.ke',
    phoneWhatsappNumber: '+254 733 902 114',
    linkedInProfile: 'linkedin.com/in/grace-wanjiru-estate-ops',
  },
  {
    revenueOrBudgetStatus: 'USD 95 Million annual revenue, 2024',
    keyContactPerson: 'Joseph Ndunguru',
    emailAddress: 'j.ndunguru@kagera-sugar.co.tz',
    phoneWhatsappNumber: '+255 754 220 618',
    linkedInProfile: 'linkedin.com/in/joseph-ndunguru-sugar-ops',
  },
  {
    revenueOrBudgetStatus: 'USD 72 Million annual revenue, 2024',
    keyContactPerson: 'Amina Hassan',
    emailAddress: 'a.hassan@tpc.co.tz',
    phoneWhatsappNumber: '+255 784 331 902',
    linkedInProfile: 'linkedin.com/in/amina-hassan-tpc-agriculture',
  },
  {
    revenueOrBudgetStatus: 'USD 18 Million annual revenue, 2024',
    keyContactPerson: 'Emmanuel Niyonsaba',
    emailAddress: 'e.niyonsaba@rwandamountaintea.com',
    phoneWhatsappNumber: '+250 788 412 305',
    linkedInProfile: 'linkedin.com/in/emmanuel-niyonsaba-tea-estate',
  },
  {
    revenueOrBudgetStatus: 'USD 24 Million annual export revenue, 2024',
    keyContactPerson: 'Selamawit Bekele',
    emailAddress: 'selamawit.bekele@metadplc.com',
    phoneWhatsappNumber: '+251 911 558 742',
    linkedInProfile: 'linkedin.com/in/selamawit-bekele-coffee-ops',
  },
  {
    revenueOrBudgetStatus: 'USD 210 Million annual program budget, 2024',
    keyContactPerson: 'David Kariuki',
    emailAddress: 'david.kariuki@oneacrefund.org',
    phoneWhatsappNumber: '+254 700 882 441',
    linkedInProfile: 'linkedin.com/in/david-kariuki-digital-agriculture',
  },
  {
    revenueOrBudgetStatus: 'USD 12 Million annual operating budget, 2024',
    keyContactPerson: 'Wanjiku Kamau',
    emailAddress: 'wanjiku.kamau@apolloagriculture.com',
    phoneWhatsappNumber: '+254 719 334 508',
    linkedInProfile: 'linkedin.com/in/wanjiku-kamau-agri-finance',
  },
  {
    revenueOrBudgetStatus: 'USD 8 Million annual revenue, 2024',
    keyContactPerson: 'Brian Ochieng',
    emailAddress: 'brian.ochieng@komaza.com',
    phoneWhatsappNumber: '+254 728 901 223',
    linkedInProfile: 'linkedin.com/in/brian-ochieng-agroforestry-ops',
  },
  {
    revenueOrBudgetStatus: 'USD 3.5 Million annual program budget, 2024',
    keyContactPerson: 'Sarah Nakato',
    emailAddress: 'sarah.nakato@flyinglabs.org',
    phoneWhatsappNumber: '+256 772 445 901',
    linkedInProfile: 'linkedin.com/in/sarah-nakato-drone-agriculture',
  },
  {
    revenueOrBudgetStatus: 'USD 140 Million national research budget, 2025',
    customerSizeScale: 'National research institution with multi regional crop and livestock programs',
    keyContactPerson: 'Dr. Peter Mutua',
    emailAddress: 'peter.mutua@kalro.org',
    phoneWhatsappNumber: '+254 722 608 115',
    linkedInProfile: 'linkedin.com/in/peter-mutua-kalro-research',
  },
  {
    revenueOrBudgetStatus: 'USD 62 Million public research allocation, 2025',
    customerSizeScale: 'National agricultural research authority with zonal institutes across Tanzania',
    keyContactPerson: 'Dr. Neema Swai',
    emailAddress: 'n.swai@tari.go.tz',
    phoneWhatsappNumber: '+255 754 882 340',
    linkedInProfile: 'linkedin.com/in/neema-swai-tari-research',
  },
  {
    revenueOrBudgetStatus: 'USD 48 Million public research budget, 2025',
    customerSizeScale: 'National agricultural research organization with crop institute network',
    keyContactPerson: 'Dr. Moses Okello',
    emailAddress: 'm.okello@naro.go.ug',
    phoneWhatsappNumber: '+256 772 903 441',
    linkedInProfile: 'linkedin.com/in/moses-okello-naro-agriculture',
  },
  {
    revenueOrBudgetStatus: 'USD 55 Million national agriculture program budget, 2025',
    customerSizeScale: 'National agriculture and animal resources development agency',
    keyContactPerson: 'Jean Claude Habimana',
    emailAddress: 'j.habimana@rab.gov.rw',
    phoneWhatsappNumber: '+250 788 220 517',
    linkedInProfile: 'linkedin.com/in/jean-claude-habimana-rab-crops',
  },
  {
    revenueOrBudgetStatus: 'USD 110 Million national research budget, 2025',
    customerSizeScale: 'Federal agricultural research institute with regional research centers',
    keyContactPerson: 'Dr. Almaz Tadesse',
    emailAddress: 'almaz.tadesse@eiar.gov.et',
    phoneWhatsappNumber: '+251 911 704 332',
    linkedInProfile: 'linkedin.com/in/almaz-tadesse-eiar-research',
  },
  {
    revenueOrBudgetStatus: 'USD 16 Million cooperative turnover, 2024',
    customerSizeScale: 'Large rice cooperative serving thousands of paddy farmers in Mwea',
    keyContactPerson: 'Francis Njogu',
    emailAddress: 'f.njogu@mrgm.co.ke',
    phoneWhatsappNumber: '+254 722 518 904',
    linkedInProfile: 'linkedin.com/in/francis-njogu-rice-cooperative',
  },
  {
    revenueOrBudgetStatus: 'USD 22 Million union export revenue, 2024',
    customerSizeScale: 'Coffee union representing hundreds of primary cooperatives in Oromia',
    keyContactPerson: 'Tadesse Gemechu',
    emailAddress: 't.gemechu@oromiacoffeeunion.com',
    phoneWhatsappNumber: '+251 911 882 104',
    linkedInProfile: 'linkedin.com/in/tadesse-gemechu-coffee-union',
  },
  {
    revenueOrBudgetStatus: 'USD 14 Million organization budget, 2024',
    customerSizeScale: 'National coffee farmer union and agribusiness support network',
    keyContactPerson: 'Robert Musoke',
    emailAddress: 'r.musoke@nucafe.org',
    phoneWhatsappNumber: '+256 772 618 903',
    linkedInProfile: 'linkedin.com/in/robert-musoke-coffee-agribusiness',
  },
  {
    revenueOrBudgetStatus: 'Private, not disclosed',
    customerSizeScale: 'Regional drone services provider with agriculture and mapping contracts',
    keyContactPerson: 'Michael Otieno',
    emailAddress: 'michael.otieno@astral-aerial.com',
    phoneWhatsappNumber: '+254 733 441 802',
    linkedInProfile: 'linkedin.com/in/michael-otieno-drone-agriculture',
  },
  {
    revenueOrBudgetStatus: 'Private, not disclosed',
    customerSizeScale: 'East Africa based unmanned aircraft systems and crop analytics provider',
    keyContactPerson: 'Charity Wambui',
    emailAddress: 'charity.wambui@charisuas.com',
    phoneWhatsappNumber: '+254 718 902 667',
    linkedInProfile: 'linkedin.com/in/charity-wambui-precision-ag-drones',
  },
];

const DEMO_PREMIUM_BENCHMARKING = [
  'High priority due to export horticulture quality requirements and large perennial crop blocks suited to multispectral drone monitoring',
  'High priority because multi crop estate scale supports recurring drone surveys across tea, coffee, and macadamia zones',
  'High priority for sugarcane irrigation and harvest planning where stand count and stress mapping deliver clear return on investment',
  'High priority for integrated sugar estate operations needing cane maturity zoning and drainage stress detection',
  'High priority for hillside tea gardens and outgrower visibility where drone block analytics improve advisory coverage',
  'High priority for coffee estate and outgrower traceability programs requiring disease scouting and canopy health mapping',
  'Very high priority because multi country smallholder networks can scale drone monitoring through demonstration farms and cluster analytics',
  'High priority for financed farm portfolios where crop risk monitoring supports insurance validation and input performance tracking',
  'High priority for distributed agroforestry plots where tree survival and canopy growth mapping are core operational needs',
  'High priority for Uganda drone ecosystem pilots linking crop health assessment to farmer demonstration programs',
  'High priority because national research programs can drive drone based crop monitoring pilots across multiple crop institutes',
];

function applyDemoFill(record, rowIndex) {
  const demo = DEMO_FILLS_BY_INDEX[rowIndex];
  if (!demo) return;

  for (const [key, value] of Object.entries(demo)) {
    if (isPlaceholder(record[key])) {
      record[key] = value;
    }
  }

  const benchmark = DEMO_PREMIUM_BENCHMARKING[rowIndex];
  if (benchmark && isPlaceholder(record.customerBenchmarkingSummary)) {
    record.customerBenchmarkingSummary = benchmark;
  }
}

function parseSheet(wb, config) {
  const ws = wb.Sheets[config.sheet];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const titleLines = extractTitleLines(rows);
  const header = findHeaderRow(rows);

  if (!header) {
    throw new Error(`Could not find header row in sheet "${config.sheet}"`);
  }

  const { headerRowIdx, companyColIdx } = header;
  const sNoColIdx = companyColIdx - 1;
  const dataRows = [];

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const sNo = row[sNoColIdx];
    const company = row[companyColIdx];

    if (
      String(company).trim() === 'Customer or Company Name' ||
      String(company).trim() === 'Customer Name/Company Name'
    ) {
      continue;
    }

    if (!company) {
      const prev = dataRows[dataRows.length - 1];
      const altContact = normalizeCell(row[companyColIdx + 5]);
      if (prev && altContact) {
        prev.keyContactPerson = appendMultilineField(prev.keyContactPerson, altContact);
        prev.designationRole = appendMultilineField(prev.designationRole, row[companyColIdx + 6]);
        prev.emailAddress = appendMultilineField(prev.emailAddress, row[companyColIdx + 7]);
        prev.phoneWhatsappNumber = appendMultilineField(
          prev.phoneWhatsappNumber,
          row[companyColIdx + 8]
        );
        prev.linkedInProfile = appendMultilineField(prev.linkedInProfile, row[companyColIdx + 9]);
        if (config.columns.includes('websiteUrl')) {
          prev.websiteUrl = appendMultilineField(prev.websiteUrl, row[companyColIdx + 10]);
        }
      }
      continue;
    }

    if (!sNo && !company) continue;

    const companyName = normalizeCell(company);
    if (EXCLUDED_COMPANIES.has(companyName)) continue;

    const record = { sNo: normalizeCell(sNo) };
    config.columns.forEach((key, idx) => {
      record[key] = normalizeCell(row[companyColIdx + idx] ?? '', key === 'businessOverview');
    });
    dataRows.push(record);
  }

  dataRows.forEach((record, index) => {
    record.sNo = String(index + 1);
    applyDemoFill(record, index);
  });

  return { titleLines, rows: dataRows };
}

function main() {
  const wb = XLSX.readFile(SOURCE_FILE);
  const prop1 = parseSheet(wb, SHEET_CONFIG.proposition1);
  const prop2 = parseSheet(wb, SHEET_CONFIG.proposition2);
  const prop3 = parseSheet(wb, SHEET_CONFIG.proposition3);

  const titleLines = prop1.titleLines.length ? prop1.titleLines : prop3.titleLines;
  const marketTitle =
    titleLines[0] || 'East Africa Crop Monitoring Drones Market - Customer Database';
  const subtitle = titleLines[1] || 'Verified directory and insight on customers';
  const entityNote = titleLines[2] || undefined;

  const output = {
    marketTitle,
    subtitle,
    ...(entityNote ? { entityNote } : {}),
    proposition1: {
      id: SHEET_CONFIG.proposition1.id,
      label: SHEET_CONFIG.proposition1.label,
      titleLines,
      rows: prop1.rows,
    },
    proposition2: {
      id: SHEET_CONFIG.proposition2.id,
      label: SHEET_CONFIG.proposition2.label,
      titleLines,
      rows: prop2.rows,
    },
    proposition3: {
      id: SHEET_CONFIG.proposition3.id,
      label: SHEET_CONFIG.proposition3.label,
      titleLines,
      rows: prop3.rows,
    },
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log('Written', OUTPUT_FILE);
  console.log('Source:', SOURCE_FILE);
  console.log('P1 rows:', output.proposition1.rows.length);
  console.log('P2 rows:', output.proposition2.rows.length);
  console.log('P3 rows:', output.proposition3.rows.length);
  console.log('Sample P1:', output.proposition1.rows[0]?.customerNameCompanyName);
  console.log('Sample P1 contact:', output.proposition1.rows[0]?.keyContactPerson);
  const remainingPlaceholders = output.proposition1.rows.filter((r) =>
    ['revenueOrBudgetStatus', 'keyContactPerson', 'emailAddress', 'phoneWhatsappNumber', 'linkedInProfile'].some(
      (k) => isPlaceholder(r[k])
    )
  ).length;
  console.log('P1 rows still missing contact demo data:', remainingPlaceholders);
}

main();
