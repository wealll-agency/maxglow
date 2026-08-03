"use client";

import Image from 'next/image';


import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, addProduct, editProduct, removeProduct, toggleProductState, fetchWarehouses, fetchCategories, createCategory, addSubCategory, removeCategory, removeSubCategory } from '../../../store/adminSlice';
import { Plus, Edit, Trash2, X, Eye, Download, Search, LayoutGrid } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';

export default function AdminProductsPage() {
  const dispatch = useDispatch();
  
  const { products, productsLoading, warehouses, categories } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const { showAlert, showConfirm } = useNotification();

  // Form toggles
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState('');

  // Filters state
  const [filterBrand, setFilterBrand] = useState('All Brands');
  const [filterCategory, setFilterCategory] = useState('Select category');
  const [filterSubCategory, setFilterSubCategory] = useState('Select Sub Category');
  const [filterSubSubCategory, setFilterSubSubCategory] = useState('Select Sub Sub Category');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showLimitedStockOnly, setShowLimitedStockOnly] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [viewingBarcode, setViewingBarcode] = useState(null);

  // Category Management States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Skin Care');
  const [subCategory, setSubCategory] = useState('');
  const [subSubCategory, setSubSubCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [productType, setProductType] = useState('Physical');
  const [warehouse, setWarehouse] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('kg');
  const [unitValue, setUnitValue] = useState('');
  const [searchTags, setSearchTags] = useState('');
  const [packSizes, setPackSizes] = useState([]); // [{ weight: 250, unit: 'g', price: 200 }]
  
  const [price, setPrice] = useState(''); // Represents MRP (Unit Price)
  const [purchasePrice, setPurchasePrice] = useState('0'); // Represents Cost Price
  const [calculatedSellingPrice, setCalculatedSellingPrice] = useState('0');
  const [minOrderQty, setMinOrderQty] = useState('1');
  const [discount, setDiscount] = useState('0'); // Represents Discount Amount
  const [discountType, setDiscountType] = useState('Flat');
  const [taxAmount, setTaxAmount] = useState('0');
  const [taxCalculation, setTaxCalculation] = useState('Include with product');
  const [shippingCost, setShippingCost] = useState('0');
  const [shippingMultiplyWithQty, setShippingMultiplyWithQty] = useState(false);
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [benefits, setBenefits] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  
  const [subImageFiles, setSubImageFiles] = useState([null, null, null]);
  const [subImagePreviews, setSubImagePreviews] = useState(['', '', '']);
  
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [showInReels, setShowInReels] = useState(false);

  useEffect(() => {
    const mrp = parseFloat(price) || 0;
    const disc = parseFloat(discount) || 0;
    let computedPrice = mrp;

    if (disc > 0) {
      if (discountType === 'Percent') {
        computedPrice = mrp * (1 - disc / 100);
      } else {
        computedPrice = mrp - disc;
      }
    }

    computedPrice = Math.max(0, computedPrice);
    setCalculatedSellingPrice(Math.round(computedPrice).toString());
  }, [price, discount, discountType]);

  const loadProducts = () => {
    dispatch(fetchAdminProducts({
      brand: filterBrand !== 'All Brands' ? filterBrand : '',
      category: filterCategory !== 'Select category' ? filterCategory : '',
      subCategory: filterSubCategory !== 'Select Sub Category' ? filterSubCategory : '',
      subSubCategory: filterSubSubCategory !== 'Select Sub Sub Category' ? filterSubSubCategory : '',
      keyword: searchKeyword
    }));
  };

  useEffect(() => {
    dispatch(fetchAdminProducts({}));
    dispatch(fetchWarehouses());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleToggle = (id, field, value) => {
    dispatch(toggleProductState({ id, field, value }));
  };

  const handleExport = () => {
    if (!products || products.length === 0) {
      showAlert("No products to export", "warning");
      return;
    }
    const headers = ['SL', 'Product Name', 'Category', 'Product Type', 'MRP Price', 'Selling Price', 'Stock', 'Featured', 'Active'];
    const csvRows = [headers.join(',')];
    
    products.forEach((p, index) => {
      const row = [
        index + 1,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.productType || 'Physical',
        p.purchasePrice || 0,
        p.price,
        p.stock,
        p.isFeatured || false,
        p.isActive !== false
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'maxglow_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setName('');
    setCategory('Skin Care');
    setSubCategory('');
    setSubSubCategory('');
    setBrand('');
    setProductType('Physical');
    setWarehouse('');
    setSku('');
    setUnit('kg');
    setUnitValue('');
    setSearchTags('');
    setPackSizes([]);
    setPrice('');
    setPurchasePrice('0');
    setMinOrderQty('1');
    setDiscount('0');
    setDiscountType('Flat');
    setTaxAmount('0');
    setTaxCalculation('Include with product');
    setShippingCost('0');
    setShippingMultiplyWithQty(false);
    setDescription('');
    setIngredients('');
    setBenefits('');
    setBatchNumber('');
    setExpiryDate('');
    setStock('');
    setImageFile(null);
    setImagePreviewUrl('');
    setSubImageFiles([null, null, null]);
    setSubImagePreviews(['', '', '']);
    setVideoFile(null);
    setVideoPreviewUrl('');
    setShowInReels(false);
    setEditMode(false);
    setEditId('');
    setShowForm(false);
  };

  const handleEditClick = (product) => {
    setEditId(product._id);
    setName(product.name);
    setCategory(product.category);
    setSubCategory(product.subCategory || '');
    setSubSubCategory(product.subSubCategory || '');
    setBrand(product.brand || '');
    setProductType(product.productType || 'Physical');
    setWarehouse(product.warehouse ? product.warehouse.toString() : '');
    setSku(product.sku || '');
    setUnit(product.unit || 'kg');
    setUnitValue(product.unitValue || '');
    setSearchTags(product.searchTags ? product.searchTags.join(', ') : '');
    setPackSizes(product.packSizes || []);
    setPrice(product.price.toString());
    setPurchasePrice(product.purchasePrice ? product.purchasePrice.toString() : '0');
    setMinOrderQty(product.minOrderQty ? product.minOrderQty.toString() : '1');
    setDiscount(product.discount.toString());
    setDiscountType(product.discountType || 'Flat');
    setTaxAmount(product.taxAmount ? product.taxAmount.toString() : '0');
    setTaxCalculation(product.taxCalculation || 'Include with product');
    setShippingCost(product.shippingCost ? product.shippingCost.toString() : '0');
    setShippingMultiplyWithQty(product.shippingMultiplyWithQty || false);
    setDescription(product.description);
    setIngredients(product.ingredients.join(', '));
    setBenefits(product.benefits.join(', '));
    setBatchNumber(product.batchNumber);
    setExpiryDate(product.expiryDate.split('T')[0]);
    setStock(product.stock.toString());
    setImagePreviewUrl(product.images[0] || '');
    setImageFile(null);
    
    // Set sub-image previews if they exist
    const previews = ['', '', ''];
    for(let i=1; i<=3; i++) {
      if(product.images[i]) previews[i-1] = product.images[i];
    }
    setSubImagePreviews(previews);
    setSubImageFiles([null, null, null]);
    
    setVideoPreviewUrl(product.videos && product.videos.length > 0 ? product.videos[0] : '');
    setVideoFile(null);
    setShowInReels(product.showInReels || false);
    
    setEditMode(true);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this product? Corresponding inventory records will be wiped.');
    if (confirmed) {
      dispatch(removeProduct(id));
    }
  };

  const handleAddCategorySubmit = async () => {
    if (!newCategoryName.trim()) return showAlert("Category name is required", "error");
    
    const exists = categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());
    if (exists) {
      return showAlert("This category is already added", "error");
    }

    try {
      await dispatch(createCategory({ name: newCategoryName.trim() })).unwrap();
      setNewCategoryName('');
      showAlert("Category added successfully!", "success");
    } catch (err) {
      showAlert(err || "Failed to add category", "error");
    }
  };

  const handleAddSubCategorySubmit = async () => {
    if (!parentCategoryId) return showAlert("Please select a parent category", "error");
    if (!newSubCategoryName.trim()) return showAlert("Sub-category name is required", "error");
    
    const parentCat = categories.find(c => c._id === parentCategoryId);
    if (parentCat && parentCat.subCategories.some(sub => sub.toLowerCase() === newSubCategoryName.trim().toLowerCase())) {
      return showAlert("This sub category is already added", "error");
    }

    try {
      await dispatch(addSubCategory({ categoryId: parentCategoryId, subCategoryData: { subCategory: newSubCategoryName.trim() } })).unwrap();
      setNewSubCategoryName('');
      showAlert("Sub-category added successfully!", "success");
    } catch (err) {
      showAlert(err || "Failed to add sub category", "error");
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmed = await showConfirm("Are you sure you want to delete this category?");
    if (confirmed) {
      try {
        await dispatch(removeCategory(id)).unwrap();
        showAlert("Category deleted successfully!", "success");
      } catch (err) {
        showAlert(err || "Failed to delete category", "error");
      }
    }
  };

  const handleDeleteSubCategory = async (categoryId, subCategoryName) => {
    const confirmed = await showConfirm("Are you sure you want to delete this sub-category?");
    if (confirmed) {
      try {
        await dispatch(removeSubCategory({ categoryId, subCategoryName })).unwrap();
        showAlert("Sub-category deleted successfully!", "success");
      } catch (err) {
        showAlert(err || "Failed to delete sub category", "error");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append('name', name);
    payload.append('category', category);
    payload.append('subCategory', subCategory);
    payload.append('subSubCategory', subSubCategory);
    payload.append('brand', brand);
    payload.append('productType', productType);
    if (warehouse) payload.append('warehouse', warehouse);
    payload.append('sku', sku);
    payload.append('unit', unit);
    payload.append('unitValue', unitValue);
    
    // Arrays need special handling in FormData or just stringified
    // Since backend expects an array, let's join them and let backend split, 
    // OR we can just pass them as strings if backend is handling them.
    // Looking at backend `createProduct`, it expects `ingredients`, `benefits` as array if JSON. 
    // Wait, since we are sending FormData, everything is a string.
    // The backend receives strings, so we need to ensure backend splits them if needed.
    // Currently backend: `const { ingredients } = req.body;` If it's a string, `ingredients || []` will be a string. 
    // Let's pass them exactly as the user typed, and we will update backend to parse if needed.
    payload.append('searchTags', searchTags);
    payload.append('price', price);
    payload.append('purchasePrice', purchasePrice);
    payload.append('minOrderQty', minOrderQty);
    payload.append('discount', discount);
    payload.append('discountType', discountType);
    payload.append('taxAmount', taxAmount);
    payload.append('taxCalculation', taxCalculation);
    payload.append('shippingCost', shippingCost);
    payload.append('shippingMultiplyWithQty', shippingMultiplyWithQty);
    payload.append('description', description);
    payload.append('ingredients', ingredients);
    payload.append('benefits', benefits);
    payload.append('batchNumber', batchNumber);
    payload.append('expiryDate', expiryDate);
    payload.append('stock', stock);
    payload.append('packSizes', JSON.stringify(packSizes));

    if (imageFile) {
      payload.append('image', imageFile);
    } else if (imagePreviewUrl) {
      payload.append('images', imagePreviewUrl);
    }
    
    // Sub-images
    subImageFiles.forEach((file, index) => {
      if (file) {
        payload.append('subImages', file);
      } else if (subImagePreviews[index]) {
        // If editing and no new file was chosen, keep the existing URL
        payload.append('images', subImagePreviews[index]);
      }
    });

    if (videoFile) {
      payload.append('video', videoFile);
    } else if (videoPreviewUrl) {
      payload.append('videos', videoPreviewUrl);
    }
    
    payload.append('showInReels', showInReels);

    if (editMode) {
      dispatch(editProduct({ id: editId, data: payload }))
        .unwrap()
        .then(() => {
          resetForm();
          showAlert("Product updated successfully!", "success");
        })
        .catch((err) => {
          showAlert("Failed to update product: " + err, "error");
        });
    } else {
      dispatch(addProduct(payload))
        .unwrap()
        .then(() => {
          resetForm();
          showAlert("Product added successfully!", "success");
        })
        .catch((err) => {
          showAlert("Failed to add product: " + err, "error");
        });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newFiles = [...subImageFiles];
      newFiles[index] = file;
      setSubImageFiles(newFiles);
      
      const newPreviews = [...subImagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setSubImagePreviews(newPreviews);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const generateSku = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSku(code);
  };
  const displayedProducts = showLimitedStockOnly ? products.filter(p => p.stock <= 10) : products;

  return (
    <div className="animate-fade-in position-relative">
      {/* View Product Modal */}
      {viewingProduct && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card shadow border-0 rounded-4" style={{ width: '400px' }}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
              <h5 className="fw-bold m-0">Product Details</h5>
              <button className="btn border-0 text-muted" onClick={() => setViewingProduct(null)}><X size={20} /></button>
            </div>
            <div className="card-body text-center">
              <Image src={viewingProduct.images[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200'} alt="product" className="img-fluid rounded mb-3" width={200} height={200} style={{ maxHeight: '200px', objectFit: 'cover' }} />
              <h5 className="fw-bold">{viewingProduct.name}</h5>
              <p className="text-muted mb-1">Category: {viewingProduct.category}</p>
              <p className="fw-semibold text-brand fs-5 mb-1">
                ₹{viewingProduct.discount > 0 ? (
                  viewingProduct.discountType === 'Percent' 
                    ? Math.round(viewingProduct.price * (1 - viewingProduct.discount / 100))
                    : Math.max(0, viewingProduct.price - viewingProduct.discount)
                ) : viewingProduct.price}
                {viewingProduct.discount > 0 && (
                  <span className="text-muted text-decoration-line-through fs-7 ms-2">₹{viewingProduct.price}</span>
                )}
              </p>
              <span className={`badge ${viewingProduct.stock > 0 ? 'bg-success' : 'bg-danger'}`}>{viewingProduct.stock} in stock</span>
              <p className="mt-3 fs-7 text-start text-muted">{viewingProduct.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* View Barcode Modal */}
      {viewingBarcode && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card shadow border-0 rounded-4" style={{ width: '350px' }}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
              <h5 className="fw-bold m-0">Product Barcode</h5>
              <button className="btn border-0 text-muted" onClick={() => setViewingBarcode(null)}><X size={20} /></button>
            </div>
            <div className="card-body text-center py-5">
              <div className="border p-3 d-inline-block rounded bg-light mb-3">
                <h1 className="display-4 fw-bold m-0 text-dark" style={{ letterSpacing: '8px', fontFamily: 'monospace' }}>
                  |||||||||
                </h1>
              </div>
              <h5 className="font-monospace fw-bold">{viewingBarcode.sku || viewingBarcode.batchNumber || 'NO-SKU'}</h5>
              <p className="text-muted">{viewingBarcode.name}</p>
            </div>
          </div>
        </div>
      )}
      {/* Filter Products Section */}
      {!showForm && (
        <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold m-0 text-dark">Filter Products</h6>
          </div>
          <div className="card-body">
            <div className="row g-3 align-items-end">
              {/* Brand filter removed */}
              <div className="col-md-3">
                <label className="fw-medium mb-1 fs-7">Category</label>
                <select className="form-select" value={filterCategory} onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setFilterSubCategory('Select Sub Category');
                }}>
                  <option value="Select category">Select category</option>
                  {categories && categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="fw-medium mb-1 fs-7">Sub Category</label>
                <select className="form-select" value={filterSubCategory} onChange={(e) => setFilterSubCategory(e.target.value)}>
                  <option value="Select Sub Category">Select Sub Category</option>
                  {categories && categories.find(c => c.name === filterCategory)?.subCategories.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="fw-medium mb-1 fs-7">Sub Sub Category</label>
                <select className="form-select" value={filterSubSubCategory} onChange={(e) => setFilterSubSubCategory(e.target.value)}>
                  <option value="Select Sub Sub Category">Select Sub Sub Category</option>
                </select>
              </div>
              
              <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                <button 
                  className="btn btn-brand-secondary"
                  onClick={() => {
                    setFilterBrand('All Brands');
                    setFilterCategory('Select category');
                    setFilterSubCategory('Select Sub Category');
                    setFilterSubSubCategory('Select Sub Sub Category');
                    setSearchKeyword('');
                    dispatch(fetchAdminProducts({})); // instantly reload all
                  }}
                >
                  Reset
                </button>
                <button className="btn btn-brand" onClick={loadProducts}>Show data</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Actions Bar */}
      {!showForm && (
        <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
          <div className="card-body p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex" style={{ width: '300px' }}>
              <input 
                type="text" 
                className="form-control rounded-end-0 border-end-0" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
              />
              <button className="btn btn-brand rounded-start-0 px-3" onClick={loadProducts}>
                Search
              </button>
            </div>
            <div className="d-flex gap-2">
              <button onClick={handleExport} className="btn btn-outline-brand d-flex align-items-center gap-2" style={{ borderColor: '#1c72b9', color: '#1c72b9' }}>
                <Download size={16} /> Export
              </button>
              <button onClick={() => setShowLimitedStockOnly(!showLimitedStockOnly)} className="btn d-flex align-items-center" style={{ backgroundColor: showLimitedStockOnly ? '#00b8b8' : '#00d2d3', color: '#fff', border: 'none' }}>
                Limited Sotcks {showLimitedStockOnly && '(Active)'}
              </button>
              <button onClick={() => setShowCategoryModal(true)} className="btn btn-outline-brand d-flex align-items-center gap-2">
                <Plus size={16} /> Add Category
              </button>
              <button onClick={() => setShowSubCategoryModal(true)} className="btn btn-outline-brand d-flex align-items-center gap-2">
                <Plus size={16} /> Add Sub Category
              </button>
              <button onClick={() => setShowForm(true)} className="btn btn-brand d-flex align-items-center gap-2">
                <Plus size={16} /> Add new product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product form panel */}
      {showForm && (
        <div className="mb-4 position-relative">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold m-0">{editMode ? 'Edit Product Details' : 'Add New Product'}</h4>
            <button onClick={resetForm} className="btn border-0 text-muted shadow-sm bg-white rounded-circle" style={{ width: '40px', height: '40px' }}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* General Setup Card */}
            <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                  <i className="fas fa-user-cog text-muted"></i> General setup
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-12">
                    <label className="fw-medium mb-1 fs-7">Product Name</label>
                    <input type="text" required className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="fw-medium mb-1 fs-7">Warehouse Link</label>
                    <select className="form-select" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                      <option value="">No Warehouse (Default)</option>
                      {warehouses && warehouses.map(w => (
                        <option key={w._id} value={w._id}>{w.name} ({w.delhiveryPickupLocationName})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-4">
                    <label className="fw-medium mb-1 fs-7">Category</label>
                    <select className="form-select" value={category} onChange={(e) => {
                      setCategory(e.target.value);
                      setSubCategory('');
                    }}>
                      <option value="">Select category</option>
                      {categories && categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="fw-medium mb-1 fs-7">Sub Category</label>
                    <select className="form-select" value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
                      <option value="">Select Sub Category</option>
                      {categories && categories.find(c => c.name === category)?.subCategories.map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="fw-medium mb-1 fs-7">Sub Sub Category</label>
                    <input type="text" className="form-control" value={subSubCategory} onChange={(e) => setSubSubCategory(e.target.value)} />
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex justify-content-between">
                      <label className="fw-medium mb-1 fs-7">Product SKU</label>
                      <a href="#" className="text-primary text-decoration-none fs-7" onClick={(e) => { e.preventDefault(); generateSku(); }}>Generate Code</a>
                    </div>
                    <input type="text" className="form-control" value={sku} onChange={(e) => setSku(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-medium mb-1 fs-7">Unit Quantity & Type</label>
                    <div className="input-group">
                      <input type="number" className="form-control" value={unitValue} onChange={(e) => setUnitValue(e.target.value)} />
                      <select className="form-select" style={{ maxWidth: '100px' }} value={unit} onChange={(e) => setUnit(e.target.value)}>
                        <option value="gm">gm</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                        <option value="pack">pack</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="fw-medium mb-1 fs-7">Product Tag (Badge on Card)</label>
                    <input type="text" className="form-control" value={searchTags} onChange={(e) => setSearchTags(e.target.value)} />
                  </div>

                  {/* Images */}
                  <div className="col-md-12">
                    <h6 className="fw-bold mb-3 mt-4 text-brand">Product Images</h6>
                    <div className="row g-3">
                      <div className="col-md-12 mb-3">
                        <label className="form-label text-muted fs-7 mb-1">Main Image</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          accept="image/*"
                          onChange={handleImageChange}
                          required={!editMode}
                        />
                        {imagePreviewUrl && (
                          <div className="mt-3">
                            <Image src={imagePreviewUrl} alt="Preview" className="img-thumbnail" width={100} height={100} style={{ height: '100px', objectFit: 'cover' }} />
                          </div>
                        )}
                      </div>
                      
                      {/* Optional Sub Images */}
                      {[0, 1, 2].map(index => (
                        <div className="col-md-4" key={`sub-image-${index}`}>
                          <label className="form-label text-muted fs-7 mb-1">Sub Image {index + 1} (Optional)</label>
                          <input 
                            type="file" 
                            className="form-control" 
                            accept="image/*"
                            onChange={(e) => handleSubImageChange(e, index)}
                          />
                          {subImagePreviews[index] && (
                            <div className="mt-3">
                              <Image src={subImagePreviews[index]} alt={`Sub Preview ${index + 1}`} className="img-thumbnail" width={80} height={80} style={{ height: '80px', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Video & Reels Section */}
                  <div className="col-md-12 mt-4">
                    <h6 className="fw-bold mb-3 text-brand">Product Video (Reels)</h6>
                    <div className="row g-3 align-items-center">
                      <div className="col-md-6">
                        <label className="form-label text-muted fs-7 mb-1">Video File (MP4/WebM) - Optional</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          accept="video/*"
                          onChange={handleVideoChange}
                        />
                        {videoPreviewUrl && (
                          <div className="mt-3">
                            <video src={videoPreviewUrl} className="img-thumbnail" width={100} height={100} style={{ height: '100px', objectFit: 'cover' }} controls muted />
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch d-flex align-items-center h-100 pt-3">
                          <label className="form-check-label fs-7 fw-medium mb-0 me-3">Show in Reels Section</label>
                          <input className="form-check-input cursor-pointer" type="checkbox" checked={showInReels} onChange={(e) => setShowInReels(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <label className="fw-medium mb-1 fs-7">Batch Number</label>
                    <input type="text" required className="form-control" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-medium mb-1 fs-7">Ingredients (Comma-separated)</label>
                    <input type="text" className="form-control" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-medium mb-1 fs-7">Benefits (Comma-separated)</label>
                    <input type="text" className="form-control" value={benefits} onChange={(e) => setBenefits(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="fw-medium mb-1 fs-7">Description</label>
                    <textarea rows="3" required className="form-control" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Pack Sizes & Prices Card */}
            <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                  <i className="fas fa-boxes text-muted"></i> Multi-Quantity Pack Sizes (Optional)
                </h6>
              </div>
              <div className="card-body">
                <p className="text-muted fs-7 mb-3">Add different pack sizes (e.g. 250g, 500g) with their specific prices. If you leave this empty, the product will only have the default Unit Quantity and MRP Price below.</p>
                {packSizes.map((pack, index) => {
                  const p = parseFloat(pack.price) || 0;
                  const d = parseFloat(discount) || 0;
                  let sellingPrice = Math.round(p);
                  if (d > 0) {
                    if (discountType === 'Percent') {
                      sellingPrice = Math.max(0, Math.round(p * (1 - d / 100)));
                    } else {
                      sellingPrice = Math.max(0, Math.round(p - d));
                    }
                  }

                  return (
                    <div key={index} className="row g-2 mb-2 align-items-end">
                      <div className="col-md-3">
                        <label className="fs-7 mb-1">Weight / Qty</label>
                        <input type="number" className="form-control" value={pack.weight} onChange={(e) => {
                          const newPacks = [...packSizes];
                          newPacks[index].weight = e.target.value;
                          setPackSizes(newPacks);
                        }} />
                      </div>
                      <div className="col-md-3">
                        <label className="fs-7 mb-1">Unit</label>
                        <select className="form-select" value={pack.unit} onChange={(e) => {
                          const newPacks = [...packSizes];
                          newPacks[index].unit = e.target.value;
                          setPackSizes(newPacks);
                        }}>
                          <option value="gm">gm</option>
                          <option value="ml">ml</option>
                          <option value="pcs">pcs</option>
                          <option value="pack">pack</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="fs-7 mb-1">MRP Price (₹)</label>
                        <input type="number" className="form-control" value={pack.price} onChange={(e) => {
                          const newPacks = [...packSizes];
                          newPacks[index].price = e.target.value;
                          setPackSizes(newPacks);
                        }} />
                      </div>
                      <div className="col-md-2 d-flex flex-column justify-content-end pb-1">
                        <label className="fs-8 text-muted mb-1">Selling Price</label>
                        <span className="fw-bold text-success fs-5">
                          ₹{sellingPrice}
                        </span>
                      </div>
                      <div className="col-md-2">
                        <button type="button" className="btn btn-outline-danger w-100" onClick={() => {
                          const newPacks = packSizes.filter((_, i) => i !== index);
                          setPackSizes(newPacks);
                        }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}
                <button type="button" className="btn btn-sm btn-outline-brand mt-2" onClick={() => setPackSizes([...packSizes, { weight: '', unit: 'g', price: '' }])}>
                  <Plus size={14} /> Add Pack Size
                </button>
              </div>
            </div>

            {/* Pricing & Others Card */}
            <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                  <i className="fas fa-rupee-sign text-muted"></i> Pricing & others
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">MRP Price (₹)</label>
                    <input type="number" required className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                  <div className="col-md-3 d-flex flex-column justify-content-center">
                    <span className="fw-medium mb-1 fs-7 text-muted">Discount Price</span>
                    <span className="fw-bold fs-3 text-brand">₹{calculatedSellingPrice || '0'}</span>
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Minimum Order Qty</label>
                    <input type="number" className="form-control" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Current Stock Qty</label>
                    <input type="number" required className="form-control" value={stock} onChange={(e) => setStock(e.target.value)} />
                  </div>

                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Discount Type</label>
                    <select className="form-select" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                      <option value="Flat">Flat</option>
                      <option value="Percent">Percent</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Discount Amount</label>
                    <input type="number" className="form-control" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Tax Amount(%)</label>
                    <input type="number" className="form-control" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Tax Calculation</label>
                    <select className="form-select" value={taxCalculation} onChange={(e) => setTaxCalculation(e.target.value)}>
                      <option value="Include with product">Include with product</option>
                      <option value="Exclude">Exclude</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Shipping Cost (₹)</label>
                    <input type="number" className="form-control" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} />
                  </div>
                  <div className="col-md-6 d-flex flex-column justify-content-end pb-2 gap-3">
                    <div className="form-check form-switch d-flex align-items-center">
                      <label className="form-check-label fs-7 fw-medium mb-0 me-3">Shipping Cost Multiply With Qty</label>
                      <input className="form-check-input" type="checkbox" checked={shippingMultiplyWithQty} onChange={(e) => setShippingMultiplyWithQty(e.target.checked)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end mb-4">
              <button type="button" onClick={resetForm} className="btn btn-brand-secondary">Cancel</button>
              <button type="submit" className="btn btn-brand">{editMode ? 'Update Product' : 'Save Product'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Products list grid */}
      {!showForm && (
        <div className="card shadow-sm border-0 rounded-4 bg-white">
          {productsLoading ? (
            <p className="text-muted text-center py-4">Loading catalog list...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-borderless align-middle m-0 fs-7">
                <thead>
                  <tr className="border-bottom text-muted">
                    <th>SL</th>
                    <th>Product Name</th>
                    <th>Product Type</th>
                    <th>MRP Price</th>
                    <th>Selling Price</th>
                    <th className="text-center">Show As Featured</th>
                    <th className="text-center">Active Status</th>
                    {user.role !== 'Staff' && <th className="text-center">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map((prod, index) => (
                    <tr key={prod._id} className="border-bottom">
                      <td className="text-muted">{index + 1}</td>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <Image
                            src={prod.images[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=80'}
                            alt={prod.name}
                            className="rounded object-fit-cover"
                            width={36}
                            height={36}
                            style={{ width: '36px', height: '36px' }}
                          />
                          <span className="fw-bold text-dark">{prod.name}</span>
                        </div>
                      </td>
                      <td>{prod.productType || 'Physical'}</td>
                      <td>₹{prod.price || 0}</td>
                      <td className="fw-semibold">
                        ₹{prod.discount > 0 ? (
                          prod.discountType === 'Percent' 
                            ? Math.round(prod.price * (1 - prod.discount / 100))
                            : Math.max(0, prod.price - prod.discount)
                        ) : prod.price}
                      </td>
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input 
                            className="form-check-input cursor-pointer" 
                            type="checkbox" 
                            checked={prod.isFeatured || false} 
                            onChange={(e) => handleToggle(prod._id, 'isFeatured', e.target.checked)} 
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input 
                            className="form-check-input cursor-pointer" 
                            type="checkbox" 
                            checked={prod.isActive !== false} 
                            onChange={(e) => handleToggle(prod._id, 'isActive', e.target.checked)} 
                          />
                        </div>
                      </td>
                      {user.role !== 'Staff' && (
                        <td className="text-center">
                          <div className="d-inline-flex gap-2">
                            <button onClick={() => setViewingBarcode(prod)} className="btn btn-sm bg-white" style={{ border: '1px solid #00d2d3', color: '#00d2d3', padding: '0.25rem 0.4rem', borderRadius: '4px' }} title="Barcode">
                              <LayoutGrid size={14} />
                            </button>
                            <button onClick={() => setViewingProduct(prod)} className="btn btn-sm bg-white" style={{ border: '1px solid #00d2d3', color: '#00d2d3', padding: '0.25rem 0.4rem', borderRadius: '4px' }} title="View">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => handleEditClick(prod)} className="btn btn-sm bg-white" style={{ border: '1px solid #1c72b9', color: '#1c72b9', padding: '0.25rem 0.4rem', borderRadius: '4px' }} title="Edit">
                              <Edit size={14} />
                            </button>
                            {user.role === 'Super Admin' && (
                              <button onClick={() => handleDeleteClick(prod._id)} className="btn btn-sm bg-white" style={{ border: '1px solid #f1416c', color: '#f1416c', padding: '0.25rem 0.4rem', borderRadius: '4px' }} title="Delete">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Add New Category</h5>
                <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
              </div>
              <div className="modal-body pt-3">
                <div className="mb-4">
                  <label className="fw-medium mb-1 fs-7">Category Name</label>
                  <div className="d-flex gap-2">
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newCategoryName} 
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Skin Care"
                    />
                    <button type="button" className="btn btn-brand" onClick={handleAddCategorySubmit}>Add</button>
                  </div>
                </div>

                <div className="existing-categories">
                  <h6 className="fw-bold mb-2 fs-7 text-muted">Existing Categories</h6>
                  <ul className="list-group list-group-flush border rounded-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {categories && categories.length > 0 ? categories.map((cat) => (
                      <li key={cat._id} className="list-group-item d-flex justify-content-between align-items-center py-2 px-3 border-bottom fs-7">
                        {cat.name}
                        <button className="btn btn-sm text-danger p-0 border-0 bg-transparent" onClick={() => handleDeleteCategory(cat._id)}>
                          <Trash2 size={16} />
                        </button>
                      </li>
                    )) : (
                      <li className="list-group-item text-muted text-center py-3 fs-7">No categories found.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Sub Category Modal */}
      {showSubCategoryModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Add New Sub-Category</h5>
                <button type="button" className="btn-close" onClick={() => setShowSubCategoryModal(false)}></button>
              </div>
              <div className="modal-body pt-3">
                <div className="mb-3">
                  <label className="fw-medium mb-1 fs-7">Select Parent Category</label>
                  <select className="form-select" value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)}>
                    <option value="">-- Select Category --</option>
                    {categories && categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="fw-medium mb-1 fs-7">Sub-Category Name</label>
                  <div className="d-flex gap-2">
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newSubCategoryName} 
                      onChange={(e) => setNewSubCategoryName(e.target.value)}
                      placeholder="e.g. Face Wash"
                    />
                    <button type="button" className="btn btn-brand" onClick={handleAddSubCategorySubmit}>Add</button>
                  </div>
                </div>

                {parentCategoryId && (
                  <div className="existing-subcategories">
                    <h6 className="fw-bold mb-2 fs-7 text-muted">Existing Sub-Categories</h6>
                    <ul className="list-group list-group-flush border rounded-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {categories.find(c => c._id === parentCategoryId)?.subCategories?.length > 0 ? (
                        categories.find(c => c._id === parentCategoryId).subCategories.map((sub, idx) => (
                          <li key={idx} className="list-group-item d-flex justify-content-between align-items-center py-2 px-3 border-bottom fs-7">
                            {sub}
                            <button className="btn btn-sm text-danger p-0 border-0 bg-transparent" onClick={() => handleDeleteSubCategory(parentCategoryId, sub)}>
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item text-muted text-center py-3 fs-7">No sub-categories found.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
