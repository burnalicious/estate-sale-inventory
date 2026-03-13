import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { ItemCreate, ItemStatus, ItemCondition } from '../api/types';

const EMPTY: ItemCreate = {
  name: '',
  description: '',
  category: '',
  condition: undefined,
  price: 0,
  status: 'AVAILABLE',
  photoUrl: '',
};

export default function ItemFormPage() {
  const { saleId, itemId } = useParams<{ saleId: string; itemId: string }>();
  const navigate = useNavigate();
  const isEdit = !!itemId;
  const sId = Number(saleId);

  const [form, setForm] = useState<ItemCreate>(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit) {
      api.items.get(sId, Number(itemId)).then((item) => {
        setForm({
          name: item.name,
          description: item.description || '',
          category: item.category || '',
          condition: item.condition || undefined,
          price: item.price,
          status: item.status,
          photoUrl: item.photoUrl || '',
        });
      }).catch((e) => setError(e.message));
    }
  }, [sId, itemId, isEdit]);

  const set = (field: keyof ItemCreate) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'price' ? parseFloat(e.target.value) || 0 : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let item;
      if (isEdit) {
        item = await api.items.update(sId, Number(itemId), form);
      } else {
        item = await api.items.create(sId, form);
      }

      const file = fileRef.current?.files?.[0];
      if (file) {
        await api.items.uploadPhoto(sId, item.id, file);
      }

      navigate(`/sales/${saleId}`);
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <Link to={`/sales/${saleId}`}>&larr; Back to Sale</Link>
      </div>

      <h1>{isEdit ? 'Edit Item' : 'Add Item'}</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label>Item Name *</label>
          <input value={form.name} onChange={set('name')} required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description || ''} onChange={set('description')} />
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label>Price *</label>
            <input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input value={form.category || ''} onChange={set('category')} placeholder="e.g. Furniture" />
          </div>
          <div className="form-group">
            <label>Condition</label>
            <select value={form.condition || ''} onChange={set('condition') as any}>
              <option value="">-- Select --</option>
              {(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'] as ItemCondition[]).map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status *</label>
            <select value={form.status} onChange={set('status') as any}>
              {(['AVAILABLE', 'SOLD', 'WITHDRAWN'] as ItemStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Photo URL</label>
            <input value={form.photoUrl || ''} onChange={set('photoUrl')} placeholder="https://..." />
          </div>
        </div>

        <div className="form-group">
          <label>Upload Photo</label>
          <input type="file" ref={fileRef} accept="image/*" />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
          </button>
          <Link to={`/sales/${saleId}`} className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
