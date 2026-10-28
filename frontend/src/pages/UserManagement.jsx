import { useEffect, useState, useRef } from 'react';
import { Modal } from 'bootstrap';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const emptyForm = { name: '', email: '', phone: '', password: '', role: 'user', status: 'active' };
const phoneRegex = /^[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordChecks = [
  { test: (p) => p.length >= 8 },
  { test: (p) => /[A-Z]/.test(p) },
  { test: (p) => /[a-z]/.test(p) },
  { test: (p) => /[0-9]/.test(p) },
  { test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];
const strongPassword = (p) => passwordChecks.every(c => c.test(p));

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  const addModalRef = useRef(null);
  const editModalRef = useRef(null);
  const addModalInstance = useRef(null);
  const editModalInstance = useRef(null);

  useEffect(() => {
    addModalInstance.current = new Modal(addModalRef.current, { backdrop: 'static' });
    editModalInstance.current = new Modal(editModalRef.current, { backdrop: 'static' });
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await axiosInstance.get('/users', { params });
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const validateAdd = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!emailRegex.test(form.email)) e.email = 'Valid email required.';
    if (!phoneRegex.test(form.phone)) e.phone = 'Phone must be 10 digits.';
    if (!form.password) e.password = 'Password is required.';
    else if (!strongPassword(form.password)) e.password = 'Password must have 8+ chars, uppercase, lowercase, number, and special char.';
    return e;
  };

  const validateEdit = () => {
    const e = {};
    if (form.name && !form.name.trim()) e.name = 'Name cannot be empty.';
    if (form.email && !emailRegex.test(form.email)) e.email = 'Valid email required.';
    if (form.phone && !phoneRegex.test(form.phone)) e.phone = 'Phone must be 10 digits.';
    return e;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const openAdd = () => {
    setForm(emptyForm);
    setFormErrors({});
    setServerError('');
    setEditId(null);
    addModalInstance.current.show();
  };

  const openEdit = (u) => {
    setEditId(u._id);
    setForm({ name: u.name, email: u.email, phone: u.phone, password: '', role: u.role, status: u.status });
    setFormErrors({});
    setServerError('');
    editModalInstance.current.show();
  };

  const handleAdd = async () => {
    const v = validateAdd();
    if (Object.keys(v).length > 0) { setFormErrors(v); return; }
    setSubmitting(true);
    try {
      await axiosInstance.post('/users', { name: form.name.trim(), email: form.email, phone: form.phone, password: form.password, role: form.role });
      addModalInstance.current.hide();
      fetchUsers();
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors) {
        const fe = {};
        errData.errors.forEach(({ field, message }) => { fe[field] = message; });
        setFormErrors(fe);
      } else {
        setServerError(errData?.message || 'Operation failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    const v = validateEdit();
    if (Object.keys(v).length > 0) { setFormErrors(v); return; }
    setSubmitting(true);
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role, status: form.status };
      await axiosInstance.put(`/users/${editId}`, payload);
      editModalInstance.current.hide();
      fetchUsers();
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors) {
        const fe = {};
        errData.errors.forEach(({ field, message }) => { fe[field] = message; });
        setFormErrors(fe);
      } else {
        setServerError(errData?.message || 'Update failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const ErrorAlert = () => serverError ? (
    <div className="alert py-2 mb-3" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 8 }}>
      {serverError}
    </div>
  ) : null;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="page-title"><i className="bi bi-people-fill me-2" style={{ color: 'var(--primary-light)' }}></i>User Management</h1>
            <p className="page-subtitle">Add, edit, manage roles and status of all users</p>
          </div>
          <button className="btn btn-primary-gradient" onClick={openAdd} id="add-user-btn">
            <i className="bi bi-person-plus-fill me-2"></i>Add User
          </button>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="row g-2">
            <div className="col-md-8">
              <label className="form-label">Search Users</label>
              <input type="text" className="form-control form-control-dark" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Role</label>
              <select className="form-control form-control-dark form-select-dark" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card p-0 overflow-hidden">
          {loading ? (
            <div className="loading-spinner"><div className="spinner-border" style={{ color: 'var(--primary-light)' }}></div></div>
          ) : (
            <div className="table-responsive">
              <table className="qf-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-5" style={{ color: 'var(--text-muted)' }}>No users found.</td></tr>
                  ) : (
                    users.map((u, i) => (
                      <tr key={u._id}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td>
                          <strong>{u.name}</strong>
                          {u._id === currentUser?._id && <span className="ms-2" style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 600 }}>(You)</span>}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.phone}</td>
                        <td><span className={u.role === 'admin' ? 'badge-admin' : 'badge-user'}>{u.role.toUpperCase()}</span></td>
                        <td><span className={u.status === 'active' ? 'badge-active' : 'badge-inactive'}>{u.status}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm" style={{ background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--primary-light)', borderRadius: 8 }} onClick={() => openEdit(u)} title="Edit">
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', borderRadius: 8, opacity: u._id === currentUser?._id ? 0.4 : 1 }}
                              onClick={() => handleDelete(u._id, u.name)}
                              disabled={u._id === currentUser?._id}
                              title={u._id === currentUser?._id ? 'Cannot delete your own account' : 'Delete'}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <div className="modal fade modal-dark" id="addUserModal" ref={addModalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-700"><i className="bi bi-person-plus-fill me-2" style={{ color: 'var(--primary-light)' }}></i>Add New User</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <ErrorAlert />
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name *</label>
                  <input type="text" name="name" className={`form-control form-control-dark ${formErrors.name ? 'is-invalid' : ''}`} value={form.name} onChange={handleFormChange} placeholder="Full Name" />
                  {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email *</label>
                  <input type="email" name="email" className={`form-control form-control-dark ${formErrors.email ? 'is-invalid' : ''}`} value={form.email} onChange={handleFormChange} placeholder="user@example.com" />
                  {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone (10 digits) *</label>
                  <input type="tel" name="phone" className={`form-control form-control-dark ${formErrors.phone ? 'is-invalid' : ''}`} value={form.phone} onChange={handleFormChange} placeholder="9876543210" maxLength={10} />
                  {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password *</label>
                  <input type="password" name="password" className={`form-control form-control-dark ${formErrors.password ? 'is-invalid' : ''}`} value={form.password} onChange={handleFormChange} placeholder="••••••••" />
                  {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Min 8 chars, uppercase, lowercase, number, special char</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role *</label>
                  <select name="role" className="form-control form-control-dark form-select-dark" value={form.role} onChange={handleFormChange}>
                    <option value="user">Normal User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-glass" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary-gradient" onClick={handleAdd} disabled={submitting} id="save-user-btn">
                {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Adding...</> : <><i className="bi bi-check-circle-fill me-2"></i>Add User</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <div className="modal fade modal-dark" id="editUserModal" ref={editModalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-700"><i className="bi bi-pencil-fill me-2" style={{ color: '#f59e0b' }}></i>Edit User</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <ErrorAlert />
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" className={`form-control form-control-dark ${formErrors.name ? 'is-invalid' : ''}`} value={form.name} onChange={handleFormChange} />
                  {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className={`form-control form-control-dark ${formErrors.email ? 'is-invalid' : ''}`} value={form.email} onChange={handleFormChange} />
                  {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone (10 digits)</label>
                  <input type="tel" name="phone" className={`form-control form-control-dark ${formErrors.phone ? 'is-invalid' : ''}`} value={form.phone} onChange={handleFormChange} maxLength={10} />
                  {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Role</label>
                  <select name="role" className="form-control form-control-dark form-select-dark" value={form.role} onChange={handleFormChange}>
                    <option value="user">Normal User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-control form-control-dark form-select-dark" value={form.status} onChange={handleFormChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-glass" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary-gradient" onClick={handleEdit} disabled={submitting} id="update-user-btn">
                {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-check-circle-fill me-2"></i>Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagement;
