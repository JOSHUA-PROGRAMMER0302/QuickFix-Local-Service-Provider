import { useEffect, useState, useRef } from 'react';
import { Modal } from 'bootstrap';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const CATEGORIES = ['Plumber', 'Electrician', 'Carpenter', 'AC Technician', 'Appliance Repair', 'Painter', 'House Cleaning'];
const AREAS = ['Anna Nagar', 'Adyar', 'T. Nagar', 'Velachery', 'Porur', 'OMR', 'Tambaram', 'Chromepet', 'Guindy', 'Nungambakkam', 'Perambur', 'Kilpauk'];

const catIcon = {
  Plumber: '🔧', Electrician: '⚡', Carpenter: '🪚',
  'AC Technician': '❄️', 'Appliance Repair': '🔌', Painter: '🖌️', 'House Cleaning': '🧹',
};

const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="rating-stars">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span className="ms-1" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{rating}</span>
    </span>
  );
};

const UserDirectory = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [availOnly, setAvailOnly] = useState(false);
  const [selected, setSelected] = useState(null);

  const detailModalRef = useRef(null);
  const detailModalInstance = useRef(null);

  useEffect(() => {
    detailModalInstance.current = new Modal(detailModalRef.current, {});
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      if (areaFilter) params.area = areaFilter;
      if (availOnly) params.availability = 'true';
      const { data } = await axiosInstance.get('/providers', { params });
      setProviders(data.providers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, [search, catFilter, areaFilter, availOnly]);

  const openDetails = (provider) => {
    setSelected(provider);
    detailModalInstance.current.show();
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        {/* Hero Banner */}
        <div className="hero-banner mb-4" id="services-hero">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 className="hero-title">Fast, Reliable Local Services<br />Anytime you need us</h1>
            <p className="hero-subtitle">
              Certified technicians, upfront pricing, and <strong>24/7 emergency service</strong> to keep your home running worry-free across Chennai.
            </p>
            <div className="hero-cta-group">
              <a href="#services-directory" className="btn-hero-primary">
                <i className="bi bi-calendar-check me-2"></i>Schedule Service
              </a>
              <a href="tel:1800-QUICKFIX" className="btn-hero-glass">
                <i className="bi bi-telephone-fill me-2"></i>Call Now
              </a>
            </div>
            <div className="hero-pills-row">
              <span className="hero-pill"><i className="bi bi-clock-history"></i> 24/7 Emergency</span>
              <span className="hero-pill"><i className="bi bi-currency-rupee"></i> Upfront pricing</span>
              <span className="hero-pill"><i className="bi bi-geo-alt-fill"></i> Locally Owned</span>
              <span className="hero-pill"><i className="bi bi-shield-check"></i> Licensed &amp; Insured</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Search Services</label>
              <div className="input-group">
                <span className="input-group-text" style={{ borderRight: 'none' }}>
                  <i className="bi bi-search"></i>
                </span>
                <input type="text" className="form-control form-control-dark" style={{ borderLeft: 'none' }} placeholder="Name, skill, description..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">Category</label>
              <select className="form-control form-control-dark form-select-dark" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{catIcon[c]} {c}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Area</label>
              <select className="form-control form-control-dark form-select-dark" value={areaFilter} onChange={e => setAreaFilter(e.target.value)}>
                <option value="">All Areas</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-center gap-2 pt-1">
              <div className="form-check form-switch mb-0 mt-3">
                <input className="form-check-input" type="checkbox" id="avail-switch" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)} />
                <label className="form-check-label" htmlFor="avail-switch" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Available Only</label>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{providers.length}</strong> service providers
          </p>
          {(search || catFilter || areaFilter || availOnly) && (
            <button className="btn btn-sm btn-outline-glass" onClick={() => { setSearch(''); setCatFilter(''); setAreaFilter(''); setAvailOnly(false); }}>
              <i className="bi bi-x-circle me-1"></i>Clear Filters
            </button>
          )}
        </div>

        {/* Provider Cards Grid */}
        <div id="services-directory">
        {loading ? (
          <div className="loading-spinner"><div className="spinner-border" style={{ color: 'var(--primary-light)' }}></div></div>
        ) : providers.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No providers found matching your filters.</p>
            <button className="btn btn-outline-glass mt-2" onClick={() => { setSearch(''); setCatFilter(''); setAreaFilter(''); setAvailOnly(false); }}>Reset Filters</button>
          </div>
        ) : (
          <div className="row g-3">
            {providers.map((p) => (
              <div className="col-sm-6 col-xl-4" key={p._id}>
                <div className="provider-card" onClick={() => openDetails(p)}>
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="provider-avatar">{p.name.charAt(0)}</div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-center gap-1 flex-wrap">
                        <h3 className="mb-0" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</h3>
                        {p.verified && <i className="bi bi-patch-check-fill" style={{ color: 'var(--secondary)', fontSize: '0.8rem' }} title="Verified"></i>}
                      </div>
                      <span className={`category-badge cat-${p.category.replace(/\s+/g, '-')}`}>{catIcon[p.category]} {p.category}</span>
                    </div>
                    <span className={p.availability ? 'badge-available' : 'badge-unavailable'}>
                      {p.availability ? '● Available' : '● Busy'}
                    </span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mb-2">
                    {renderStars(p.rating)}
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      <i className="bi bi-briefcase-fill me-1" style={{ color: 'var(--text-muted)' }}></i>
                      {p.experienceYears} yrs exp
                    </span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      <i className="bi bi-geo-alt-fill me-1" style={{ color: 'var(--danger)' }}></i>
                      {p.area}, {p.city}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>
                      ₹{p.visitCharge} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>/ visit</span>
                    </span>
                  </div>

                  {/* Skills pills */}
                  {p.skills?.length > 0 && (
                    <div className="mb-3">
                      {p.skills.slice(0, 3).map((s, i) => <span key={i} className="skill-pill">{s}</span>)}
                      {p.skills.length > 3 && <span className="skill-pill">+{p.skills.length - 3}</span>}
                    </div>
                  )}

                  <button className="btn btn-primary-gradient w-100 btn-sm" onClick={(e) => { e.stopPropagation(); openDetails(p); }}>
                    <i className="bi bi-eye-fill me-2"></i>View Full Details &amp; Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Provider Detail Modal */}
      <div className="modal fade modal-dark" id="providerDetailModal" ref={detailModalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            {selected && (
              <>
                <div className="modal-header">
                  <div className="d-flex align-items-center gap-3">
                    <div className="provider-avatar">{selected.name.charAt(0)}</div>
                    <div>
                      <h5 className="modal-title mb-0">
                        {selected.name}
                        {selected.verified && <i className="bi bi-patch-check-fill ms-2" style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}></i>}
                      </h5>
                      <span className={`category-badge cat-${selected.category.replace(/\s+/g, '-')}`}>{catIcon[selected.category]} {selected.category}</span>
                    </div>
                  </div>
                  <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Contact Details */}
                    <div className="col-md-6">
                      <div className="p-3 rounded" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid var(--dark-border)' }}>
                        <h6 style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contact Details</h6>
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-telephone-fill" style={{ color: 'var(--success)', width: 20 }}></i>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selected.phone}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-envelope-fill" style={{ color: 'var(--primary-light)', width: 20 }}></i>
                            <span style={{ color: 'var(--text-secondary)' }}>{selected.email}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-geo-alt-fill" style={{ color: 'var(--danger)', width: 20 }}></i>
                            <span style={{ color: 'var(--text-secondary)' }}>{selected.area}, {selected.city}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Service Info */}
                    <div className="col-md-6">
                      <div className="p-3 rounded" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid var(--dark-border)' }}>
                        <h6 style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Service Info</h6>
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between">
                            <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selected.experienceYears} years</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span style={{ color: 'var(--text-muted)' }}>Visit Charge</span>
                            <span style={{ color: 'var(--success)', fontWeight: 700 }}>₹{selected.visitCharge}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span style={{ color: 'var(--text-muted)' }}>Rating</span>
                            <span>{renderStars(selected.rating)}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span style={{ color: 'var(--text-muted)' }}>Availability</span>
                            <span className={selected.availability ? 'badge-available' : 'badge-unavailable'}>
                              {selected.availability ? 'Available Now' : 'Currently Busy'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Description */}
                    <div className="col-12">
                      <h6 style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>About</h6>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{selected.description}</p>
                    </div>
                    {/* Skills */}
                    {selected.skills?.length > 0 && (
                      <div className="col-12">
                        <h6 style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Skills &amp; Expertise</h6>
                        <div>
                          {selected.skills.map((s, i) => <span key={i} className="skill-pill">{s}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <a href={`tel:${selected.phone}`} className="btn btn-primary-gradient" onClick={e => e.stopPropagation()}>
                    <i className="bi bi-telephone-fill me-2"></i>Call Now
                  </a>
                  <button type="button" className="btn btn-outline-glass" data-bs-dismiss="modal">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDirectory;
