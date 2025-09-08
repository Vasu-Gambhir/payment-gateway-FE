// Utility functions for handling balance precision and formatting

/**
 * Format balance for display, handling floating-point precision issues
 * @param {number} balance - The balance value
 * @param {number} decimalPlaces - Number of decimal places (default: 2)
 * @returns {string} Formatted balance string
 */
export const formatBalance = (balance, decimalPlaces = 2) => {
  if (typeof balance !== 'number' || isNaN(balance)) {
    return '0.00';
  }
  
  // Round to avoid floating-point precision issues
  const rounded = Math.round(balance * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  return rounded.toFixed(decimalPlaces);
};

/**
 * Check if balance is effectively zero (accounting for floating-point precision)
 * @param {number} balance - The balance value
 * @param {number} threshold - Minimum threshold to consider as zero (default: 0.01)
 * @returns {boolean} True if balance is effectively zero
 */
export const isBalanceZero = (balance, threshold = 0.01) => {
  if (typeof balance !== 'number' || isNaN(balance)) {
    return true;
  }
  return Math.abs(balance) < threshold;
};

/**
 * Safely subtract amounts and format the result
 * @param {number} balance - Current balance
 * @param {number} amount - Amount to subtract
 * @returns {string} Formatted result
 */
export const formatBalanceAfterDeduction = (balance, amount) => {
  const result = balance - amount;
  return formatBalance(result);
};

/**
 * Parse and clean balance value from server
 * @param {number|string} serverBalance - Balance from server (in dollars)
 * @returns {number} Cleaned balance value (in dollars)
 */
export const parseServerBalance = (serverBalance) => {
  if (typeof serverBalance === 'string') {
    serverBalance = parseFloat(serverBalance);
  }
  
  if (isNaN(serverBalance)) {
    return 0;
  }
  
  // The backend now handles precision internally with cents
  // Just ensure we have proper decimal places for display
  return Math.round(serverBalance * 100) / 100;
};

/**
 * Convert dollars to cents for precise calculations (if needed client-side)
 * @param {number} dollars - Dollar amount
 * @returns {number} Cents as integer
 */
export const dollarsToCents = (dollars) => {
  if (typeof dollars !== 'number' || isNaN(dollars)) {
    return 0;
  }
  return Math.round(dollars * 100);
};

/**
 * Convert cents to dollars
 * @param {number} cents - Cents as integer
 * @returns {number} Dollar amount
 */
export const centsToDollars = (cents) => {
  if (typeof cents !== 'number' || isNaN(cents)) {
    return 0;
  }
  return cents / 100;
};