import type { Contact } from '../types';

export const MOCK_CONTACTS: Contact[] = [
    {
        id: '1',
        company: 'Pharma Corp',
        name: 'John Smith',
        email: 'john.smith@pharmaco.com',
        phone: '+1-555-0123',
        country: 'USA',
        city: 'New York',
        department: 'R&D',
        designation: 'Research Director',
        industry: 'Pharmaceuticals',
        companySize: '1000+',
        lastContact: '2024-03-15T10:00:00Z',
        status: 'Active'
    },
    {
        id: '2',
        company: 'MediTech Solutions',
        name: 'Emma Johnson',
        email: 'emma.j@meditech.com',
        phone: '+44-20-7123-4567',
        country: 'UK',
        city: 'London',
        department: 'Sales',
        designation: 'Sales Manager',
        industry: 'Medical Devices',
        companySize: '500-1000',
        lastContact: '2024-03-14T15:30:00Z',
        status: 'Active'
    },
    {
        id: '3',
        company: 'BioGen Research',
        name: 'Michael Chen',
        email: 'm.chen@biogen.com',
        phone: '+1-555-0456',
        country: 'USA',
        city: 'Boston',
        department: 'R&D',
        designation: 'Senior Researcher',
        industry: 'Biotechnology',
        companySize: '100-500',
        lastContact: '2024-03-13T09:15:00Z',
        status: 'Inactive'
    },
    {
        id: '4',
        company: 'Global Pharma Ltd',
        name: 'Sarah Williams',
        email: 's.williams@globalpharma.com',
        phone: '+61-2-8123-4567',
        country: 'Australia',
        city: 'Sydney',
        department: 'Marketing',
        designation: 'Marketing Director',
        industry: 'Pharmaceuticals',
        companySize: '1000+',
        lastContact: '2024-03-12T14:45:00Z',
        status: 'Active'
    },
    {
        id: '5',
        company: 'HealthCare Plus',
        name: 'David Miller',
        email: 'd.miller@hcplus.com',
        phone: '+1-555-0789',
        country: 'Canada',
        city: 'Toronto',
        department: 'Supply Chain',
        designation: 'Supply Chain Manager',
        industry: 'Healthcare',
        companySize: '500-1000',
        lastContact: '2024-03-11T11:20:00Z',
        status: 'Active'
    },
    {
        id: '6',
        company: 'PharmaTech GmbH',
        name: 'Anna Schmidt',
        email: 'a.schmidt@pharmatech.de',
        phone: '+49-30-1234-5678',
        country: 'Germany',
        city: 'Berlin',
        department: 'R&D',
        designation: 'Lead Scientist',
        industry: 'Pharmaceuticals',
        companySize: '100-500',
        lastContact: '2024-03-10T16:00:00Z',
        status: 'Inactive'
    }
];

export const DEPARTMENTS = [
    'All',
    'R&D',
    'Sales',
    'Marketing',
    'Supply Chain',
    'Purchase',
];

export const COUNTRIES = [
    'All',
    'USA',
    'UK',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'India'
];

export const INDUSTRIES = [
    'All',
    'Pharmaceuticals',
    'Medical Devices',
    'Biotechnology',
    'Healthcare',
    'Research'
];

export const COMPANY_SIZES = [
    'All',
    '1-50',
    '51-100',
    '100-500',
    '500-1000',
    '1000+'
];

export const STATUSES = [
    'All',
    'Active',
    'Inactive'
]; 