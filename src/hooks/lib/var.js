const { invoke } = window.__TAURI__.core;

const urlPath = window.location.pathname;
const queryString = window.location.search;

/**
 * Formatea un valor numérico a moneda (MXN, ej. $1,250.50)
 * @param {number|string} val - Monto a formatear
 * @param {boolean} [isCents=false] - Indica si el valor numérico viene en centavos
 * @returns {string} Cadena formateada como moneda
 */
function formatCurrency(val, isCents = false) {
    if (val === null || val === undefined || val === '') return '$0.00';
    let num = Number(val);
    if (isNaN(num)) return '$0.00';
    if (isCents) {
        num = num / 100;
    }
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}
