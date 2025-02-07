import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import html2canvasPro from 'html2canvas-pro';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes, si = true, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + ' ' + units[u];
}

/**
 * Formats a number with commas as thousand separators
 * @param {string|number} value - The number to format
 * @returns {string} The formatted number string with commas
 */
export const formatNumber = (value) => {
    if (value === null || value === undefined) return '';
    const numberString = value.toString();
    const [integer, decimal] = numberString.split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
};

/**
 * Parses a formatted number string back to a number
 * @param {string} value - The formatted number string to parse
 * @returns {number} The parsed number
 */
export const parseNumber = (value) => {
    if (!value) return 0;
    // Remove all commas and convert to number
    const parsed = Number(value.toString().replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
};
/**
 * Formats an amount as VND currency
 * @param {number} amount - The amount to format
 * @returns {string} The formatted amount as currency
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

/**
 * Generates a PDF from an HTML element using html2canvas-pro
 * @param {HTMLElement} element - The HTML element to convert to PDF
 * @param {Object} [options={}] - Optional configuration for html2canvas-pro
 * @returns {Promise<jsPDF>} A promise that resolves with the generated PDF document
 */
export const generatePDF2 = async (element, options = {}) => {
    const defaultOptions = {
        scale: 2,
        logging: false,
        useCORS: true,
        scrollY: -window.scrollY,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
        const canvas = await html2canvasPro(element, mergedOptions);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }

        return pdf;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
/**
 * Generates a PDF from an HTML element
 * @param {HTMLElement} element - The HTML element to convert to PDF
 * @returns {Promise<jsPDF>} A promise that resolves with the generated PDF document
 */
export const generatePDF = async (element) => {
    const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        scrollY: -window.scrollY,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
    });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
    }

    return pdf;
};

/**
 * Set a date to local time without time part.
 * @param {string|Date} date - The input date.
 * @returns {Date|null} - Local date at midnight.
 */
export const setLocalDateWithoutTime = (date) => {
    if (!date) return null;
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    return localDate;
};

/**
 * Format date for server with 'YYYY-MM-DDT00:00:00.000Z' format.
 * @param {string|Date} date - The input date.
 * @returns {string|null} - Formatted date string.
 */
export const formatDateForServer = (date) => {
    if (!date) return null;
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
};

/**
 * Filters Vietnamese text by normalizing and comparing.
 * @param {object} row - The table row.
 * @param {string} columnId - The column ID to filter.
 * @param {string} value - The search value.
 * @returns {boolean} Whether the row matches the filter.
 */
export const vietnameseFilter = (row, columnId, value) => {
    const content = row.getValue(columnId);
    if (!content) return false;

    const normalizedContent = content.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedValue = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return normalizedContent.includes(normalizedValue);
};