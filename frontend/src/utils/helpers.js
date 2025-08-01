export const parseSalario = (salarioStr) => {
    if (!salarioStr || typeof salarioStr !== 'string') {
        return 0;
    }
    const lowerCaseSalario = String(salarioStr).toLowerCase();
    if (lowerCaseSalario.includes('confidencial') || lowerCaseSalario.includes('a convenir')) {
        return 0;
    }

    const cleaned = lowerCaseSalario.replace(/[^0-9.,-]+/g, '');
    let numericValue = 0;
    if (cleaned.includes('-')) {
        const parts = cleaned.split('-').map(p => parseFloat(p.replace(/,/g, '')));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            numericValue = (parts[0] + parts[1]) / 2;
        } else if (parts.length === 1 && !isNaN(parts[0])) {
            numericValue = parseFloat(parts[0]);
        }
    } else {
        numericValue = parseFloat(cleaned.replace(/,/g, ''));
    }
    return isNaN(numericValue) ? 0 : numericValue;
};