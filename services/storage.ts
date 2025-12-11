import { TeachingRecord } from '../types';

const STORAGE_KEY = 'dance_teaching_records_v1';

export const loadRecords = (): TeachingRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load records', e);
    return [];
  }
};

export const saveRecords = (records: TeachingRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records', e);
  }
};
