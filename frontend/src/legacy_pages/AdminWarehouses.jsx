"use client";



import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '@/store/adminSlice';
import { Plus, Edit2, Trash2, MapPin, Phone } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function AdminWarehouses() {
  const dispatch = useDispatch();
  const { warehouses, loading } = useSelector((state) => state.admin);
  const { showConfirm } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
      name: '',
      delhiveryPickupLocationName: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contactPhone: '',
      contactPersonName: '',
      email: '',
      returnSameAsPickup: true,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      returnAddressLine: '',
      returnCity: '',
      returnState: '',
      returnPincode: '',
      isActive: true
  });

  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);

  const handleOpenModal = (warehouse = null) => {
    if (warehouse) {
      setEditingId(warehouse._id);
      setFormData({
        name: warehouse.name,
        delhiveryPickupLocationName: warehouse.delhiveryPickupLocationName,
        address: warehouse.address,
        city: warehouse.city,
        state: warehouse.state,
        pincode: warehouse.pincode,
        contactPhone: warehouse.contactPhone,
        contactPersonName: warehouse.contactPersonName || '',
        email: warehouse.email || '',
        returnSameAsPickup: warehouse.returnSameAsPickup !== undefined ? warehouse.returnSameAsPickup : true,
        workingDays: warehouse.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        returnAddressLine: warehouse.returnAddressLine || '',
        returnCity: warehouse.returnCity || '',
        returnState: warehouse.returnState || '',
        returnPincode: warehouse.returnPincode || '',
        isActive: warehouse.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        delhiveryPickupLocationName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        contactPhone: '',
        contactPersonName: '',
        email: '',
        returnSameAsPickup: true,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        returnAddressLine: '',
        returnCity: '',
        returnState: '',
        returnPincode: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateWarehouse({ id: editingId, warehouseData: formData })).then(() => handleCloseModal());
    } else {
      dispatch(createWarehouse(formData)).then(() => handleCloseModal());
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this warehouse?');
    if (confirmed) {
      dispatch(deleteWarehouse(id));
    }
  };

  return (
    <>
      <div className="container-fluid p-4 animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0 text-dark">Warehouses</h2>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add Warehouse
          </button>
        </div>

        {loading && <p>Loading warehouses...</p>}

        <div className="row g-4">
          {!loading && warehouses.length === 0 && (
            <div className="col-12 text-center py-5 bg-white rounded shadow-sm">
              <MapPin size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No warehouses found</h5>
              <p className="text-muted mb-0">Create your first warehouse to enable dynamic shipping.</p>
            </div>
          )}
          {warehouses.map(w => (
            <div key={w._id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold mb-0">{w.name}</h5>
                    <span className={`badge ${w.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {w.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-muted fs-7 mb-1 text-uppercase fw-bold">Delhivery Pickup Name</p>
                    <p className="font-monospace fw-bold m-0">{w.delhiveryPickupLocationName}</p>
                  </div>
                  <hr />
                  <div className="d-flex flex-column gap-2 text-muted fs-7 mb-4">
                    <div className="d-flex gap-2">
                      <MapPin size={16} /> 
                      <span>{w.address}, {w.city}, {w.state} - {w.pincode}</span>
                    </div>
                    <div className="d-flex gap-2">
                      <Phone size={16} /> 
                      <span>{w.contactPhone}</span>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2 mt-auto">
                    <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => handleOpenModal(w)}>
                      <Edit2 size={14} className="me-1" /> Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(w._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      {showModal && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">{editingId ? 'Edit Warehouse' : 'Add Warehouse'}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-bold fs-7">Warehouse Name</label>
                      <input type="text" className="form-control" required 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold fs-7">Delhivery Pickup Location Name</label>
                      <input type="text" className="form-control font-monospace" required 
                        value={formData.delhiveryPickupLocationName} onChange={e => setFormData({...formData, delhiveryPickupLocationName: e.target.value})} />
                      <div className="form-text">Must exactly match the registered pickup location name in your Delhivery Dashboard.</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 mb-3">
                        <label className="form-label fw-bold fs-7">Address</label>
                        <input type="text" className="form-control" required 
                          value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold fs-7">City</label>
                        <input type="text" className="form-control" required 
                          value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold fs-7">State</label>
                        <input type="text" className="form-control" required 
                          value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold fs-7">Pincode</label>
                        <input type="text" className="form-control" required 
                          value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold fs-7">Contact Phone</label>
                        <input type="text" className="form-control" required 
                          value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold fs-7">Contact Person Name</label>
                        <input type="text" className="form-control" 
                          value={formData.contactPersonName || ''} onChange={e => setFormData({...formData, contactPersonName: e.target.value})} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold fs-7">Email</label>
                        <input type="email" className="form-control" 
                          value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold fs-7">Working Days</label>
                      <div className="d-flex flex-wrap gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <div key={day} className="form-check form-check-inline m-0">
                            <input 
                              className="form-check-input cursor-pointer" 
                              type="checkbox" 
                              id={`day-${day}`}
                              checked={formData.workingDays.includes(day)}
                              onChange={(e) => {
                                const newDays = e.target.checked 
                                  ? [...formData.workingDays, day]
                                  : formData.workingDays.filter(d => d !== day);
                                setFormData({...formData, workingDays: newDays});
                              }}
                            />
                            <label className="form-check-label fs-7 cursor-pointer" htmlFor={`day-${day}`}>{day}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="form-check mb-3">
                      <input className="form-check-input shadow-none cursor-pointer" type="checkbox" id="returnSameAsPickup"
                        checked={formData.returnSameAsPickup} onChange={e => setFormData({...formData, returnSameAsPickup: e.target.checked})} />
                      <label className="form-check-label fw-bold fs-7 cursor-pointer text-muted" htmlFor="returnSameAsPickup">Return address is the same as the pickup address</label>
                    </div>

                    {!formData.returnSameAsPickup && (
                      <div className="row mb-3 p-3 bg-light rounded border mx-0">
                        <div className="col-12 mb-2"><h6 className="fw-bold mb-0">Return Details</h6></div>
                        <div className="col-12 mb-3">
                          <label className="form-label fw-bold fs-7">Address Line</label>
                          <input type="text" className="form-control" required={!formData.returnSameAsPickup}
                            value={formData.returnAddressLine} onChange={e => setFormData({...formData, returnAddressLine: e.target.value})} />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label fw-bold fs-7">Pincode</label>
                          <input type="text" className="form-control" required={!formData.returnSameAsPickup}
                            value={formData.returnPincode} onChange={e => setFormData({...formData, returnPincode: e.target.value})} />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label fw-bold fs-7">City</label>
                          <input type="text" className="form-control" required={!formData.returnSameAsPickup}
                            value={formData.returnCity} onChange={e => setFormData({...formData, returnCity: e.target.value})} />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label fw-bold fs-7">State</label>
                          <input type="text" className="form-control" required={!formData.returnSameAsPickup}
                            value={formData.returnState} onChange={e => setFormData({...formData, returnState: e.target.value})} />
                        </div>
                      </div>
                    )}
                    <div className="form-check form-switch mb-4">
                      <input className="form-check-input" type="checkbox" role="switch" id="isActiveSwitch"
                        checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                      <label className="form-check-label fw-bold fs-7" htmlFor="isActiveSwitch">Active</label>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2">
                      {editingId ? 'Update Warehouse' : 'Save Warehouse'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
      </div>
    </>
  );
}

// Trigger refresh
