import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import PageHeader from '../components/PageHeader.jsx';
import { analyticsApi } from '../api/resources';

export default function AdminDashboardPage() {
  const [data, setData] = useState({ top: [], low: [], trends: [] });

  useEffect(() => {
    analyticsApi.summary().then(setData);
  }, []);

  const chartData = {
    labels: data.top.map((item) => item.title),
    datasets: [
      {
        label: 'Redemptions',
        data: data.top.map((item) => item.redeemedCount),
        backgroundColor: '#2563eb'
      }
    ]
  };

  // LURUSKAN TAJUK VOUCHERS
 const chartOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    scales: {
      x: {
        ticks: {
          maxRotation: 0, // Kekalkan tulisan lurus
          minRotation: 0,
          callback: function(value) {
            const label = this.getLabelForValue(value);
            
            if (label) {
              const words = label.split(' ');
              const lines = [];
              
              // Jalan setiap 2 perkataan untuk digabungkan ke baris baharu
              for (let i = 0; i < words.length; i += 2) {
                // Ambil perkataan semasa dan perkataan seterusnya (jika ada)
                const pair = words.slice(i, i + 2).join(' ');
                lines.push(pair);
              }
              
              return lines; // Pulangkan array baris (Maksimum 2 perkataan per baris)
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <>
      <PageHeader title="Admin Dashboard" eyebrow="Analytics">
        Track top and low redemption vouchers for the rubric analytics requirement.
      </PageHeader>
      <div className="admin-grid">
        <section className="summary-panel">
          <h2>Top redemptions</h2>
          <Chart type="bar" data={chartData} options={chartOptions} style={{ position: 'relative', height: '300px' }} />
        </section>
        <section className="summary-panel">
          <h2>Low redemption vouchers</h2>
          {data.low.map((item) => (
            <div className="analytics-row" key={item.id}>
              <span>{item.title}</span>
              <strong>{item.redeemedCount}</strong>
            </div>
          ))}
        </section>
      </div>
      <Link to="/admin/vouchers">
        <Button label="Manage vouchers" icon="pi pi-ticket" />
      </Link>
    </>
  );
}