import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { ItemCreate, ItemStatus, ItemCondition } from '../api/types';

const EMPTY: ItemCreate & { tagsInput: string } = {
  name: '',
  description: '',
  category: '',
  condition: undefined,
  price: 0,
  status: 'AVAILABLE',
  photoUrl: '',
  tags: [],
  tagsInput: '',
};

export default function ItemFormPage() {
  const { saleId, itemId } = useParams<{ saleId: string; itemId: string }>();
  const navigate = useNavigate();
  const isEdit = !!itemId;
  const sId = Number(saleId);

  const [form, setForm] = useState<ItemCreate & { tagsInput: string }>(EMPTY);
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
          tags: item.tags || [],
          tagsInput: (item.tags || []).join(', '),
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
      const submitData: ItemCreate = {
        ...form,
        tags: form.tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      };
      let item;
      if (isEdit) {
        item = await api.items.update(sId, Number(itemId), submitData);
      } else {
        item = await api.items.create(sId, submitData);
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
      <div className="back-link">
        <Link to={`/sales/${saleId}`}>&larr; Back to Sale</Link>
      </div>

      <h1>{isEdit ? 'Edit Item' : 'Add Item'}</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="card form-card" data-testid="item-form">
        <div className="form-group">
          <label htmlFor="item-name">Item Name *</label>
          <input id="item-name" value={form.name} onChange={set('name')} required />
        </div>

        <div className="form-group">
          <label htmlFor="item-description">Description</label>
          <textarea id="item-description" value={form.description || ''} onChange={set('description')} />
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="item-price">Price *</label>
            <input id="item-price" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
          </div>
          <div className="form-group">
            <label htmlFor="item-category">Category</label>
            <input id="item-category" value={form.category || ''} onChange={set('category')} placeholder="e.g. Furniture" />
          </div>
          <div className="form-group">
            <label htmlFor="item-condition">Condition</label>
            <select id="item-condition" value={form.condition || ''} onChange={set('condition') as any}>
              <option value="">-- Select --</option>
              {(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'] as ItemCondition[]).map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="item-status">Status *</label>
            <select id="item-status" value={form.status} onChange={set('status') as any}>
              {(['AVAILABLE', 'SOLD', 'WITHDRAWN'] as ItemStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="item-photourl">Photo URL</label>
            <input id="item-photourl" value={form.photoUrl || ''} onChange={set('photoUrl')} placeholder="https://..." />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="item-tags">Tags (comma-separated)</label>
          <input id="item-tags" value={form.tagsInput} onChange={(e) => setForm({ ...form, tagsInput: e.target.value })} placeholder="e.g. antique, wood, vintage" />
        </div>

        <div className="form-group">
          <label htmlFor="item-photo">Upload Photo</label>
          <input id="item-photo" type="file" ref={fileRef} accept="image/*" />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
          </button>
          <Link to={`/sales/${saleId}`} className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
