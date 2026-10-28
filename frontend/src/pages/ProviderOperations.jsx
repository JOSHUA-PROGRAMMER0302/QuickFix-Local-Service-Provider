import { useEffect, useState, useRef } from 'react';
import { Modal } from 'bootstrap';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const CATEGORIES = ['Plumber', 'Electrician', 'Carpenter', 'AC Technician', 'Appliance Repair', 'Painter', 'House Cleaning'];
const AREAS = ['Anna Nagar', 'Adyar', 'T. Nagar', 'Velachery', 'Porur', 'OMR', 'Tambaram', 'Chromepet', 'Guindy', 'Nungambakkam', 'Perambur', 'Kilpauk'];

const emptyForm = {
  name: '', category: 'Plumber', email: '', phone: '', area: 'Anna Nagar',
  city: 'Chennai', experienceYears: '', visitCharge: '', availability: true,
  verified: true, rating: 4.5, skills: '', description: '',
};

const phoneRegex = /^[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProviderOperations = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');

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

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      if (areaFilter) params.area = areaFilter;
      if (availFilter !== '') params.availability = availFilter;
      const { data } = await axiosInstance.get('/providers', { params });
      setProviders(data.providers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, [search, catFilter, areaFilter, availFilter]);

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!emailRegex.test(form.email)) e.email = 'Valid email required.';
    if (!phoneRegex.test(form.phone)) e.phone = 'Phone must be 10 digits.';
    if (!form.area.trim()) e.area = 'Area is required.';
    if (form.experienceYears === '' || Number(form.experienceYears) < 0) e.experienceYears = 'Enter valid experience (≥0).';
    if (form.visitCharge === '' || Number(form.visitCharge) < 0) e.visitCharge = 'Enter valid charge (≥0).';
    if (!form.description.trim()) e.description = 'Description is required.';
    return e;
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const openAdd = () => {
    setForm(emptyForm);
    setFormErrors({});
    setServerError('');
    setEditId(null);
    addModalInstance.current.show();
  };

  const openEdit = (provider) => {
    setEditId(provider._id);
    setForm({
      name: provider.name, category: provider.category, email: provider.email,
      phone: provider.phone, area: provider.area, city: provider.city || 'Chennai',
      experienceYears: provider.experienceYears, visitCharge: provider.visitCharge,
      availability: provider.availability, verified: provider.verified,
      rating: provider.rating, skills: Array.isArray(provider.skills) ? provider.skills.join(', ') : '',
      description: provider.description,
    });
    setFormErrors({});
    setServerError('');
    editModalInstance.current.show();
  };

  const handleSubmit = async (isEdit = false) => {
    const v = validateForm();
    if (Object.keys(v).length > 0) { setFormErrors(v); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        experienceYears: Number(form.experienceYears),
        visitCharge: Number(form.visitCharge),
        rating: Number(form.rating),
        skills: typeof form.skills === 'string' ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : form.skills,
      };
      if (isEdit) {
        await axiosInstance.put(`/providers/${editId}`, payload);
        editModalInstance.current.hide();
      } else {
        await axiosInstance.post('/providers', payload);
        addModalInstance.current.hide();
      }
      fetchProviders();
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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete provider "${name}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/providers/${id}`);
      fetchProviders();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const ProviderFormFields = () => (
    <>
      {serverError && (
        <div className="alert py-2 mb-3" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 8 }}>
          {serverError}
        </div>
      )}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Provider Name *</label>
          <input type="text" name="name" className={`form-control form-control-dark ${formErrors.name ? 'is-invalid' : ''}`} value={form.name} onChange={handleFormChange} placeholder="e.g. Murugan Pipe Works" />
          {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
        </div>
        <div className="col-md-6">
          <label className="form-label">Category *</label>
          <select name="category" className="form-control form-control-dark form-select-dark" value={form.category} onChange={handleFormChange}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Email *</label>
          <input type="email" name="email" className={`form-control form-control-dark ${formErrors.email ? 'is-invalid' : ''}`} value={form.email} onChange={handleFormChange} placeholder="provider@gmail.com" />
          {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
        </div>
        <div className="col-md-6">
          <label className="form-label">Phone (10 digits) *</label>
          <input type="tel" name="phone" className={`form-control form-control-dark ${formErrors.phone ? 'is-invalid' : ''}`} value={form.phone} onChange={handleFormChange} placeholder="9876543210" maxLength={10} />
          {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
        </div>
        <div className="col-md-6">
          <label className="form-label">Area *</label>
          <select name="area" className="form-control form-control-dark form-select-dark" value={form.area} onChange={handleFormChange}>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">City</label>
          <input type="text" name="city" className="form-control form-control-dark" value={form.city} onChange={handleFormChange} placeholder="Chennai" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Experience (yrs) *</label>
          <input type="number" name="experienceYears" className={`form-control form-control-dark ${formErrors.experienceYears ? 'is-invalid' : ''}`} value={form.experienceYears} onChange={handleFormChange} min={0} />
          {formErrors.experienceYears && <div className="invalid-feedback">{formErrors.experienceYears}</div>}
        </div>
        <div className="col-md-4">
          <label className="form-label">Visit Charge (₹) *</label>
          <input type="number" name="visitCharge" className={`form-control form-control-dark ${formErrors.visitCharge ? 'is-invalid' : ''}`} value={form.visitCharge} onChange={handleFormChange} min={0} />
          {formErrors.visitCharge && <div className="invalid-feedback">{formErrors.visitCharge}</div>}
        </div>
        <div className="col-md-4">
          <label className="form-label">Rating (1–5)</label>
          <input type="number" name="rating" className="form-control form-control-dark" value={form.rating} onChange={handleFormChange} min={1} max={5} step={0.1} />
        </div>
        <div className="col-12">
          <label className="form-label">Skills (comma-separated)</label>
          <input type="text" name="skills" className="form-control form-control-dark" value={form.skills} onChange={handleFormChange} placeholder="Pipe Fitting, Leak Repair, Water Heater" />
        </div>
        <div className="col-12">
          <label className="form-label">Description *</label>
          <textarea name="description" rows={3} className={`form-control form-control-dark ${formErrors.description ? 'is-invalid' : ''}`} value={form.description} onChange={handleFormChange} placeholder="Brief description of services..." />
          {formErrors.description && <div className="invalid-feedback">{formErrors.description}</div>}
        </div>
        <div className="col-md-6">
          <div className="form-check form-switch mt-2">
            <input className="form-check-input" type="checkbox" name="availability" id="avail-check" checked={form.availability} onChange={handleFormChange} />
            <label className="form-check-label" htmlFor="avail-check" style={{ color: 'var(--text-secondary)' }}>Available for booking</label>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-check form-switch mt-2">
            <input className="form-check-input" type="checkbox" name="verified" id="verified-check" checked={form.verified} onChange={handleFormChange} />
            <label className="form-check-label" htmlFor="verified-check" style={{ color: 'var(--text-secondary)' }}>Verified provider</label>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="page-title"><i className="bi bi-tools me-2" style={{ color: 'var(--primary-light)' }}></i>Provider Operations</h1>
            <p className="page-subtitle">Manage all service providers — add, edit, delete, filter</p>
          </div>
          <button className="btn btn-primary-gradient" onClick={openAdd} id="add-provider-btn">
            <i className="bi bi-plus-circle-fill me-2"></i>Add Provider
          </button>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input type="text" className="form-control form-control-dark" placeholder="Search by name, description, skill..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Category</label>
              <select className="form-control form-control-dark form-select-dark" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Area</label>
              <select className="form-control form-control-dark form-select-dark" value={areaFilter} onChange={e => setAreaFilter(e.target.value)}>
                <option value="">All Areas</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Availability</label>
              <select className="form-control form-control-dark form-select-dark" value={availFilter} onChange={e => setAvailFilter(e.target.value)}>
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Busy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Provider Table */}
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
                    <th>Category</th>
                    <th>Area</th>
                    <th>Phone</th>
                    <th>Exp.</th>
                    <th>Charge</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-5" style={{ color: 'var(--text-muted)' }}>No providers found. Try adjusting filters.</td></tr>
                  ) : (
                    providers.map((p, i) => (
                      <tr key={p._id}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td>
                          <strong>{p.name}</strong>
                          {p.verified && <i className="bi bi-patch-check-fill ms-1" style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}></i>}
                        </td>
                        <td><span className={`category-badge cat-${p.category.replace(/\s+/g, '-')}`}>{p.category}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.area}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.phone}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.experienceYears} yrs</td>
                        <td style={{ color: 'var(--text-secondary)' }}>₹{p.visitCharge}</td>
                        <td>
                          <span style={{ color: '#f59e0b' }}>★</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}> {p.rating}</span>
                        </td>
                        <td><span className={p.availability ? 'badge-available' : 'badge-unavailable'}>{p.availability ? 'Available' : 'Busy'}</span></td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm" style={{ background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--primary-light)', borderRadius: 8 }} onClick={() => openEdit(p)} title="Edit">
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', borderRadius: 8 }} onClick={() => handleDelete(p._id, p.name)} title="Delete">
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

      {/* Add Provider Modal */}
      <div className="modal fade modal-dark" id="addProviderModal" ref={addModalRef} tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-700"><i className="bi bi-plus-circle-fill me-2" style={{ color: 'var(--primary-light)' }}></i>Add New Service Provider</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <ProviderFormFields />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-glass" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary-gradient" onClick={() => handleSubmit(false)} disabled={submitting} id="save-provider-btn">
                {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-check-circle-fill me-2"></i>Add Provider</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Provider Modal */}
      <div className="modal fade modal-dark" id="editProviderModal" ref={editModalRef} tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-700"><i className="bi bi-pencil-fill me-2" style={{ color: '#f59e0b' }}></i>Edit Service Provider</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <ProviderFormFields />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-glass" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary-gradient" onClick={() => handleSubmit(true)} disabled={submitting} id="update-provider-btn">
                {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-check-circle-fill me-2"></i>Update Provider</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderOperations;
