export const normalizeSubscriptNumbers = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  const subscriptMap = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
  };
  
  return str
    .normalize('NFKD')
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, match => subscriptMap[match] || match);
};