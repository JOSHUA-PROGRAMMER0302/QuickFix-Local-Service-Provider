import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const passwordChecks = [
  { id: 'len',  label: '8+ characters',        test: (p) => p.length >= 8 },
  { id: 'up',   label: 'One uppercase letter',  test: (p) => /[A-Z]/.test(p) },
  { id: 'low',  label: 'One lowercase letter',  test: (p) => /[a-z]/.test(p) },
  { id: 'num',  label: 'One number',            test: (p) => /[0-9]/.test(p) },
  { id: 'spec', label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const ChangePassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const passwordMet = passwordChecks.map((c) => ({ ...c, met: c.test(form.newPassword) }));
  const allMet = passwordMet.every((c) => c.met);

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required.';
    if (!form.newPassword) e.newPassword = 'New password is required.';
    else if (!allMet) e.newPassword = 'New password does not meet strength requirements.';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your new password.';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerMsg({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setLoading(true);
    try {
      const { data } = await axiosInstance.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setServerMsg({ type: 'success', text: data.message });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors) {
        const fe = {};
        errData.errors.forEach(({ field, message }) => { fe[field] = message; });
        setErrors(fe);
      } else {
        setServerMsg({ type: 'error', text: errData?.message || 'Failed to change password.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <div className="auth-logo">
            <i className="bi bi-key-fill" style={{ fontSize: '1.4rem' }}></i>
          </div>
          <h1 className="text-center mb-1" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Change Password</h1>
          <p className="text-center mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Signed in as <strong style={{ color: 'var(--primary-light)' }}>{user?.name}</strong> ({user?.role})
          </p>

          {serverMsg.text && (
            <div
              className="alert py-2 mb-3 d-flex align-items-center gap-2"
              style={{
                background: serverMsg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${serverMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: serverMsg.type === 'success' ? '#34d399' : '#f87171',
                borderRadius: 10,
              }}
            >
              <i className={`bi ${serverMsg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
              {serverMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="cp-current">Current Password</label>
              <input id="cp-current" type="password" name="currentPassword" className={`form-control form-control-dark ${errors.currentPassword ? 'is-invalid' : ''}`} placeholder="••••••••" value={form.currentPassword} onChange={handleChange} />
              {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="cp-new">New Password</label>
              <input id="cp-new" type="password" name="newPassword" className={`form-control form-control-dark ${errors.newPassword ? 'is-invalid' : ''}`} placeholder="••••••••" value={form.newPassword} onChange={handleChange} />
              {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
            </div>

            {form.newPassword && (
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

            <div className="mb-4">
              <label className="form-label" htmlFor="cp-confirm">Confirm New Password</label>
              <input id="cp-confirm" type="password" name="confirmPassword" className={`form-control form-control-dark ${errors.confirmPassword ? 'is-invalid' : ''}`} placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>

            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-glass flex-fill" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1"></i>Back
              </button>
              <button type="submit" className="btn btn-primary-gradient flex-fill" disabled={loading} id="cp-submit-btn">
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</> : <><i className="bi bi-shield-lock-fill me-2"></i>Update Password</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
