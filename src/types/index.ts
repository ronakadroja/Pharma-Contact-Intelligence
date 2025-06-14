export type UserRole = 'admin' | 'user';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    credits: number;
    name: string;
}

export interface Contact {
    id: string;
    company: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    department: string;
    designation: string;
    industry: string;
    companySize: string;
    lastContact: string;
    status: string;
}

export interface FilterState {
    search: string;
    country: string;
    industry: string;
    status: string;
    companySize: string;
    department: string;
}
