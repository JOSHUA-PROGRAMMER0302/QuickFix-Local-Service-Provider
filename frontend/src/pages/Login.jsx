import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required.';
    else if (!emailRegex.test(form.email)) newErrors.email = 'Enter a valid email address.';
    if (!form.password) newErrors.password = 'Password is required.';
    return newErrors;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/login', form);
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/user/directory');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (role) => {
    if (role === 'admin') setForm({ email: 'admin@servicedir.com', password: 'Admin@123' });
    else setForm({ email: 'rahul@example.com', password: 'User@123' });
    setErrors({});
    setServerError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">⚡</div>
        <h1 className="text-center fw-800 mb-1" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          Welcome back
        </h1>
        <p className="text-center mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Sign in to QuickFix Service Directory
        </p>

        {/* Demo Credentials Box */}
        <div className="demo-box mb-4">
          <p className="mb-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <i className="bi bi-lightning-charge-fill me-1" style={{ color: '#f59e0b' }}></i>
            1-Click Demo Credentials (Faculty Evaluation)
          </p>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm flex-fill"
              style={{ background: '#dbeafe', border: '1px solid #93c5fd', color: '#1d4ed8', borderRadius: 8, fontWeight: 700, fontSize: '0.78rem' }}
              onClick={() => autofill('admin')}
            >
              <i className="bi bi-shield-fill-check me-1"></i>Auto-Fill Admin
            </button>
            <button
              type="button"
              className="btn btn-sm flex-fill"
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', borderRadius: 8, fontWeight: 600, fontSize: '0.78rem' }}
              onClick={() => autofill('user')}
            >
              <i className="bi bi-person-fill me-1"></i>Auto-Fill User
            </button>
          </div>
          <p className="mt-2 mb-0" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Admin: admin@servicedir.com / Admin@123 &nbsp;|&nbsp; User: rahul@example.com / User@123
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: 10 }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            {serverError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid var(--dark-border)', borderRight: 'none', color: 'var(--text-muted)' }}>
                <i className="bi bi-envelope-fill"></i>
              </span>
              <input
                id="login-email"
                type="email"
                name="email"
                className={`form-control form-control-dark ${errors.email ? 'is-invalid' : ''}`}
                style={{ borderLeft: 'none' }}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid var(--dark-border)', borderRight: 'none', color: 'var(--text-muted)' }}>
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                id="login-password"
                type="password"
                name="password"
                className={`form-control form-control-dark ${errors.password ? 'is-invalid' : ''}`}
                style={{ borderLeft: 'none' }}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-gradient w-100"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
            ) : (
              <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
            )}
          </button>
        </form>

        <p className="text-center mt-3 mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
