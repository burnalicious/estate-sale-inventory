import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { SaleCreate, SaleStatus } from '../api/types';

const EMPTY: SaleCreate = {
  name: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zipCode: '',
  saleDate: '',
  status: 'UPCOMING',
};

export default function SaleFormPage() {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const isEdit = !!saleId;

  const [form, setForm] = useState<SaleCreate>(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.sales.get(Number(saleId)).then((sale) => {
        setForm({
          name: sale.name,
          address1: sale.address1,
          address2: sale.address2 || '',
          city: sale.city,
          state: sale.state,
          zipCode: sale.zipCode,
          saleDate: sale.saleDate,
          status: sale.status,
        });
      }).catch((e) => setError(e.message));
    }
  }, [saleId, isEdit]);

  const set = (field: keyof SaleCreate) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.sales.update(Number(saleId), form);
        navigate(`/sales/${saleId}`);
      } else {
        const sale = await api.sales.create(form);
        navigate(`/sales/${sale.id}`);
      }
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="back-link">
        <Link to={isEdit ? `/sales/${saleId}` : '/'}>&larr; Back</Link>
      </div>

      <h1>{isEdit ? 'Edit Sale' : 'New Sale'}</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="card form-card" data-testid="sale-form">
        <div className="form-group">
          <label htmlFor="sale-name">Sale Name *</label>
          <input id="sale-name" value={form.name} onChange={set('name')} required />
        </div>

        <div className="form-group">
          <label htmlFor="sale-address1">Address Line 1 *</label>
          <input id="sale-address1" value={form.address1} onChange={set('address1')} required />
        </div>

        <div className="form-group">
          <label htmlFor="sale-address2">Address Line 2</label>
          <input id="sale-address2" value={form.address2 || ''} onChange={set('address2')} />
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="sale-city">City *</label>
            <input id="sale-city" value={form.city} onChange={set('city')} required />
          </div>
          <div className="form-group">
            <label htmlFor="sale-state">State *</label>
            <input id="sale-state" value={form.state} onChange={set('state')} required maxLength={2} placeholder="TX" />
          </div>
          <div className="form-group">
            <label htmlFor="sale-zip">Zip Code *</label>
            <input id="sale-zip" value={form.zipCode} onChange={set('zipCode')} required maxLength={10} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sale-date">Sale Date *</label>
            <input id="sale-date" type="date" value={form.saleDate} onChange={set('saleDate')} required />
          </div>
          <div className="form-group">
            <label htmlFor="sale-status">Status *</label>
            <select id="sale-status" value={form.status} onChange={set('status') as any}>
              {(['UPCOMING', 'ACTIVE', 'COMPLETED'] as SaleStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Sale' : 'Create Sale'}
          </button>
          <Link to={isEdit ? `/sales/${saleId}` : '/'} className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
