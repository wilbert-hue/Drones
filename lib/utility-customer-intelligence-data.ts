export interface CustomerIntelligenceRow {
  sNo: number | string
  customerNameCompanyName: string
  countryCoverage: string
  businessOverview: string
  exactCustomerType: string
  cropMonitoringDroneUseCase: string
  revenueOrBudgetStatus: string
  customerSizeScale: string
  keyContactPerson: string
  designationRole: string
  emailAddress: string
  phoneWhatsappNumber: string
  linkedInProfile: string
  websiteUrl?: string
  keyBuyingCriteria?: string
  keyPainPoints?: string
  upcomingTriggersAndInitiatives?: string
  budgetOwnership?: string
  procurementModel?: string
  vendorSelectionCriteria?: string
  preferredEngagementType?: string
  preferredDeploymentModel?: string
  preferredSolutionType?: string
  integrationTechnicalServiceRequirements?: string
  performanceExpectations?: string
  customerBenchmarkingSummary?: string
}

export interface CustomerIntelligenceProposition {
  id: string
  label: string
  titleLines: string[]
  rows: CustomerIntelligenceRow[]
}

export interface CustomerIntelligenceData {
  marketTitle: string
  subtitle: string
  entityNote?: string
  proposition1: CustomerIntelligenceProposition
  proposition2: CustomerIntelligenceProposition
  proposition3: CustomerIntelligenceProposition
}

export interface TableColumnGroup {
  label: string
  subLabel?: string
  colSpan: number
  headerClass: string
}

export interface TableColumn {
  key: keyof CustomerIntelligenceRow
  label: string
  headerClass: string
  minWidth?: string
  isLink?: 'email' | 'url'
}

export const CUSTOMER_INFO_COLUMNS: TableColumn[] = [
  {
    key: 'customerNameCompanyName',
    label: 'Customer or Company Name',
    headerClass: 'bg-[#FFF8DC]',
    minWidth: '180px',
  },
  {
    key: 'countryCoverage',
    label: 'Country Coverage',
    headerClass: 'bg-[#FFF8DC]',
    minWidth: '140px',
  },
  { key: 'businessOverview', label: 'Business Overview', headerClass: 'bg-[#FFF8DC]', minWidth: '200px' },
  {
    key: 'exactCustomerType',
    label: 'Crop Monitoring Drone Exact Customer Type',
    headerClass: 'bg-[#FFF8DC]',
    minWidth: '220px',
  },
  {
    key: 'cropMonitoringDroneUseCase',
    label: 'Crop Monitoring Drone Use Case',
    headerClass: 'bg-[#FFF8DC]',
    minWidth: '220px',
  },
  {
    key: 'revenueOrBudgetStatus',
    label: 'Revenue or Budget Status',
    headerClass: 'bg-[#FFF8DC]',
    minWidth: '180px',
  },
]

export const CONTACT_COLUMNS: TableColumn[] = [
  { key: 'customerSizeScale', label: 'Size and Scale', headerClass: 'bg-[#B0E0E6]', minWidth: '180px' },
  {
    key: 'keyContactPerson',
    label: 'Relevant Key Contact Person',
    headerClass: 'bg-[#B0E0E6]',
    minWidth: '160px',
  },
  { key: 'designationRole', label: 'Role or Designation', headerClass: 'bg-[#B0E0E6]', minWidth: '170px' },
  { key: 'emailAddress', label: 'Email Address', headerClass: 'bg-[#B0E0E6]', minWidth: '150px', isLink: 'email' },
  {
    key: 'phoneWhatsappNumber',
    label: 'Phone Number or WhatsApp Number',
    headerClass: 'bg-[#B0E0E6]',
    minWidth: '170px',
  },
  { key: 'linkedInProfile', label: 'LinkedIn Profile', headerClass: 'bg-[#B0E0E6]', minWidth: '150px', isLink: 'url' },
]

export const CONTACT_COLUMNS_WITH_WEBSITE: TableColumn[] = [
  ...CONTACT_COLUMNS,
  { key: 'websiteUrl', label: 'Company Website', headerClass: 'bg-[#B0E0E6]', minWidth: '130px', isLink: 'url' },
]

export const BUYING_DRIVERS_COLUMNS_ADVANCE: TableColumn[] = [
  {
    key: 'keyBuyingCriteria',
    label: 'Drone Buying Criteria',
    headerClass: 'bg-[#B0E0E6]',
    minWidth: '220px',
  },
  {
    key: 'keyPainPoints',
    label: 'Crop Monitoring Pain Points',
    headerClass: 'bg-[#B0E0E6]',
    minWidth: '220px',
  },
  {
    key: 'upcomingTriggersAndInitiatives',
    label: 'Buying Trigger and Risk Exposure',
    headerClass: 'bg-[#B0E0E6]',
    minWidth: '240px',
  },
]

export const PURCHASING_BEHAVIOUR_COLUMNS_ADVANCE: TableColumn[] = [
  {
    key: 'budgetOwnership',
    label: 'Budget Owner',
    headerClass: 'bg-[#DDA0DD]',
    minWidth: '180px',
  },
]

export const BUYING_DRIVERS_COLUMNS_PREMIUM: TableColumn[] = [
  ...BUYING_DRIVERS_COLUMNS_ADVANCE,
  ...PURCHASING_BEHAVIOUR_COLUMNS_ADVANCE,
]

export const PURCHASING_BEHAVIOUR_COLUMNS_PREMIUM: TableColumn[] = [
  {
    key: 'procurementModel',
    label: 'Procurement Model',
    headerClass: 'bg-[#DDA0DD]',
    minWidth: '200px',
  },
  {
    key: 'vendorSelectionCriteria',
    label: 'Vendor Selection Criteria',
    headerClass: 'bg-[#DDA0DD]',
    minWidth: '200px',
  },
  {
    key: 'preferredEngagementType',
    label: 'Preferred Engagement Model',
    headerClass: 'bg-[#DDA0DD]',
    minWidth: '180px',
  },
  {
    key: 'preferredDeploymentModel',
    label: 'Preferred Deployment and Service Model',
    headerClass: 'bg-[#DDA0DD]',
    minWidth: '220px',
  },
]

export const SOLUTION_REQUIREMENTS_COLUMNS: TableColumn[] = [
  {
    key: 'preferredSolutionType',
    label: 'Preferred Solution Type',
    headerClass: 'bg-[#DEB887]',
    minWidth: '220px',
  },
  {
    key: 'integrationTechnicalServiceRequirements',
    label: 'Integration Technical and Service Requirements',
    headerClass: 'bg-[#DEB887]',
    minWidth: '240px',
  },
  {
    key: 'performanceExpectations',
    label: 'Performance Expectations',
    headerClass: 'bg-[#DEB887]',
    minWidth: '200px',
  },
]

export const CMI_INSIGHTS_COLUMNS_PREMIUM: TableColumn[] = [
  {
    key: 'customerBenchmarkingSummary',
    label: 'Benchmark Summary and Additional Coherent Market Insights Notes',
    headerClass: 'bg-[#B0E0E6]',
    minWidth: '280px',
  },
]

export type PropositionTableConfig = {
  groups: TableColumnGroup[]
  columns: TableColumn[]
}

export const PROPOSITION_TABLE_CONFIG: Record<'proposition1' | 'proposition2' | 'proposition3', PropositionTableConfig> = {
  proposition1: {
    groups: [
      { label: 'Customer Information', colSpan: 6, headerClass: 'bg-[#E8C4A0]' },
      { label: 'Contact Details', colSpan: 6, headerClass: 'bg-[#87CEEB]' },
    ],
    columns: [...CUSTOMER_INFO_COLUMNS, ...CONTACT_COLUMNS],
  },
  proposition2: {
    groups: [
      { label: 'Customer Information', colSpan: 6, headerClass: 'bg-[#E8C4A0]' },
      { label: 'Contact Details', colSpan: 7, headerClass: 'bg-[#87CEEB]' },
      { label: 'Buying Drivers', colSpan: 3, headerClass: 'bg-[#87CEEB]' },
      { label: 'Purchasing Behaviour Metrics', colSpan: 1, headerClass: 'bg-[#9370DB] text-white' },
    ],
    columns: [
      ...CUSTOMER_INFO_COLUMNS,
      ...CONTACT_COLUMNS_WITH_WEBSITE,
      ...BUYING_DRIVERS_COLUMNS_ADVANCE,
      ...PURCHASING_BEHAVIOUR_COLUMNS_ADVANCE,
    ],
  },
  proposition3: {
    groups: [
      { label: 'Customer Information', colSpan: 6, headerClass: 'bg-[#E8C4A0]' },
      { label: 'Contact Details', colSpan: 7, headerClass: 'bg-[#87CEEB]' },
      { label: 'Buying Drivers', colSpan: 4, headerClass: 'bg-[#87CEEB]' },
      { label: 'Purchasing Behaviour Metrics', colSpan: 4, headerClass: 'bg-[#9370DB] text-white' },
      { label: 'Solution Requirements', colSpan: 3, headerClass: 'bg-[#D4A574]' },
      { label: 'CMI Insights', colSpan: 1, headerClass: 'bg-[#87CEEB]' },
    ],
    columns: [
      ...CUSTOMER_INFO_COLUMNS,
      ...CONTACT_COLUMNS_WITH_WEBSITE,
      ...BUYING_DRIVERS_COLUMNS_PREMIUM,
      ...PURCHASING_BEHAVIOUR_COLUMNS_PREMIUM,
      ...SOLUTION_REQUIREMENTS_COLUMNS,
      ...CMI_INSIGHTS_COLUMNS_PREMIUM,
    ],
  },
}

export async function loadCustomerIntelligenceData(): Promise<CustomerIntelligenceData> {
  const response = await fetch('/data/customer-intelligence.json', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to load customer intelligence data')
  }
  return response.json()
}
