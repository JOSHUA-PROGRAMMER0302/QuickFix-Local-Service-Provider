import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

const passwordChecks = [
  { id: 'len',   label: '8+ characters',         test: (p) => p.length >= 8 },
  { id: 'up',    label: 'One uppercase letter',   test: (p) => /[A-Z]/.test(p) },
  { id: 'low',   label: 'One lowercase letter',   test: (p) => /[a-z]/.test(p) },
  { id: 'num',   label: 'One number',             test: (p) => /[0-9]/.test(p) },
  { id: 'spec',  label: 'One special character',  test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordMet = passwordChecks.map((c) => ({ ...c, met: c.test(form.password) }));
  const allPasswordMet = passwordMet.every((c) => c.met);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email) e.email = 'Email is required.';
    else if (!emailRegex.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.phone) e.phone = 'Phone number is required.';
    else if (!phoneRegex.test(form.phone)) e.phone = 'Phone must be exactly 10 digits.';
    if (!form.password) e.password = 'Password is required.';
    else if (!allPasswordMet) e.password = 'Password does not meet all strength requirements.';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/register', {
        name: form.name.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/user/directory');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors) {
        const fieldErrors = {};
        errData.errors.forEach(({ field, message }) => { fieldErrors[field] = message; });
        setErrors(fieldErrors);
      } else {
        setServerError(errData?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">⚡</div>
        <h1 className="text-center mb-1" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Create Account</h1>
        <p className="text-center mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Join QuickFix — Find trusted local services
        </p>

        {serverError && (
          <div className="alert py-2 mb-3 d-flex align-items-center gap-2" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10 }}>
            <i className="bi bi-exclamation-triangle-fill"></i>{serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label" htmlFor="signup-name">Full Name</label>
            <input id="signup-name" type="text" name="name" className={`form-control form-control-dark ${errors.name ? 'is-invalid' : ''}`} placeholder="Rahul Sharma" value={form.name} onChange={handleChange} />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label" htmlFor="signup-email">Email Address</label>
            <input id="signup-email" type="email" name="email" className={`form-control form-control-dark ${errors.email ? 'is-invalid' : ''}`} placeholder="you@example.com" value={form.email} onChange={handleChange} />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label" htmlFor="signup-phone">Phone Number (10 digits)</label>
            <input id="signup-phone" type="tel" name="phone" className={`form-control form-control-dark ${errors.phone ? 'is-invalid' : ''}`} placeholder="9876543210" maxLength={10} value={form.phone} onChange={handleChange} />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="form-label" htmlFor="signup-role">Account Role</label>
            <select id="signup-role" name="role" className="form-control form-control-dark form-select-dark" value={form.role} onChange={handleChange}>
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <input id="signup-password" type="password" name="password" className={`form-control form-control-dark ${errors.password ? 'is-invalid' : ''}`} placeholder="••••••••" value={form.password} onChange={handleChange} />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          {/* Live password strength checklist */}
          {form.password && (
            <div className="mb-3 p-2" style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 8, border: '1px solid var(--dark-border)' }}>
              <div className="row g-1">
                {passwordMet.map((c) => (
                  <div key={c.id} className="col-6">
                    <span className={`strength-item ${c.met ? 'met' : ''}`}>
                      <i className={`bi ${c.met ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
            <input id="signup-confirm" type="password" name="confirmPassword" className={`form-control form-control-dark ${errors.confirmPassword ? 'is-invalid' : ''}`} placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </div>

          <button type="submit" className="btn btn-primary-gradient w-100" disabled={loading} id="signup-submit-btn">
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating Account...</> : <><i className="bi bi-person-plus-fill me-2"></i>Create Account</>}
          </button>
        </form>

        <p className="text-center mt-3 mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
