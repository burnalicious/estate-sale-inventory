import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Sale } from '../api/types';

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
  );
}

export default function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.sales.list().then(setSales).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Estate Sales</h1>
        <Link to="/sales/new" className="btn btn-primary">+ New Sale</Link>
      </div>

      {error && <div className="error">{error}</div>}

      {sales.length === 0 && !error && (
        <p>No sales yet. Create your first one!</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sales.map((sale) => (
          <Link
            key={sale.id}
            to={`/sales/${sale.id}`}
            className="card"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: '0 0 4px' }}>{sale.name}</h2>
                <p style={{ margin: '0 0 4px', fontSize: '14px' }}>
                  {sale.address1}{sale.address2 ? `, ${sale.address2}` : ''}, {sale.city}, {sale.state} {sale.zipCode}
                </p>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Date: {sale.saleDate} &middot; {sale.itemCount} item{sale.itemCount !== 1 ? 's' : ''}
                </p>
              </div>
              <StatusBadge status={sale.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
