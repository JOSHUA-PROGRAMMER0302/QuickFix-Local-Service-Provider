import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const capabilities = [
  { capability: 'View Service Provider Directory', admin: true, user: true },
  { capability: 'Search & Filter Providers', admin: true, user: true },
  { capability: 'View Provider Contact Details', admin: true, user: true },
  { capability: 'Add New Service Provider', admin: true, user: false },
  { capability: 'Edit Provider Details & Availability', admin: true, user: false },
  { capability: 'Delete Service Provider', admin: true, user: false },
  { capability: 'View Admin Dashboard & KPIs', admin: true, user: false },
  { capability: 'Manage All Users', admin: true, user: false },
  { capability: 'Add / Edit / Delete Users', admin: true, user: false },
  { capability: 'View Category Breakdown Statistics', admin: true, user: false },
  { capability: 'Change Own Password', admin: true, user: true },
  { capability: 'Register New Account', admin: true, user: true },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get('/users/stats');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const kpiCards = stats
    ? [
        { label: 'Total Providers', value: stats.totalProviders, icon: 'bi-tools', color: 'indigo' },
        { label: 'Available Now', value: stats.availableProviders, icon: 'bi-check-circle-fill', color: 'emerald' },
        { label: 'Total Users', value: stats.totalUsers, icon: 'bi-people-fill', color: 'cyan' },
        { label: 'Active Users', value: stats.activeUsers, icon: 'bi-person-check-fill', color: 'amber' },
      ]
    : [];

  const catIcon = { Plumber: '🔧', Electrician: '⚡', Carpenter: '🪚', 'AC Technician': '❄️', 'Appliance Repair': '🔌', Painter: '🖌️', 'House Cleaning': '🧹' };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        {/* Page Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="page-title">
              <i className="bi bi-grid-1x2-fill me-2" style={{ color: 'var(--primary-light)' }}></i>
              Admin Dashboard
            </h1>
            <p className="page-subtitle">Welcome back, {user?.name} — here's your overview</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary-gradient btn-sm" onClick={() => navigate('/admin/providers')}>
              <i className="bi bi-plus-circle-fill me-1"></i>Add Provider
            </button>
            <button className="btn btn-outline-glass btn-sm" onClick={() => navigate('/admin/users')}>
              <i className="bi bi-people-fill me-1"></i>Manage Users
            </button>
          </div>
        </div>

        {error && (
          <div className="alert mb-4" style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: 12 }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        )}

        {/* KPI Cards */}
        {loading ? (
          <div className="loading-spinner"><div className="spinner-border" style={{ color: 'var(--primary-light)' }}></div></div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              {kpiCards.map((card) => (
                <div className="col-sm-6 col-xl-3" key={card.label}>
                  <div className={`stat-card ${card.color}`}>
                    <div className="d-flex align-items-start justify-content-between">
                      <div>
                        <p className="stat-label mb-1">{card.label}</p>
                        <p className="stat-value">{card.value}</p>
                      </div>
                      <div className={`stat-icon ${card.color}`}>
                        <i className={`bi ${card.icon}`}></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Capabilities Matrix */}
            <div className="glass-card p-4 mb-4">
              <h2 className="section-title mb-3">
                <i className="bi bi-shield-check" style={{ color: 'var(--primary-light)' }}></i>
                Website Capabilities &amp; Role Access Matrix
              </h2>
              <div className="table-responsive cap-table">
                <table className="table table-dark table-borderless mb-0">
                  <thead>
                    <tr>
                      <th>Capability / Feature</th>
                      <th className="text-center">
                        <span className="badge-admin">ADMIN</span>
                      </th>
                      <th className="text-center">
                        <span className="badge-user">USER</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {capabilities.map((row, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-primary)' }}>{row.capability}</td>
                        <td className="text-center">
                          {row.admin ? (
                            <i className="bi bi-check-circle-fill" style={{ color: 'var(--success)', fontSize: '1.1rem' }}></i>
                          ) : (
                            <i className="bi bi-x-circle-fill" style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}></i>
                          )}
                        </td>
                        <td className="text-center">
                          {row.user ? (
                            <i className="bi bi-check-circle-fill" style={{ color: 'var(--success)', fontSize: '1.1rem' }}></i>
                          ) : (
                            <i className="bi bi-x-circle-fill" style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}></i>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="row g-3">
              {/* Category Breakdown */}
              <div className="col-lg-5">
                <div className="glass-card p-4 h-100">
                  <h2 className="section-title mb-3">
                    <i className="bi bi-bar-chart-fill" style={{ color: 'var(--secondary)' }}></i>
                    Category Breakdown
                  </h2>
                  {stats?.categoryBreakdown?.map((cat) => (
                    <div key={cat.category} className="d-flex align-items-center justify-content-between mb-2">
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {catIcon[cat.category] || '🔧'} {cat.category}
                      </span>
                      <span className="badge rounded-pill" style={{ background: 'rgba(79,70,229,0.2)', color: 'var(--primary-light)', border: '1px solid rgba(79,70,229,0.3)', fontWeight: 700 }}>
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="col-lg-7">
                <div className="glass-card p-4">
                  <h2 className="section-title mb-3">
                    <i className="bi bi-clock-history" style={{ color: 'var(--warning)' }}></i>
                    Recent Providers
                  </h2>
                  <div className="table-responsive">
                    <table className="qf-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Area</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recentProviders?.map((p) => (
                          <tr key={p._id}>
                            <td>{p.name}</td>
                            <td>
                              <span className={`category-badge cat-${p.category.replace(/\s+/g, '-')}`}>{p.category}</span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{p.area}</td>
                            <td>
                              <span className={p.availability ? 'badge-available' : 'badge-unavailable'}>
                                {p.availability ? 'Available' : 'Busy'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button className="btn btn-outline-glass btn-sm mt-3" onClick={() => navigate('/admin/providers')}>
                    View All Providers →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
