import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Sale, Item, ItemStatus, SaleSummary } from '../api/types';

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function photoSrc(url: string) {
  if (url.startsWith('/uploads/')) return `http://localhost:8080${url}`;
  return url;
}

const ITEM_STATUSES: (ItemStatus | undefined)[] = [undefined, 'AVAILABLE', 'SOLD', 'WITHDRAWN'];

export default function SaleDetailPage() {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [summary, setSummary] = useState<SaleSummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<ItemStatus | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState('');

  const id = Number(saleId);

  useEffect(() => {
    api.sales.get(id).then(setSale).catch((e) => setError(e.message));
    api.sales.summary(id).then(setSummary).catch(() => {});
  }, [id]);

  useEffect(() => {
    api.items.list(id, statusFilter, categoryFilter || undefined, page).then((res) => {
      setItems(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    }).catch((e) => setError(e.message));
  }, [id, page, statusFilter, categoryFilter]);

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
      const res = await api.items.list(id, statusFilter, categoryFilter || undefined, page);
      setItems(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const clearFilters = () => {
    setStatusFilter(undefined);
    setCategoryFilter('');
    setPage(0);
  };

  const hasFilters = statusFilter !== undefined || categoryFilter !== '';

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

          {summary && (
            <div className="summary-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '24px' }}>
              <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-h)' }}>{summary.totalItems}</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>Total Items</div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-h)' }}>{formatPrice(summary.totalValue)}</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>Total Value</div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--success)' }}>{summary.soldItems}</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>Sold ({formatPrice(summary.soldValue)})</div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent)' }}>{summary.availableItems}</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>Available</div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--danger)' }}>{summary.withdrawnItems}</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>Withdrawn</div>
              </div>
            </div>
          )}

          <div className="page-header" style={{ marginTop: '32px' }}>
            <h2>Items ({totalElements})</h2>
            <Link to={`/sales/${id}/items/new`} className="btn btn-primary">+ Add Item</Link>
          </div>

          <div className="filter-bar">
            {ITEM_STATUSES.map((s) => (
              <button
                key={s || 'all'}
                className={`filter-btn ${statusFilter === s ? 'filter-btn-active' : ''}`}
                onClick={() => { setStatusFilter(s); setPage(0); }}
              >
                {s ? s : 'All'}
              </button>
            ))}
            <input
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
              placeholder="Filter by category..."
              style={{ padding: '4px 10px', fontSize: '13px', border: '1px solid var(--border)', borderRadius: '4px', width: '180px' }}
            />
            {hasFilters && (
              <button onClick={clearFilters} className="filter-btn" style={{ color: 'var(--danger)' }}>Clear</button>
            )}
          </div>

          {items.length === 0 && <p>No items found.</p>}

          <div className="items-list">
            {items.map((item) => (
              <div key={item.id} className="card">
                <div style={{ display: 'flex', gap: '16px' }}>
                  {item.photoUrl ? (
                    <img
                      src={photoSrc(item.photoUrl)}
                      alt={item.name}
                      className="item-photo"
                    />
                  ) : (
                    <div className="item-photo-placeholder">No photo</div>
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
                    {item.tags && item.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {item.tags.map((tag) => (
                          <span key={tag} style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 500 }}>{tag}</span>
                        ))}
                      </div>
                    )}
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

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page + 1} of {totalPages}</span>
              <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
