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

function formatearTelefono(input) {
  // 1. Elimina todo lo que no sea un número
  let valor = input.value.replace(/\D/g, '');
  
  // 2. Aplica los espacios según el largo del texto
  if (valor.length > 6) {
    valor = valor.replace(/^(\d{3})(\d{3})(\d{0,4})/, '$1 $2 $3');
  } else if (valor.length > 3) {
    valor = valor.replace(/^(\d{3})(\d{0,3})/, '$1 $2');
  }
  
  // 3. Devuelve el valor formateado al input (eliminando espacios sobrantes al final)
  console.log(valor.trim());
  input.value = valor.trim();
}