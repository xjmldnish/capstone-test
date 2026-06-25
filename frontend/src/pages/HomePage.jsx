import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Paginator } from 'primereact/paginator';
import PageHeader from '../components/PageHeader.jsx';
import VoucherCard from '../components/VoucherCard.jsx';
import { categoryApi, voucherApi } from '../api/resources';
import { useAuth } from '../state/AuthContext.jsx';
import { useCart } from '../state/CartContext.jsx';

export default function HomePage() {
  const toast = useRef(null);
  const { user } = useAuth();
  const { addToCart, loadCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 0 });

  async function loadData() {
    setLoading(true);
    try {
      const params = {};
      params.publicOnly = true;
      params.page = pagination.page;
      params.limit = pagination.limit;
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;
      const [categoryData, voucherData] = await Promise.all([
        categoryApi.list(),
        voucherApi.list(params),
        loadCart()
      ]);
      setCategories(categoryData);
      setVouchers(voucherData.vouchers);
      setPagination(voucherData.pagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedCategory, pagination.page]);

  async function handleAdd(voucher) {
    await addToCart(voucher._id, 1);
    toast.current.show({ severity: 'success', summary: 'Added to cart', detail: voucher.title });
  }

  function handleSearch(event) {
    event.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadData();
  }

  return (
    <>
      <Toast ref={toast} />
      <PageHeader title="Latest Vouchers" eyebrow="Rewards marketplace">
        Spend Carter points on food, travel, shopping, and lifestyle deals.
      </PageHeader>

      <section className="home-stats">
        <div>
          <span>Available points</span>
          <strong>{user?.points ?? 0}</strong>
        </div>
        <div>
          <span>Live vouchers</span>
          <strong>{pagination.total}</strong>
        </div>
        <div>
          <span>Categories</span>
          <strong>{categories.length}</strong>
        </div>
      </section>

      <form className="toolbar" onSubmit={handleSearch}>
        <span className="p-input-icon-left search-box">
          <i className="pi pi-search" />
          <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vouchers" />
        </span>
        <Dropdown
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          options={[{ name: 'All categories', _id: null }, ...categories]}
          optionLabel="name"
          optionValue="_id"
          placeholder="All categories"
        />
        <Button label="Search" icon="pi pi-search" loading={loading} />
      </form>

      <div className="category-pills">
        <button
          className={!selectedCategory ? 'active' : ''}
          onClick={() => {
            setSelectedCategory(null);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            className={selectedCategory === category._id ? 'active' : ''}
            onClick={() => {
              setSelectedCategory(category._id);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      <section className="voucher-grid">
        {vouchers.map((voucher) => (
          <VoucherCard key={voucher._id} voucher={voucher} onAdd={handleAdd} />
        ))}
      </section>

      {!loading && vouchers.length === 0 && (
        <div className="empty-state">No vouchers found. Try another category or search.</div>
      )}

      {pagination.totalPages > 1 && (
        <Paginator
          first={(pagination.page - 1) * pagination.limit}
          rows={pagination.limit}
          totalRecords={pagination.total}
          onPageChange={(e) => setPagination((prev) => ({ ...prev, page: e.page + 1 }))}
        />
      )}
    </>
  );
}
