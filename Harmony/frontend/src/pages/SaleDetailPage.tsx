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
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <Link to="/">&larr; All Sales</Link>
          </div>

          <div className="page-header">
            <div>
              <h1 style={{ marginBottom: 'var(--space-1)' }}>{sale.name}</h1>
              <p className="sale-meta">
                {sale.address1}{sale.address2 ? `, ${sale.address2}` : ''}, {sale.city}, {sale.state} {sale.zipCode}
              </p>
              <p className="sale-meta" style={{ marginTop: 'var(--space-1)' }}>
                Sale date: {sale.saleDate} &middot; <StatusBadge status={sale.status} />
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Link to={`/sales/${id}/edit`} className="btn btn-secondary">Edit</Link>
              <button onClick={handleDeleteSale} className="btn btn-danger">Delete</button>
            </div>
          </div>

          {summary && (
            <div className="summary-bar" data-testid="summary-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <div className="card" data-testid="summary-total-items">
                <div className="summary-value" style={{ color: 'var(--text-h)' }}>{summary.totalItems}</div>
                <div className="summary-label">Total Items</div>
              </div>
              <div className="card" data-testid="summary-total-value">
                <div className="summary-value" style={{ color: 'var(--text-h)' }}>{formatPrice(summary.totalValue)}</div>
                <div className="summary-label">Total Value</div>
              </div>
              <div className="card" data-testid="summary-sold">
                <div className="summary-value" style={{ color: 'var(--success)' }}>{summary.soldItems}</div>
                <div className="summary-label">Sold ({formatPrice(summary.soldValue)})</div>
              </div>
              <div className="card" data-testid="summary-available">
                <div className="summary-value" style={{ color: 'var(--accent)' }}>{summary.availableItems}</div>
                <div className="summary-label">Available</div>
              </div>
              <div className="card" data-testid="summary-withdrawn">
                <div className="summary-value" style={{ color: 'var(--danger)' }}>{summary.withdrawnItems}</div>
                <div className="summary-label">Withdrawn</div>
              </div>
            </div>
          )}

          <div className="page-header" style={{ marginTop: 'var(--space-5)' }}>
            <h2>Items ({totalElements})</h2>
            <Link to={`/sales/${id}/items/new`} className="btn btn-primary">+ Add Item</Link>
          </div>

          <div className="filter-bar" data-testid="filter-bar">
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
              className="filter-input"
            />
            {hasFilters && (
              <button onClick={clearFilters} className="filter-btn filter-btn-clear">Clear</button>
            )}
          </div>

          {items.length === 0 && <p>No items found.</p>}

          <div className="items-list" data-testid="items-list">
            {items.map((item) => (
              <div key={item.id} className="card" data-testid="item-card">
                <div className="item-row">
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
                    <div className="item-header">
                      <div>
                        <h3>{item.name}</h3>
                        <p className="item-meta">
                          {formatPrice(item.price)}
                          {item.category && <> &middot; {item.category}</>}
                          {item.condition && <> &middot; {item.condition.replace('_', ' ')}</>}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="item-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="tag-badge">{tag}</span>
                        ))}
                      </div>
                    )}
                    {item.description && (
                      <p className="item-description">{item.description}</p>
                    )}
                    <div className="item-actions">
                      <Link to={`/sales/${id}/items/${item.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button onClick={() => handleDeleteItem(item.id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
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
