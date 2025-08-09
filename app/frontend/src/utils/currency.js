// utils/currency.js - Moroccan Dirhams (MAD) Only

// Moroccan Dirhams configuration
export const CURRENCY_CONFIG = {
  symbol: 'د.م.',      // Moroccan Dirhams symbol
  code: 'MAD',        // Moroccan Dirhams code
  decimals: 2,        // 2 decimal places
  position: 'after'   // Symbol comes after amount
};

// Main currency formatting function
export const formatCurrency = (amount) => {
  const value = parseFloat(amount || 0);
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: CURRENCY_CONFIG.decimals,
    maximumFractionDigits: CURRENCY_CONFIG.decimals
  });
  
  return `${formatted}${CURRENCY_CONFIG.symbol}`;
};