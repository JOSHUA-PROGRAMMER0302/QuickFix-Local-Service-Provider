import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    { to: '/admin/providers', icon: 'bi-tools', label: 'Providers' },
    { to: '/admin/users', icon: 'bi-people-fill', label: 'Users' },
  ];

  const userLinks = [
    { to: '/user/directory', icon: 'bi-search-heart', label: 'Find Services' },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <>
      <div className="top-notice-bar">
        Save ₹500 on your first home service booking! <a href="/user/directory">Learn More</a>
      </div>
      <nav className="navbar navbar-expand-lg qf-navbar sticky-top">
        <div className="container-fluid">
          {/* Brand */}
          <Link className="navbar-brand" to={user?.role === 'admin' ? '/admin/dashboard' : '/user/directory'}>
            <span className="brand-icon-box">⚡</span>
            <span>QuickFix</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#qfNavbar"
            aria-controls="qfNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="qfNavbar">
            {/* Nav Links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {links.map(({ to, icon, label }) => (
                <li className="nav-item" key={to}>
                  <NavLink className="nav-link" to={to}>
                    <i className={`bi ${icon} me-1`}></i>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Right Side: user info + actions */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {user && (
                <span className="d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <i className="bi bi-person-circle" style={{ fontSize: '1.15rem', color: 'var(--primary)' }}></i>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{user.name}</span>
                  <span className={user.role === 'admin' ? 'badge-admin' : 'badge-user'}>
                    {user.role.toUpperCase()}
                  </span>
                </span>
              )}

              {user?.role !== 'admin' && (
                <a
                  href="/user/directory#services-directory"
                  className="btn btn-sm btn-primary-gradient d-none d-md-inline-block"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.78rem', padding: '0.55rem 1.15rem' }}
                >
                  Schedule Service
                </a>
              )}

              <NavLink
                to="/change-password"
                className="btn btn-sm btn-outline-glass d-flex align-items-center gap-1"
                title="Change Password"
              >
                <i className="bi bi-key-fill"></i>
                <span className="d-none d-xl-inline">Password</span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="btn btn-sm"
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                }}
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
