"use client";
import { useRouter } from 'next/navigation';




import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addAddress, deleteAddress, updateAddress, updateUserProfile } from '@/store/authSlice';

import { User, MapPin, Trash2, Edit2, Mail, Phone, Plus } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, loading } = useSelector((state) => state.auth);
  const { showConfirm } = useNotification();

  // Profile states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [password, setPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [addressError, setAddressError] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!user) {
      router.push('/login?redirect=user/profile');
    } else {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAlternatePhone(user.alternatePhone || '');
    }
  }, [user, loading, mounted, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileSuccess('');
    dispatch(updateUserProfile({ name, phone, alternatePhone, password: password || undefined }))
      .unwrap()
      .then(() => {
        setProfileSuccess('Profile details updated successfully!');
        setPassword('');
      });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !pincode || !locality || !address || !city || !stateName) {
      setAddressError('Please fill out all required address fields');
      return;
    }
    setAddressError('');
    const addressData = { 
      name: addrName, phone: addrPhone, pincode, locality, address, 
      city, state: stateName, landmark, alternatePhone: altPhone, addressType 
    };

    if (editingAddressId) {
      dispatch(updateAddress({ addressId: editingAddressId, addressData }))
        .unwrap()
        .then(() => {
          resetAddressForm();
        });
    } else {
      dispatch(addAddress(addressData))
        .unwrap()
        .then(() => {
          resetAddressForm();
        });
    }
  };

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddrName(''); setAddrPhone(''); setPincode(''); setLocality('');
    setAddress(''); setCity(''); setStateName(''); setLandmark(''); setAltPhone('');
    setAddressType('Home');
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddrName(addr.name || '');
    setAddrPhone(addr.phone || '');
    setPincode(addr.pincode || '');
    setLocality(addr.locality || '');
    setAddress(addr.address || '');
    setCity(addr.city || '');
    setStateName(addr.state || '');
    setLandmark(addr.landmark || '');
    setAltPhone(addr.alternatePhone || '');
    setAddressType(addr.addressType || 'Home');
    setShowAddressForm(true);
  };

  const handleAddressDelete = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this address?');
    if (confirmed) {
      dispatch(deleteAddress(id));
    }
  };

  return (
    <div className="container py-5 animate-fade-in">
      <h1 className="fw-bold mb-4 display-font">My Account</h1>

      <div className="row g-4">
        
        {/* Detail Editor */}
        <div className="col-lg-5">
          <div className="bg-white p-4 rounded-4 shadow-sm border">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <User size={20} color="var(--primary-color)" /> Profile Details
            </h5>

            <form onSubmit={handleProfileSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="fw-medium mb-1 fs-7">Email Address</label>
                <div className="position-relative">
                  <input
                    type="email"
                    disabled
                    className="form-control form-control-brand ps-5 bg-light"
                    value={user.email}
                  />
                  <Mail className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
                </div>
                <small className="text-muted d-block mt-1 fs-8">Registered Account Email cannot be edited.</small>
              </div>

              <div>
                <label className="fw-medium mb-1 fs-7">Full Name</label>
                <div className="position-relative">
                  <input
                    type="text"
                    required
                    className="form-control form-control-brand ps-5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
                </div>
              </div>

              <div>
                <label className="fw-medium mb-1 fs-7">Phone Number</label>
                <div className="position-relative">
                  <input
                    type="tel"
                    className="form-control form-control-brand ps-5"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
                </div>
              </div>

              <div>
                <label className="fw-medium mb-1 fs-7">Alternate Phone</label>
                <div className="position-relative">
                  <input
                    type="tel"
                    className="form-control form-control-brand ps-5"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                  />
                  <Phone className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
                </div>
              </div>

              <div>
                <label className="fw-medium mb-1 fs-7">Reset Password</label>
                <input
                  type="password"
                  className="form-control form-control-brand"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {profileSuccess && <div className="alert alert-success p-2 fs-8 m-0">{profileSuccess}</div>}

              <button type="submit" className="btn btn-brand py-2 mt-2">Update Details</button>
            </form>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="col-lg-7">
          <div className="bg-white p-4 rounded-4 shadow-sm border h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                <MapPin size={20} color="var(--primary-color)" /> Shipping Addresses
              </h5>
              {!showAddressForm && (
                <button 
                  onClick={() => {
                    resetAddressForm();
                    setShowAddressForm(true);
                  }} 
                  className="btn btn-brand-outline btn-sm d-flex align-items-center gap-1"
                >
                  <Plus size={16} /> Add Address
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} className="bg-light p-3 rounded mb-4 border">
                <h6 className="fw-bold mb-3">{editingAddressId ? 'Edit Address' : 'Add a new address'}</h6>
                
                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Full Name*</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Phone Number*</label>
                    <input
                      type="tel"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Pincode*</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Locality / Area*</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label mb-1 fs-7 fw-semibold">Street Address / House No.*</label>
                  <textarea
                    required
                    className="form-control form-control-brand py-2 fs-7"
                    rows="2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">City / District*</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">State*</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Landmark (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-brand py-2 fs-7"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Alternate Phone (Optional)</label>
                    <input
                      type="tel"
                      className="form-control form-control-brand py-2 fs-7"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3 d-flex gap-3 align-items-center">
                  <span className="fs-7 fw-medium text-muted">Address Type</span>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="addressType" id="homeType" value="Home" checked={addressType === 'Home'} onChange={(e) => setAddressType(e.target.value)} />
                    <label className="form-check-label fs-7" htmlFor="homeType">Home</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="addressType" id="workType" value="Work" checked={addressType === 'Work'} onChange={(e) => setAddressType(e.target.value)} />
                    <label className="form-check-label fs-7" htmlFor="workType">Work</label>
                  </div>
                </div>

                {addressError && <div className="alert alert-danger p-2 fs-8 mb-2">{addressError}</div>}
                
                <div className="d-flex gap-2 mt-2">
                  <button type="submit" className="btn btn-brand btn-sm py-2 px-4">{editingAddressId ? 'Update' : 'Save'}</button>
                  <button type="button" onClick={resetAddressForm} className="btn btn-light btn-sm py-2 px-4 border">Cancel</button>
                </div>
              </form>
            )}

            {user.addresses.length === 0 ? (
              <p className="text-muted m-0 fs-7">No saved shipping addresses found. Add one to speed up checkouts.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {user.addresses && user.addresses.map((addr) => (
                  <div key={addr._id} className="border rounded p-3 position-relative">
                    <span className="badge bg-light text-dark border position-absolute top-0 end-0 m-3 fs-8 px-2 py-1">{addr.addressType || 'Home'}</span>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center gap-3 mb-1">
                          <span className="fw-bold fs-6 text-dark">{addr.name || user.name}</span>
                          {(addr.phone || user.phone) && <span className="fw-bold fs-6 text-dark">{addr.phone || user.phone}</span>}
                        </div>
                        <p className="text-muted m-0 fs-7 lh-sm">
                          {addr.address || addr.street}
                          {addr.locality ? `, ${addr.locality}` : ''}<br />
                          {addr.city}, {addr.state} - <span className="fw-medium text-dark">{addr.pincode || addr.zipCode}</span>
                        </p>
                      </div>
                      <div className="d-flex align-items-center mt-auto">
                        <button 
                          onClick={() => handleEditAddress(addr)}
                          className="btn btn-link text-primary p-0 me-3"
                          title="Edit Address"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleAddressDelete(addr._id)}
                          className="btn btn-link text-danger p-0"
                          title="Delete Address"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!user.addresses || user.addresses.length === 0) && (
                  <p className="text-muted fs-7">No saved addresses found.</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
