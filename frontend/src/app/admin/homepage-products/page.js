"use client";

import Image from 'next/image';


import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts } from '../../../store/adminSlice';
import { Save, AlertCircle } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../utils/axiosConfig';

export default function HomepageProductsPage() {
  const dispatch = useDispatch();
  const { products, productsLoading } = useSelector((state) => state.admin);
  const { showAlert } = useNotification();
  
  const [topSellingSource, setTopSellingSource] = useState('automatic');
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  const [selections, setSelections] = useState({
    showOnHomepage: {},
    newArrival: {},
    manualTopSelling: {}
  });

  const [saving, setSaving] = useState({
    showOnHomepage: false,
    newArrival: false,
    manualTopSelling: false
  });

  const [activeTab, setActiveTab] = useState('showOnHomepage');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Derive unique categories from products for the filter dropdown
  const categories = products ? [...new Set(products.map(p => p.category).filter(Boolean))] : [];

  // Initialize selections when products are loaded
  useEffect(() => {
    if (products && products.length > 0) {
      const initialSelections = {
        showOnHomepage: {},
        newArrival: {},
        manualTopSelling: {}
      };
      products.forEach(p => {
        initialSelections.showOnHomepage[p._id] = p.showOnHomepage || false;
        initialSelections.newArrival[p._id] = p.newArrival || false;
        initialSelections.manualTopSelling[p._id] = p.manualTopSelling || false;
      });
      setSelections(initialSelections);
    }
  }, [products]);

  useEffect(() => {
    dispatch(fetchAdminProducts({ limit: 1000 })); // Fetch a large limit to get all for assignment
    
    // Fetch settings
    api.get('/auth/settings')
      .then(res => {
        if (res.data.success && res.data.settings) {
          setTopSellingSource(res.data.settings.topSellingSource || 'automatic');
        }
      })
      .catch(err => console.error("Failed to load settings:", err));
  }, [dispatch]);

  const handleCheckboxChange = (flag, productId, checked) => {
    setSelections(prev => ({
      ...prev,
      [flag]: {
        ...prev[flag],
        [productId]: checked
      }
    }));
  };



  const handleSaveSetting = async () => {
    setSettingsLoading(true);
    try {
      const res = await api.put('/auth/settings', { 
        settings: { topSellingSource } 
      });
      if (res.data.success) {
        showAlert("Settings saved successfully!", "success");
      } else {
        showAlert("Failed to save settings.", "error");
      }
    } catch (error) {
      showAlert("Error saving settings.", "error");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveFlag = async (flag) => {
    setSaving(prev => ({ ...prev, [flag]: true }));
    try {
      // Collect IDs that are checked true
      const productIds = Object.keys(selections[flag]).filter(id => selections[flag][id]);

      const res = await api.put('/products/homepage/bulk-flags', { 
        flag, 
        productIds 
      });
      
      if (res.data.success) {
        showAlert(`Successfully updated ${flag} assignments!`, "success");
      } else {
        showAlert(`Failed to update ${flag}: ${res.data.message}`, "error");
      }
    } catch (error) {
      showAlert(`Error updating ${flag}.`, "error");
    } finally {
      setSaving(prev => ({ ...prev, [flag]: false }));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const renderProductList = (flag) => {
    return (
      <div className="table-responsive mt-3">
        <table className="table table-borderless align-middle m-0 fs-7">
          <thead>
            <tr className="border-bottom text-muted">
              <th style={{ width: '60px' }}>Select</th>
              <th style={{ width: '80px' }}>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product._id} className="border-bottom" style={{ opacity: product.isActive ? 1 : 0.6 }}>
                  <td>
                    <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={selections[flag]?.[product._id] || false}
                      onChange={(e) => handleCheckboxChange(flag, product._id, e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </div>
                </td>
                <td>
                  <Image 
                    src={product.images[0] || 'https://via.placeholder.com/50'} 
                    alt="product" 
                    width={40} height={40} 
                    className="rounded" 
                    style={{ objectFit: 'cover' }} 
                  />
                </td>
                <td>
                  <span className="fw-medium">{product.name}</span>
                  {!product.isActive && <span className="badge bg-danger ms-2">Inactive</span>}
                </td>
                <td>{product.category}</td>
                <td>₹{product.price}</td>
                <td>
                  {selections[flag]?.[product._id] ? (
                    <span className="badge bg-success bg-opacity-25 text-success">Selected</span>
                  ) : (
                    <span className="badge bg-secondary bg-opacity-25 text-secondary">Unselected</span>
                  )}
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">No products found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="animate-fade-in position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0 text-dark">Homepage Products Configuration</h4>
      </div>

      {/* Global Setting */}
      <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
          <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            Global Settings
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="fw-medium mb-1 fs-7">Top Selling Products Source</label>
              <select className="form-select" value={topSellingSource} onChange={(e) => setTopSellingSource(e.target.value)}>
                <option value="automatic">Automatic (Determined by Total Sales Volume)</option>
                <option value="manual">Manual (Admin selected below)</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-brand" onClick={handleSaveSetting} disabled={settingsLoading}>
                {settingsLoading ? 'Saving...' : 'Save Global Setting'}
              </button>
            </div>
          </div>
          {topSellingSource === 'automatic' && (
            <div className="alert alert-info d-flex align-items-center gap-2 mb-0 mt-3 py-2 fs-7 border-0">
              <AlertCircle size={16} /> 
              Currently, Top Selling products are fetched automatically based on completed order sales. Manual assignments below will be ignored.
            </div>
          )}
        </div>
      </div>

      {/* Assignment Tabs */}
      <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
        <div className="card-header bg-white border-bottom pt-3 pb-0">
          <ul className="nav nav-tabs border-bottom-0">
            <li className="nav-item">
              <button 
                className={`nav-link fw-medium border-0 ${activeTab === 'showOnHomepage' ? 'text-brand border-bottom border-brand border-3' : 'text-muted'}`}
                onClick={() => setActiveTab('showOnHomepage')}
                style={{ backgroundColor: 'transparent' }}
              >
                Show on Homepage
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-medium border-0 ${activeTab === 'newArrival' ? 'text-brand border-bottom border-brand border-3' : 'text-muted'}`}
                onClick={() => setActiveTab('newArrival')}
                style={{ backgroundColor: 'transparent' }}
              >
                New Arrivals
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-medium border-0 ${activeTab === 'manualTopSelling' ? 'text-brand border-bottom border-brand border-3' : 'text-muted'}`}
                onClick={() => setActiveTab('manualTopSelling')}
                style={{ backgroundColor: 'transparent' }}
              >
                Top Selling (Manual)
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-4">
          
          {productsLoading ? (
            <div className="text-center py-5 text-muted">Loading products...</div>
          ) : (
            <>
              {/* Search & Filter Bar */}
              <div className="row g-3 mb-4 bg-light p-3 rounded-3">
                <div className="col-md-6">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search products by name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <select 
                    className="form-select" 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {activeTab === 'showOnHomepage' && (
                <div className="animate-fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">Show on Homepage</h5>
                      <p className="text-muted fs-7 mb-0">Select products that are allowed to be displayed on the homepage globally.</p>
                    </div>
                    <button className="btn btn-brand d-flex align-items-center gap-2" onClick={() => handleSaveFlag('showOnHomepage')} disabled={saving.showOnHomepage}>
                      <Save size={16} /> {saving.showOnHomepage ? 'Saving...' : 'Save Assignments'}
                    </button>
                  </div>
                  {renderProductList('showOnHomepage')}
                </div>
              )}

              {activeTab === 'newArrival' && (
                <div className="animate-fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">New Arrivals</h5>
                      <p className="text-muted fs-7 mb-0">Select products to highlight in the New Arrivals carousel.</p>
                    </div>
                    <button className="btn btn-brand d-flex align-items-center gap-2" onClick={() => handleSaveFlag('newArrival')} disabled={saving.newArrival}>
                      <Save size={16} /> {saving.newArrival ? 'Saving...' : 'Save Assignments'}
                    </button>
                  </div>
                  {renderProductList('newArrival')}
                </div>
              )}

              {activeTab === 'manualTopSelling' && (
                <div className="animate-fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">Top Selling (Manual)</h5>
                      <p className="text-muted fs-7 mb-0">Select products to highlight in the Top Selling carousel when "Manual" mode is enabled.</p>
                    </div>
                    <button className="btn btn-brand d-flex align-items-center gap-2" onClick={() => handleSaveFlag('manualTopSelling')} disabled={saving.manualTopSelling}>
                      <Save size={16} /> {saving.manualTopSelling ? 'Saving...' : 'Save Assignments'}
                    </button>
                  </div>
                  {renderProductList('manualTopSelling')}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
