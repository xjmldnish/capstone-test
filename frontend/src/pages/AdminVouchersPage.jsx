import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import PageHeader from '../components/PageHeader.jsx';
import { categoryApi, voucherApi } from '../api/resources';
import { voucherStatus } from '../utils/vouchers';

const blank = {
  title: '',
  description: '',
  image: '',
  points: 100,
  category_id: '',
  limit: 50,
  expiryDate: new Date(),
  terms: ''
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [voucherData, categoryData] = await Promise.all([
      voucherApi.list({ limit: 1000 }),
      categoryApi.list()
    ]);
    setVouchers(voucherData.vouchers || voucherData);
    setCategories(categoryData);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm(blank);
    setDialogOpen(true);
  }

  function openEdit(voucher) {
    setEditing(voucher);
    setForm({
      ...voucher,
      category_id: voucher.category_id?._id || voucher.category_id,
      expiryDate: new Date(voucher.expiryDate)
    });
    setDialogOpen(true);
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setError('');
    const payload = {
      ...form,
      category_id: form.category_id,
      expiryDate: form.expiryDate
    };

    if (editing) {
      await voucherApi.update(editing._id, payload);
    } else {
      await voucherApi.create(payload);
    }

    setDialogOpen(false);
    load();
  }

  async function remove(voucher) {
    await voucherApi.remove(voucher._id);
    load();
  }

  async function createCategory() {
    setError('');
    if (!categoryName.trim()) return;
    try {
      await categoryApi.create({ name: categoryName.trim() });
      setCategoryName('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create category.');
    }
  }

  async function removeCategory(category) {
    setError('');
    try {
      await categoryApi.remove(category._id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete category.');
    }
  }

  const statusBody = (row) => {
    const status = voucherStatus(row);
    return <Tag value={status.label} severity={status.severity} />;
  };

  const actions = (row) => (
    <div className="table-actions">
      <Button icon="pi pi-pencil" rounded text aria-label="Edit" onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Delete" onClick={() => remove(row)} />
    </div>
  );

  return (
    <>
      <PageHeader title="Voucher Management" eyebrow="Admin CRUD">
        Create, edit, delete, and track voucher limits and expiry dates.
      </PageHeader>
      {error && <Message severity="error" text={error} />}

      <div className="management-grid">
        <section className="summary-panel">
          <div className="section-title-row">
            <div>
              <h2>Vouchers</h2>
              <p>Admin-only CRUD for points, limits, expiry, and terms.</p>
            </div>
            <Button label="New voucher" icon="pi pi-plus" onClick={openNew} />
          </div>
          <DataTable value={vouchers} paginator rows={8} responsiveLayout="scroll" className="responsive-table">
            <Column field="title" header="Title" />
            <Column field="category_id.name" header="Category" />
            <Column field="points" header="Points" />
            <Column field="limit" header="Limit" />
            <Column field="redeemedCount" header="Redeemed" />
            <Column body={statusBody} header="Status" />
            <Column body={actions} header="Actions" />
          </DataTable>
        </section>

        <section className="summary-panel">
          <h2>Categories</h2>
          <div className="inline-form">
            <InputText value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="New category" />
            <Button icon="pi pi-plus" aria-label="Create category" onClick={createCategory} />
          </div>
          <div className="category-admin-list">
            {categories.map((category) => (
              <div key={category._id} className="category-admin-row">
                <span>{category.name}</span>
                <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Delete category" onClick={() => removeCategory(category)} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog header={editing ? 'Edit voucher' : 'New voucher'} visible={dialogOpen} onHide={() => setDialogOpen(false)} modal className="voucher-dialog">
        <div className="form-stack">
          <label>Title<InputText value={form.title} onChange={(e) => update('title', e.target.value)} /></label>
          <label>Description<InputText value={form.description} onChange={(e) => update('description', e.target.value)} /></label>
          <label>Image URL<InputText value={form.image} onChange={(e) => update('image', e.target.value)} /></label>
          <label>Category
            <Dropdown value={form.category_id} options={categories} optionLabel="name" optionValue="_id" onChange={(e) => update('category_id', e.value)} />
          </label>
          <label>Points<InputNumber value={form.points} onValueChange={(e) => update('points', e.value)} min={0} /></label>
          <label>Limit<InputNumber value={form.limit} onValueChange={(e) => update('limit', e.value)} min={1} /></label>
          <label>Expiry<Calendar value={form.expiryDate} onChange={(e) => update('expiryDate', e.value)} showIcon /></label>
          <label>Terms<InputText value={form.terms} onChange={(e) => update('terms', e.target.value)} /></label>
          <Button label="Save" icon="pi pi-save" onClick={save} />
        </div>
      </Dialog>
    </>
  );
}
