import { useState, useMemo } from 'react';
import { IoArrowUpOutline, IoArrowDownOutline } from 'react-icons/io5';

export default function DataTable({ columns = [], data = [] }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const handleSort = (key) => {
    let newOrder = 'asc';
    if (sortKey === key && sortOrder === 'asc') newOrder = 'desc';
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;
  const currentData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  if (!data.length) {
    return (
      <p style={{ color: 'var(--color-text-muted)', padding: '2rem', textAlign: 'center' }}>
        No data available.
      </p>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg-card)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: sortKey === col.key ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    background: 'var(--color-bg-secondary)',
                    borderBottom: '1px solid var(--color-border)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.color = sortKey === col.key ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'; 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {col.label}
                    {sortKey === col.key && (
                      <span style={{ color: 'var(--color-accent)' }}>
                        {sortOrder === 'asc' ? <IoArrowUpOutline /> : <IoArrowDownOutline />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '0.75rem 1rem', color: 'var(--color-text-primary)' }}>
                    {col.render ? col.render(row[col.key], row, idx + (currentPage-1)*rowsPerPage) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} entries
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: currentPage === 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Prev
          </button>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: currentPage === totalPages ? 'var(--color-text-muted)' : 'var(--color-text-primary)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
