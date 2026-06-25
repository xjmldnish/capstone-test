import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import PageHeader from '../components/PageHeader.jsx';
import { analyticsApi } from '../api/resources';

const CATEGORY_COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#6366f1'
];

const wrapLabel = (label) => {
  if (!label) return label;
  const words = label.split(' ');
  const lines = [];
  for (let i = 0; i < words.length; i += 2) {
    lines.push(words.slice(i, i + 2).join(' '));
  }
  return lines;
};

const wrappedXAxis = {
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        maxRotation: 0,
        minRotation: 0,
        callback: function (value) {
          return wrapLabel(this.getLabelForValue(value));
        }
      }
    }
  },
  plugins: { legend: { display: false } }
};

export default function AdminDashboardPage() {
  const [data, setData] = useState({
    top: [],
    low: [],
    trends: [],
    stats: { totalUsers: 0, totalRedemptions: 0, topUsers: [], userTrends: [], categoryBreakdown: [] }
  });

  useEffect(() => {
    analyticsApi.summary().then(setData);
  }, []);

  // Top voucher redemptions bar chart
  const topVoucherChart = {
    labels: data.top.map((item) => item.title),
    datasets: [{
      label: 'Redemptions',
      data: data.top.map((item) => item.redeemedCount),
      backgroundColor: '#2563eb'
    }]
  };

  // Redemption trend line chart
  const trendChart = {
    labels: data.trends.map((t) => t._id),
    datasets: [{
      label: 'Redemptions',
      data: data.trends.map((t) => t.redemptions),
      fill: true,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.1)',
      tension: 0.4,
      pointRadius: 4
    }]
  };

  const trendOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  // User registration trend bar chart
  const userTrendChart = {
    labels: data.stats.userTrends.map((t) => t._id),
    datasets: [{
      label: 'New Users',
      data: data.stats.userTrends.map((t) => t.newUsers),
      backgroundColor: '#16a34a'
    }]
  };

  const userTrendOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  // Category breakdown doughnut chart
  const categoryChart = {
    labels: data.stats.categoryBreakdown.map((c) => c._id),
    datasets: [{
      data: data.stats.categoryBreakdown.map((c) => c.totalRedemptions),
      backgroundColor: CATEGORY_COLORS.slice(0, data.stats.categoryBreakdown.length)
    }]
  };

  const categoryOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
  };

  // Top users bar chart
  const topUsersChart = {
    labels: data.stats.topUsers.map((u) => u.username),
    datasets: [{
      label: 'Redemptions',
      data: data.stats.topUsers.map((u) => u.totalRedemptions),
      backgroundColor: '#7c3aed'
    }]
  };

  return (
    <>
      <PageHeader title="Admin Dashboard" eyebrow="Analytics">
        Track analytics, user metrics, and top redemptions.
      </PageHeader>

      {/* Stat cards */}
      <div className="admin-stats-grid">
        <div className="summary-panel stat-card">
          <span className="muted">Total Users</span>
          <strong style={{ fontSize: '2rem', color: 'var(--primary)' }}>{data.stats.totalUsers}</strong>
        </div>
        <div className="summary-panel stat-card">
          <span className="muted">Total Redemptions</span>
          <strong style={{ fontSize: '2rem', color: 'var(--primary)' }}>{data.stats.totalRedemptions}</strong>
        </div>
      </div>

      {/* Row 1: Top vouchers + Redemption trend */}
      <div className="admin-grid">
        <section className="summary-panel">
          <h2>Top 5 voucher redemptions</h2>
          <div className="chart-panel">
            <Chart type="bar" data={topVoucherChart} options={wrappedXAxis} style={{ position: 'relative', height: '100%' }} />
          </div>
        </section>
        <section className="summary-panel">
          <h2>Redemptions over time</h2>
          {data.trends.length > 0
            ? <div className="chart-panel"><Chart type="line" data={trendChart} options={trendOptions} style={{ position: 'relative', height: '100%' }} /></div>
            : <div className="empty-state">No redemption data yet.</div>
          }
        </section>
      </div>

      {/* Row 2: Category breakdown + Top users */}
      <div className="admin-grid">
        <section className="summary-panel">
          <h2>Redemptions by category</h2>
          {data.stats.categoryBreakdown.length > 0
            ? <div className="chart-panel"><Chart type="doughnut" data={categoryChart} options={categoryOptions} style={{ position: 'relative', height: '100%' }} /></div>
            : <div className="empty-state">No redemption data yet.</div>
          }
        </section>
        <section className="summary-panel">
          <h2>Top users by redemptions</h2>
          {data.stats.topUsers.length > 0
            ? <div className="chart-panel"><Chart type="bar" data={topUsersChart} options={{ ...wrappedXAxis, plugins: { legend: { display: false } } }} style={{ position: 'relative', height: '100%' }} /></div>
            : <div className="empty-state">No redemptions yet.</div>
          }
        </section>
      </div>

      {/* Row 3: User registration trend + Quick actions */}
      <div className="admin-grid">
        <section className="summary-panel">
          <h2>User registrations over time</h2>
          {data.stats.userTrends.length > 0
            ? <div className="chart-panel"><Chart type="bar" data={userTrendChart} options={userTrendOptions} style={{ position: 'relative', height: '100%' }} /></div>
            : <div className="empty-state">No user data yet.</div>
          }
        </section>
        <section className="summary-panel">
          <h2>Quick actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/admin/vouchers">
              <Button label="Manage vouchers" icon="pi pi-ticket" style={{ width: '100%' }} />
            </Link>
            <Link to="/admin/users">
              <Button label="Manage users" icon="pi pi-users" style={{ width: '100%' }} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
