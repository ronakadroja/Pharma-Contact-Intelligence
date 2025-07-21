/**
 * Utility functions for Excel export with proper formatting and column widths
 */
import * as XLSX from 'xlsx';

export interface ExportColumn {
    header: string;
    accessor: string | ((item: any) => string);
    minWidth?: number;
    maxWidth?: number;
    type?: 'text' | 'number' | 'date' | 'email' | 'url';
    format?: string;
}

export interface ExportOptions {
    filename: string;
    columns: ExportColumn[];
    data: any[];
    includeTimestamp?: boolean;
}

/**
 * Escapes CSV field content for Excel compatibility
 */
export const escapeCsvField = (field: string): string => {
    if (!field) return '';

    const stringField = String(field);

    // Handle special characters and ensure proper Excel formatting
    if (stringField.includes(',') ||
        stringField.includes('"') ||
        stringField.includes('\n') ||
        stringField.includes('\r') ||
        stringField.includes(';')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }

    return stringField;
};

/**
 * Calculates optimal column widths based on content
 */
export const calculateColumnWidths = (columns: ExportColumn[], data: any[]): number[] => {
    return columns.map((column, index) => {
        let maxLength = column.header.length;

        data.forEach(item => {
            let cellValue = '';
            if (typeof column.accessor === 'string') {
                cellValue = item[column.accessor] || '';
            } else {
                cellValue = column.accessor(item) || '';
            }
            maxLength = Math.max(maxLength, String(cellValue).length);
        });

        // Apply min/max width constraints
        const minWidth = column.minWidth || 12;
        const maxWidth = column.maxWidth || 50;

        return Math.min(Math.max(maxLength + 2, minWidth), maxWidth);
    });
};

/**
 * Generates properly formatted Excel (.xlsx) file with styling and column widths
 */
export const generateFormattedExcel = (options: ExportOptions): ArrayBuffer => {
    const { columns, data } = options;

    // Calculate optimal column widths
    const columnWidths = calculateColumnWidths(columns, data);

    // Prepare headers
    const headers = columns.map(col => col.header);

    // Prepare data rows with proper typing
    const excelData = data.map(item =>
        columns.map(column => {
            let value: any;
            if (typeof column.accessor === 'string') {
                value = item[column.accessor] || '';
            } else {
                value = column.accessor(item) || '';
            }

            // Convert based on column type
            switch (column.type) {
                case 'number':
                    return isNaN(Number(value)) ? value : Number(value);
                case 'date':
                    return value ? new Date(value) : value;
                case 'email':
                case 'url':
                case 'text':
                default:
                    return String(value);
            }
        })
    );

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData]);

    // Set column widths
    const colWidths = columnWidths.map(width => ({ wch: width }));
    worksheet['!cols'] = colWidths;

    // Apply header styling
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;

        worksheet[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "366092" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            }
        };
    }

    // Apply data cell styling and formatting
    for (let row = 1; row <= excelData.length; row++) {
        for (let col = 0; col < columns.length; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (!worksheet[cellAddress]) continue;

            const column = columns[col];
            const isEvenRow = row % 2 === 0;

            worksheet[cellAddress].s = {
                alignment: {
                    horizontal: column.type === 'number' ? 'right' : 'left',
                    vertical: 'center',
                    wrapText: true
                },
                fill: {
                    fgColor: { rgb: isEvenRow ? "F8F9FA" : "FFFFFF" }
                },
                border: {
                    top: { style: "thin", color: { rgb: "E0E0E0" } },
                    bottom: { style: "thin", color: { rgb: "E0E0E0" } },
                    left: { style: "thin", color: { rgb: "E0E0E0" } },
                    right: { style: "thin", color: { rgb: "E0E0E0" } }
                }
            };

            // Apply specific formatting based on column type
            switch (column.type) {
                case 'email':
                    if (worksheet[cellAddress].v) {
                        worksheet[cellAddress].l = { Target: `mailto:${worksheet[cellAddress].v}` };
                        worksheet[cellAddress].s.font = { color: { rgb: "0066CC" }, underline: true };
                    }
                    break;
                case 'url':
                    if (worksheet[cellAddress].v) {
                        worksheet[cellAddress].l = { Target: worksheet[cellAddress].v };
                        worksheet[cellAddress].s.font = { color: { rgb: "0066CC" }, underline: true };
                    }
                    break;
                case 'date':
                    if (column.format) {
                        worksheet[cellAddress].z = column.format;
                    }
                    break;
            }
        }
    }

    // Set row heights for better readability
    const rowHeights = Array(excelData.length + 1).fill({ hpt: 20 });
    rowHeights[0] = { hpt: 25 }; // Header row slightly taller
    worksheet['!rows'] = rowHeights;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    // Generate Excel file buffer
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};

/**
 * Generates Excel-compatible CSV content with proper formatting (fallback)
 */
export const generateExcelCSV = (options: ExportOptions): string => {
    const { columns, data } = options;

    // Prepare headers
    const headers = columns.map(col => col.header);

    // Prepare data rows
    const csvData = data.map(item =>
        columns.map(column => {
            if (typeof column.accessor === 'string') {
                return item[column.accessor] || '';
            } else {
                return column.accessor(item) || '';
            }
        })
    );

    // Create CSV content with BOM for proper UTF-8 encoding in Excel
    const csvContent = [
        '\uFEFF', // BOM for UTF-8
        headers.map(escapeCsvField).join(','),
        ...csvData.map(row => row.map(field => escapeCsvField(String(field))).join(','))
    ].join('\n');

    return csvContent;
};

/**
 * Downloads Excel file with proper formatting and styling
 */
export const downloadExcel = (options: ExportOptions): void => {
    try {
        const excelBuffer = generateFormattedExcel(options);

        // Create blob and download
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // Generate filename with timestamp if requested
        let filename = options.filename;
        if (options.includeTimestamp !== false) {
            const timestamp = new Date().toISOString().split('T')[0];
            const nameParts = filename.split('.');
            if (nameParts.length > 1) {
                nameParts.pop(); // Remove existing extension
                filename = `${nameParts.join('.')}-${timestamp}.xlsx`;
            } else {
                filename = `${filename}-${timestamp}.xlsx`;
            }
        } else if (!filename.endsWith('.xlsx')) {
            filename = `${filename}.xlsx`;
        }

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating Excel file:', error);
        // Fallback to CSV if Excel generation fails
        downloadCSV(options);
    }
};

/**
 * Downloads CSV file with proper formatting (fallback)
 */
export const downloadCSV = (options: ExportOptions): void => {
    const csvContent = generateExcelCSV(options);

    // Create blob and download
    const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate filename with timestamp if requested
    let filename = options.filename;
    if (options.includeTimestamp !== false) {
        const timestamp = new Date().toISOString().split('T')[0];
        const nameParts = filename.split('.');
        if (nameParts.length > 1) {
            const extension = nameParts.pop();
            filename = `${nameParts.join('.')}-${timestamp}.${extension}`;
        } else {
            filename = `${filename}-${timestamp}.csv`;
        }
    }

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Contact-specific export utility with Excel formatting
 */
export const exportContacts = (
    contacts: any[],
    type: 'selected' | 'all',
    onSuccess?: (count: number) => void,
    onError?: (error: string) => void
): void => {
    try {
        if (contacts.length === 0) {
            onError?.('No contacts to export');
            return;
        }

        const columns: ExportColumn[] = [
            {
                header: 'Company Name',
                accessor: 'company_name',
                minWidth: 25,
                maxWidth: 40,
                type: 'text'
            },
            {
                header: 'Contact Person',
                accessor: 'person_name',
                minWidth: 20,
                maxWidth: 30,
                type: 'text'
            },
            {
                header: 'Department',
                accessor: 'department',
                minWidth: 18,
                maxWidth: 25,
                type: 'text'
            },
            {
                header: 'Designation',
                accessor: 'designation',
                minWidth: 20,
                maxWidth: 35,
                type: 'text'
            },
            {
                header: 'Product Type',
                accessor: 'product_type',
                minWidth: 15,
                maxWidth: 20,
                type: 'text'
            },
            {
                header: 'Email Address',
                accessor: 'email',
                minWidth: 30,
                maxWidth: 45,
                type: 'email'
            },
            {
                header: 'Phone Number',
                accessor: 'phone_number',
                minWidth: 18,
                maxWidth: 22,
                type: 'text'
            },
            {
                header: 'City',
                accessor: 'city',
                minWidth: 15,
                maxWidth: 20,
                type: 'text'
            },
            {
                header: 'Person Country',
                accessor: 'person_country',
                minWidth: 18,
                maxWidth: 22,
                type: 'text'
            },
            {
                header: 'Company Country',
                accessor: 'company_country',
                minWidth: 18,
                maxWidth: 22,
                type: 'text'
            },
            {
                header: 'Personal LinkedIn',
                accessor: 'person_linkedin_url',
                minWidth: 35,
                maxWidth: 50,
                type: 'url'
            },
            {
                header: 'Company LinkedIn',
                accessor: 'company_linkedin_url',
                minWidth: 35,
                maxWidth: 50,
                type: 'url'
            },
            {
                header: 'Company Website',
                accessor: 'company_website',
                minWidth: 30,
                maxWidth: 50,
                type: 'url'
            },
            {
                header: 'Status',
                accessor: 'status',
                minWidth: 12,
                maxWidth: 15,
                type: 'text'
            },
            {
                header: 'Verification Status',
                accessor: (contact: any) => contact.is_verified === 1 ? 'Verified' : 'Not Verified',
                minWidth: 18,
                maxWidth: 22,
                type: 'text'
            }
        ];

        const filename = type === 'selected'
            ? `selected-contacts-${contacts.length}`
            : `all-contacts-${contacts.length}`;

        downloadExcel({
            filename,
            columns,
            data: contacts,
            includeTimestamp: true
        });

        onSuccess?.(contacts.length);
    } catch (error) {
        console.error('Error exporting contacts:', error);
        onError?.('Failed to export contacts');
    }
};
