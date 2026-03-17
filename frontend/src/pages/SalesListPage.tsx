import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Sale, SaleStatus } from '../api/types';

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
  );
}

const STATUS_FILTERS: (SaleStatus | undefined)[] = [undefined, 'UPCOMING', 'ACTIVE', 'COMPLETED'];
const STATUS_LABELS: Record<string, string> = { '': 'All', UPCOMING: 'Upcoming', ACTIVE: 'Active', COMPLETED: 'Completed' };

export default function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaleStatus | undefined>(undefined);

  useEffect(() => {
    api.sales.list(statusFilter).then(setSales).catch((e) => setError(e.message));
  }, [statusFilter]);

  return (
    <div>
      <div className="page-header">
        <h1>Estate Sales</h1>
        <Link to="/sales/new" className="btn btn-primary">+ New Sale</Link>
      </div>

      <div className="filter-bar">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s || 'all'}
            className={`filter-btn ${statusFilter === s ? 'filter-btn-active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {STATUS_LABELS[s || '']}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      {sales.length === 0 && !error && (
        <p>No sales found.</p>
      )}

      <div className="sales-grid">
        {sales.map((sale) => (
          <Link key={sale.id} to={`/sales/${sale.id}`} className="card-link">
            <div className="card">
              <div className="sale-card-header">
                <h2 className="sale-card-title">{sale.name}</h2>
                <StatusBadge status={sale.status} />
              </div>
              <p className="sale-card-address">
                {sale.address1}{sale.address2 ? `, ${sale.address2}` : ''}, {sale.city}, {sale.state} {sale.zipCode}
              </p>
              <p className="sale-card-footer">
                <span>Date: {sale.saleDate}</span>
                <span className="sale-card-count">{sale.itemCount} item{sale.itemCount !== 1 ? 's' : ''}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
