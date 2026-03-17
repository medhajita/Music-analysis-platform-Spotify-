/**
 * Formats a number into a human-readable string (Spotify style)
 * @param {number} n - The number to format
 * @returns {string} - Formatted string (e.g., 1.2B, 12.3M, 123.4K)
 */
export const formatNumber = (n) => {
  if (n === null || n === undefined) return '0';
  const num = Number(n);
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

/**
 * Spotify Brand Colors Palette
 */
export const SPOTIFY_COLORS = [
  '#1DB954', // Spotify Green
  '#1ED760', // Brighter Green
  '#509BF5', // Blue
  '#E8115B', // Pink/Red
  '#F59B23', // Orange
  '#B3B3B3', // Grey
  '#191414', // Black
  '#FFFFFF', // White
  '#148A00', // Darker Green
];

/**
 * Downloads data as CSV
 * @param {Array} data - Array of objects
 * @param {string} filename - Name of the file
 */
export const downloadCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] === null ? '' : row[header];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];
  
  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
