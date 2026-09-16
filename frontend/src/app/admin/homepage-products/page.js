"use client";

import Image from 'next/image';
import { getImageUrl } from '../../../utils/imageConfig';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts } from '../../../store/adminSlice';
import { Save, AlertCircle, Download } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../utils/axiosConfig';

export default function HomepageProductsPage() {
  const dispatch = useDispatch();
  const { products, productsLoading } = useSelector((state) => state.admin);
  const { showAlert, showConfirm } = useNotification();
  
  const [topSellingSource, setTopSellingSource] = useState('automatic');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [customSections, setCustomSections] = useState([]);
  const [creatingSection, setCreatingSection] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  
  const [selections, setSelections] = useState({
    showOnHomepage: {},
    newArrival: {},
    isFeatured: {},
    manualTopSelling: {}
  });

  const [saving, setSaving] = useState({
    showOnHomepage: false,
    newArrival: false,
    isFeatured: false,
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
        isFeatured: {},
        manualTopSelling: {}
      };
      products.forEach(p => {
        initialSelections.showOnHomepage[p._id] = p.showOnHomepage || false;
        initialSelections.newArrival[p._id] = p.newArrival || false;
        initialSelections.isFeatured[p._id] = p.isFeatured || false;
        initialSelections.manualTopSelling[p._id] = p.manualTopSelling || false;
      });
      setSelections(initialSelections);
    }
  }, [products]);

  const fetchCustomSections = async () => {
    try {
      const res = await api.get('/custom-sections');
      if (res.data.success) {
        setCustomSections(res.data.sections);
        const newSelections = { ...selections };
        res.data.sections.forEach(section => {
          newSelections[`custom_${section._id}`] = {};
          section.products.forEach(p => {
            newSelections[`custom_${section._id}`][p._id || p] = true;
          });
        });
        setSelections(newSelections);
      }
    } catch (err) {
      console.error("Failed to load custom sections", err);
    }
  };

  useEffect(() => {
    dispatch(fetchAdminProducts({ limit: 1000 })); // Fetch a large limit to get all for assignment
    fetchCustomSections();
    // Fetch settings
    api.get('/auth/settings')
      .then(res => {
        if (res.data.success && res.data.settings) {
          setTopSellingSource(res.data.settings.topSellingSource || 'automatic');
        }
      })
      .catch(err => console.error("Failed to load settings:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) {
      showAlert("Please enter a section title", "error");
      return;
    }
    setCreatingSection(true);
    try {
      const res = await api.post('/custom-sections', { title: newSectionTitle.trim() });
      if (res.data.success) {
        showAlert("Section created successfully!", "success");
        setNewSectionTitle('');
        setShowCreateForm(false);
        fetchCustomSections();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to create section", "error");
    } finally {
      setCreatingSection(false);
    }
  };

  const handleDeleteSection = async (id) => {
    const isConfirmed = await showConfirm("Are you sure you want to permanently delete this custom section? The products will remain in the database.");
    if (!isConfirmed) return;
    try {
      const res = await api.delete(`/custom-sections/${id}`);
      if (res.data.success) {
        showAlert("Section deleted", "success");
        setActiveTab('showOnHomepage');
        fetchCustomSections();
      }
    } catch (err) {
      showAlert("Failed to delete section", "error");
    }
  };

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
      const productIds = Object.keys(selections[flag] || {}).filter(id => selections[flag][id]);

      let res;
      if (flag.startsWith('custom_')) {
        const sectionId = flag.split('_')[1];
        res = await api.put(`/custom-sections/${sectionId}`, { productIds });
      } else {
        res = await api.put('/products/homepage/bulk-flags', { 
          flag, 
          productIds 
        });
      }
      
      if (res.data.success) {
        showAlert(`Successfully updated ${flag.startsWith('custom_') ? 'custom section' : flag} assignments!`, "success");
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

  const exportToExcel = () => {
    const csvRows = [];
    const headers = ['Product ID', 'Product Name', 'Category', 'Price', 'Status', 'Show On Homepage', 'New Arrival', 'Trending Now', 'Manual Top Selling'];
    csvRows.push(headers.join(','));

    filteredProducts.forEach(prod => {
      const row = [
        prod._id,
        `"${prod.name.replace(/"/g, '""')}"`,
        `"${prod.category}"`,
        prod.price,
        prod.isActive ? 'Active' : 'Inactive',
        selections.showOnHomepage[prod._id] ? 'Yes' : 'No',
        selections.newArrival[prod._id] ? 'Yes' : 'No',
        selections.isFeatured[prod._id] ? 'Yes' : 'No',
        selections.manualTopSelling[prod._id] ? 'Yes' : 'No'
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'homepage_products_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
                    src={getImageUrl(product.images?.[0])} 
                    alt={product.name || 'product'} 
                    width={40} height={40} 
                    className="rounded" 
                    style={{ objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
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
        <button onClick={exportToExcel} className="btn btn-success d-flex align-items-center gap-2 btn-sm fw-medium px-3 py-2">
          <Download size={16} /> Export to Excel
        </button>
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
                className={`nav-link fw-medium border-0 ${activeTab === 'isFeatured' ? 'text-brand border-bottom border-brand border-3' : 'text-muted'}`}
                onClick={() => setActiveTab('isFeatured')}
                style={{ backgroundColor: 'transparent' }}
              >
                Trending Now
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
            {customSections.map(section => (
              <li className="nav-item" key={section._id}>
                <button 
                  className={`nav-link fw-medium border-0 ${activeTab === `custom_${section._id}` ? 'text-brand border-bottom border-brand border-3' : 'text-muted'}`}
                  onClick={() => setActiveTab(`custom_${section._id}`)}
                  style={{ backgroundColor: 'transparent' }}
                >
                  {section.title}
                </button>
              </li>
            ))}
            <li className="nav-item ms-auto position-relative">
              <button 
                className="btn btn-sm btn-outline-brand mt-1"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                + Create New Section
              </button>
              
              {showCreateForm && (
                <div 
                  className="position-absolute bg-white rounded-3 shadow-lg border p-3" 
                  style={{ top: '100%', right: 0, width: '300px', zIndex: 10, marginTop: '8px', animation: 'fadeIn 0.2s ease-out' }}
                >
                  <label className="form-label fs-7 fw-bold mb-1">Section Title</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm mb-3" 
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateSection()}
                  />
                  <div className="d-flex gap-2 justify-content-end">
                    <button 
                      className="btn btn-sm btn-light" 
                      onClick={() => setShowCreateForm(false)}
                      disabled={creatingSection}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-sm btn-brand" 
                      onClick={handleCreateSection}
                      disabled={creatingSection}
                    >
                      {creatingSection ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              )}
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

              {activeTab === 'isFeatured' && (
                <div className="animate-fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">Trending Now</h5>
                      <p className="text-muted fs-7 mb-0">Select products to highlight in the Trending Now carousel under the banner.</p>
                    </div>
                    <button className="btn btn-brand d-flex align-items-center gap-2" onClick={() => handleSaveFlag('isFeatured')} disabled={saving.isFeatured}>
                      <Save size={16} /> {saving.isFeatured ? 'Saving...' : 'Save Assignments'}
                    </button>
                  </div>
                  {renderProductList('isFeatured')}
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

              {customSections.map(section => {
                const flag = `custom_${section._id}`;
                return activeTab === flag && (
                  <div className="animate-fade-in" key={section._id}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">{section.title}</h5>
                        <p className="text-muted fs-7 mb-0">Select products to highlight in this custom homepage section.</p>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-danger btn-sm px-3" onClick={() => handleDeleteSection(section._id)}>
                          Delete Section
                        </button>
                        <button className="btn btn-brand d-flex align-items-center gap-2" onClick={() => handleSaveFlag(flag)} disabled={saving[flag]}>
                          <Save size={16} /> {saving[flag] ? 'Saving...' : 'Save Assignments'}
                        </button>
                      </div>
                    </div>
                    {renderProductList(flag)}
                  </div>
                );
              })}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
