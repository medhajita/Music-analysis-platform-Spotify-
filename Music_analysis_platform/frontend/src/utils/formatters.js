export const formatNumber = (num) => {
  if (num === null || num === undefined) return '---';
  return new Intl.NumberFormat('fr-FR', {
    notation: num > 1000000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(num);
};

export const formatFullNumber = (num) => {
  if (num === null || num === undefined) return '---';
  return new Intl.NumberFormat('fr-FR').format(num);
};

export const formatCurrency = (num) => {
  if (num === null || num === undefined) return '---';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
  }).format(num);
};
