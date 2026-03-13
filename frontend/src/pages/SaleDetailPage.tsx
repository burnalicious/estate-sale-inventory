import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Sale, Item } from '../api/types';

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export default function SaleDetailPage() {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');

  const id = Number(saleId);

  useEffect(() => {
    api.sales.get(id).then(setSale).catch((e) => setError(e.message));
    api.items.list(id).then(setItems).catch((e) => setError(e.message));
  }, [id]);

  const handleDeleteSale = async () => {
    if (!confirm('Delete this sale and all its items?')) return;
    try {
      await api.sales.delete(id);
      navigate('/');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.items.delete(id, itemId);
      setItems(items.filter((i) => i.id !== itemId));
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (!sale && !error) return <p>Loading...</p>;

  return (
    <div>
      {error && <div className="error">{error}</div>}

      {sale && (
        <>
          <div style={{ marginBottom: '8px' }}>
            <Link to="/">&larr; All Sales</Link>
          </div>

          <div className="page-header">
            <div>
              <h1 style={{ marginBottom: '4px' }}>{sale.name}</h1>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {sale.address1}{sale.address2 ? `, ${sale.address2}` : ''}, {sale.city}, {sale.state} {sale.zipCode}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
                Sale date: {sale.saleDate} &middot; <StatusBadge status={sale.status} />
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to={`/sales/${id}/edit`} className="btn btn-secondary">Edit</Link>
              <button onClick={handleDeleteSale} className="btn btn-danger">Delete</button>
            </div>
          </div>

          <div className="page-header" style={{ marginTop: '32px' }}>
            <h2>Items ({items.length})</h2>
            <Link to={`/sales/${id}/items/new`} className="btn btn-primary">+ Add Item</Link>
          </div>

          {items.length === 0 && <p>No items yet. Add your first one!</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div key={item.id} className="card">
                <div style={{ display: 'flex', gap: '16px' }}>
                  {item.photoUrl && (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px', color: 'var(--text-h)' }}>{item.name}</h3>
                        <p style={{ margin: '0 0 4px', fontSize: '14px' }}>
                          {formatPrice(item.price)}
                          {item.category && <> &middot; {item.category}</>}
                          {item.condition && <> &middot; {item.condition.replace('_', ' ')}</>}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    {item.description && (
                      <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.5' }}>
                        {item.description}
                      </p>
                    )}
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <Link to={`/sales/${id}/items/${item.id}/edit`} className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }}>Edit</Link>
                      <button onClick={() => handleDeleteItem(item.id)} className="btn btn-danger" style={{ fontSize: '12px', padding: '4px 10px' }}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
