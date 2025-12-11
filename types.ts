export enum InstitutionType {
  DI_LE_BEI_BEI = '迪乐贝贝',
  IMPORT_EXPORT_BANK = '进出口银行',
  OTHER = '其他',
}

export interface TeachingRecord {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  institution: InstitutionType;
  customInstitution?: string; // Used if institution is OTHER
  amount: number;
  timestamp: number; // For sorting
}

export type ViewMode = 'dashboard' | 'add' | 'edit';
