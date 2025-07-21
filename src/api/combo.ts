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
 * Fetch product types for dropdown
 */
export const fetchProductTypes = async (): Promise<CompanyOption[]> => {
  try {
    const url = getComboUrl('PRODUCT_TYPE');
    const response = await api.get<CompanyResponse>(url);

    if (response.data.success && response.data.data) {
      // Convert the object format to array of options
      const productTypes = Object.entries(response.data.data).map(([id, name]) => ({
        id,
        name
      }));

      return productTypes;
    }


    return [];
  } catch (error) {
    console.warn('Product types API not available, using default values:', error);
    return [];
  }
};

/**
 * Fetch regions for dropdown
 */
export const fetchRegions = async (): Promise<CompanyOption[]> => {
  try {
    const url = getComboUrl('REGION');
    console.log('Fetching regions from URL:', url);

    const response = await api.get<CompanyResponse>(url);
    console.log('Regions API response:', response.data);

    if (response.data.success && response.data.data) {
      // Convert the object format to array of options
      const regions = Object.entries(response.data.data).map(([id, name]) => ({
        id,
        name
      }));
      console.log('Processed regions:', regions.length, 'items');
      return regions;
    }

    console.log('Regions API returned no data or unsuccessful response');
    return [];
  } catch (error) {
    console.error('Error fetching regions:', error);
    throw new Error('Failed to fetch regions');
  }
};

/**
 * @deprecated Use fetchProductTypes instead. This is kept for backward compatibility.
 */
export const fetchCompanyTypes = fetchProductTypes;

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
