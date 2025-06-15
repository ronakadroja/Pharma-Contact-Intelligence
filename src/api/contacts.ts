import api from './config';

export interface Contact {
    company_name: string;
    person_name: string;
    department: string;
    designation: string;
    company_type: string | null;
    city: string;
    person_country: string;
    company_country: string;
    company_website: string | null;
    status: 'Active' | 'Inactive';
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
    designation?: string;
    person_country?: string;
    city?: string;
    page?: number;
    per_page?: number;
}

export const getContacts = async (params?: ContactSearchParams): Promise<ContactsResponse> => {
    try {
        const response = await api.get<ContactsResponse>('/contacts', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
    }
}; 