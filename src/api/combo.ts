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
    const url = getComboUrl('COMPANY');
    console.log('Fetching companies from URL:', url);

    const response = await api.get<CompanyResponse>(url);
    console.log('Companies API response:', response.data);

    if (response.data.success && response.data.data) {
      // Convert the object format to array of options
      const companies = Object.entries(response.data.data).map(([id, name]) => ({
        id,
        name
      }));
      console.log('Processed companies:', companies.length, 'items');
      return companies;
    }

    console.log('Companies API returned no data or unsuccessful response');
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
    const url = getComboUrl('COUNTRY');
    console.log('Fetching countries from URL:', url);

    const response = await api.get<CompanyResponse>(url);
    console.log('Countries API response:', response.data);

    if (response.data.success && response.data.data) {
      // Convert the object format to array of options
      const countries = Object.entries(response.data.data).map(([id, name]) => ({
        id,
        name
      }));
      console.log('Processed countries:', countries.length, 'items');
      return countries;
    }

    console.log('Countries API returned no data or unsuccessful response');
    return [];
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw new Error('Failed to fetch countries');
  }
};

/**
 * Fetch departments for dropdown
 */
export const fetchDepartments = async (): Promise<CompanyOption[]> => {
  try {
    const url = getComboUrl('DEPARTMENT');
    console.log('Fetching departments from URL:', url);

    const response = await api.get<CompanyResponse>(url);
    console.log('Departments API response:', response.data);

    if (response.data.success && response.data.data) {
      // Convert the object format to array of options
      const departments = Object.entries(response.data.data).map(([id, name]) => ({
        id,
        name
      }));
      console.log('Processed departments:', departments);
      return departments;
    }

    console.log('Departments API returned no data or unsuccessful response');
    return [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw new Error('Failed to fetch departments');
  }
};

/**
 * Fetch company types for dropdown
 */
export const fetchCompanyTypes = async (): Promise<CompanyOption[]> => {
  try {
    const url = getComboUrl('COMPANY_TYPE');
    console.log('Fetching company types from URL:', url);

    const response = await api.get<CompanyResponse>(url);
    console.log('Company types API response:', response.data);

    if (response.data.success && response.data.data) {
      // Convert the object format to array of options
      const companyTypes = Object.entries(response.data.data).map(([id, name]) => ({
        id,
        name
      }));
      console.log('Processed company types:', companyTypes);
      return companyTypes;
    }

    console.log('Company types API returned no data or unsuccessful response');
    return [];
  } catch (error) {
    console.error('Error fetching company types:', error);
    throw new Error('Failed to fetch company types');
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
