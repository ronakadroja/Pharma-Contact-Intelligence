import api from './config';
import { getContactUrl } from './utils';

export interface Contact {
    id: string;
    company_name: string;
    person_name: string;
    department: string;
    designation: string;
    company_type: string;
    email: string;
    phone: string;
    city: string;
    person_country: string;
    company_country: string;
    reference: string;
    person_linkedin_url: string;
    company_linkedin_url: string;
    company_website: string;
    status: string;
    is_verified: number; // 1 for verified, 0 for not verified
}

export interface ContactsResponse {
    current_page: number;
    data: Contact[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface ContactSearchParams {
    company_name?: string;
    person_name?: string;
    department?: string;
    designation?: string;
    company_type?: string;
    person_country?: string;
    company_country?: string;
    city?: string;
    page?: number;
    per_page?: number;
}

export const getContacts = async (params?: ContactSearchParams): Promise<ContactsResponse> => {
    try {
        // Filter out empty string values from params
        const filteredParams = params ? Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '')
        ) : {};

        const response = await api.get<ContactsResponse>(getContactUrl('BASE'), { params: filteredParams });
        return response.data;
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
    }
};

export interface ContactPayload {
    company_name: string;
    person_name: string;
    department: string;
    designation: string;
    company_type: string;
    email: string;
    phone?: string;
    city?: string;
    person_country: string;
    company_country: string;
    reference?: string;
    person_linkedin_url?: string;
    company_linkedin_url: string;
    company_website: string;
    status: string;
    is_verified?: number;
}

export const addContact = async (contactData: ContactPayload): Promise<Contact> => {
    try {
        const response = await api.post<Contact>(getContactUrl('CREATE'), contactData);
        return response.data;
    } catch (error) {
        console.error('Error adding contact:', error);
        throw error;
    }
};

export const updateContact = async (id: string, contactData: Partial<ContactPayload>): Promise<Contact> => {
    try {
        const response = await api.put<Contact>(getContactUrl('UPDATE', id), contactData);
        return response.data;
    } catch (error) {
        console.error('Error updating contact:', error);
        throw error;
    }
};

export const deleteContact = async (id: string): Promise<void> => {
    try {
        await api.delete(getContactUrl('DELETE', id));
    } catch (error) {
        console.error('Error deleting contact:', error);
        throw error;
    }
};

export const updateContactStatus = async (id: string, status: 'Active' | 'Inactive'): Promise<Contact> => {
    try {
        const response = await api.patch<Contact>(getContactUrl('STATUS', id), { status });
        return response.data;
    } catch (error) {
        console.error('Error updating contact status:', error);
        throw error;
    }
};

export interface RevealContactResponse {
    contact: Contact;
    available_credit: number;
}

export const revealContact = async (id: string): Promise<RevealContactResponse> => {
    try {
        const response = await api.post<RevealContactResponse>(getContactUrl('REVEAL', id));
        return response.data;
    } catch (error) {
        console.error('Error revealing contact:', error);
        throw error;
    }
};

export interface SavedContactsResponse {
    available_credit: string;
    my_list: Array<{
        company_name: string;
        person_name: string;
        department: string;
        designation: string;
        company_type: string | null;
        email: string;
        phone_number: string;
        city: string;
        person_country: string;
        company_country: string;
        person_linkedin_url: string | null;
        company_linkedin_url: string | null;
        company_website: string | null;
        status: 'Active' | 'Inactive';
        is_verified: number; // 1 for verified, 0 for not verified
    }>;
}

export const getSavedContacts = async (): Promise<SavedContactsResponse> => {
    try {
        const url = getContactUrl('SAVED');
        console.log('Attempting to fetch saved contacts from URL:', url);
        const response = await api.get<SavedContactsResponse>(url);

        // Handle successful response with proper defaults
        const data = response.data;

        // If response is empty or null, return default structure
        if (!data || typeof data !== 'object') {
            console.log('Empty or invalid response, returning default structure');
            return {
                available_credit: '0',
                my_list: []
            };
        }

        // Ensure response has required structure
        const result: SavedContactsResponse = {
            available_credit: data.available_credit || '0',
            my_list: Array.isArray(data.my_list) ? data.my_list : []
        };

        console.log('Successfully fetched saved contacts:', {
            credit: result.available_credit,
            contactCount: result.my_list.length
        });

        return result;
    } catch (error) {
        console.error('Error fetching saved contacts:', error);
        console.error('Failed URL was:', getContactUrl('SAVED'));

        // Check if it's a 200 response with empty body
        if (error && typeof error === 'object' && 'response' in error) {
            const responseError = error as { response?: { status: number; data?: unknown } };
            if (responseError.response?.status === 200) {
                console.log('Received 200 status with empty response, treating as empty list');
                return {
                    available_credit: '0',
                    my_list: []
                };
            }
        }

        throw error;
    }
};

export interface BulkImportError {
    row: number;
    message: string;
}

export interface BulkImportResponse {
    success?: number;
    failure?: number;
    erros?: BulkImportError[];
    file?: string[];
    message?: string;
}

export const bulkImportContacts = async (file: File): Promise<BulkImportResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<BulkImportResponse>(getContactUrl('BULK_IMPORT'), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error importing contacts:', error);
        throw error;
    }
};