/**
 * Combo/Dropdown Data API
 * 
 * API functions for fetching dropdown/combo data
 */

import api from './config';
import { getComboUrl } from './utils';

// Interface for company response
export interface CompanyResponse {
  success: boolean;
  data: Record<string, string>; // { "1": "Company Name 1", "2": "Company Name 2", ... }
}

// Interface for processed company option
export interface CompanyOption {
  id: string;
  name: string;
}

/**
 * Fetch companies for dropdown
 */
export const fetchCompanies = async (): Promise<CompanyOption[]> => {
  try {
    const response = await api.get<CompanyResponse>(getComboUrl('COMPANY'));

    if (response.data.success && response.data.data) {
      // Convert the object format to array of options
      return Object.entries(response.data.data).map(([id, name]) => ({
        id,
        name
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies');
  }
};

/**
 * Fetch countries for dropdown
 */
export const fetchCountries = async (): Promise<CompanyOption[]> => {
  try {
    const response = await api.get<CompanyResponse>(getComboUrl('COUNTRY'));

    if (response.data.success && response.data.data) {
      // Convert the object format to array of options
      return Object.entries(response.data.data).map(([id, name]) => ({
        id,
        name
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw new Error('Failed to fetch countries');
  }
};

/**
 * Search companies by name (client-side filtering)
 */
export const searchCompanies = (companies: CompanyOption[], searchTerm: string): CompanyOption[] => {
  if (!searchTerm.trim()) {
    return companies;
  }

  const term = searchTerm.toLowerCase();
  return companies.filter(company =>
    company.name.toLowerCase().includes(term)
  );
};
