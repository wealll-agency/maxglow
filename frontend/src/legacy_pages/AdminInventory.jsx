"use client";



import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, editProduct } from '@/store/adminSlice';
import { AlertTriangle, Clock, ArrowDownUp, RefreshCw } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function AdminInventoryPage() {
  const dispatch = useDispatch();
  const { products, productsLoading } = useSelector((state) => state.admin);
  const { showAlert } = useNotification();

  // Adjustment states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('Stock Audit adjustment');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustmentQty) return;

    setStatusMsg('');
    const newStock = selectedProduct.stock + Number(adjustmentQty);
    if (newStock < 0) {
      showAlert('Stock cannot be reduced below 0 units', 'warning');
      return;
    }

    dispatch(editProduct({
      id: selectedProduct._id,
      data: {
        stock: newStock
      }
    })).then(() => {
      setStatusMsg('Stock adjusted successfully!');
      setAdjustmentQty('');
      setSelectedProduct(null);
      dispatch(fetchAdminProducts());
    });
  };

  const isExpired = (expiryDateString) => {
    return new Date(expiryDateString) < new Date();
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font">Inventory Manager</h1>
          <p className="text-muted m-0">Real-time stock levels, batch warnings, and reconciliations.</p>
        </div>
      </div>

      <div className="row g-4">
        
        {/* Inventory list */}
        <div className="col-lg-8">
          <div className="card shadow-sm p-4 border-0 rounded-4 bg-white">
            {productsLoading ? (
              <p className="text-muted text-center py-4">Loading stock parameters...</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-borderless align-middle m-0 fs-7">
                  <thead>
                    <tr className="border-bottom text-muted">
                      <th>Product</th>
                      <th>Batch Code</th>
                      <th>Expiry</th>
                      <th>Stock Level</th>
                      <th>Alert State</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => {
                      const expired = isExpired(prod.expiryDate);
                      const isLowStock = prod.stock <= 10;
                      
                      return (
                        <tr key={prod._id} className="border-bottom">
                          <td className="fw-bold py-3">{prod.name}</td>
                          <td className="font-monospace text-muted">{prod.batchNumber}</td>
                          <td>
                            <span className={expired ? 'text-danger fw-bold' : 'text-dark'}>
                              {new Date(prod.expiryDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="fw-bold">{prod.stock} units</td>
                          <td>
                            {expired ? (
                              <span className="badge bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center gap-1">
                                <Clock size={12} /> Expired
                              </span>
                            ) : isLowStock ? (
                              <span className="badge bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center gap-1">
                                <AlertTriangle size={12} /> Low Stock
                              </span>
                            ) : (
                              <span className="badge bg-success bg-opacity-10 text-success">Healthy</span>
                            )}
                          </td>
                          <td className="text-center">
                            <button 
                              onClick={() => setSelectedProduct(prod)}
                              className="btn btn-sm btn-brand-secondary py-1 px-3"
                            >
                              Adjust
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Adjustments Form */}
        <div className="col-lg-4">
          <div className="card shadow-sm p-4 border-0 rounded-4 bg-white sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark border-bottom pb-2">
              <ArrowDownUp size={18} color="var(--primary-color)" /> Stock Adjustment
            </h5>

            {selectedProduct ? (
              <form onSubmit={handleAdjustSubmit} className="d-flex flex-column gap-3">
                <div>
                  <label className="fw-medium mb-1 fs-7">Selected Product</label>
                  <input type="text" disabled className="form-control bg-light" value={selectedProduct.name} />
                  <small className="text-muted d-block mt-1 fs-8">Current level: {selectedProduct.stock} units</small>
                </div>

                <div>
                  <label className="fw-medium mb-1 fs-7">Quantity Change</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(e.target.value)}
                  />
                </div>

                <div>
                  <label className="fw-medium mb-1 fs-7">Adjustment Context</label>
                  <select 
                    className="form-select"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                  >
                    <option value="Restock shipment">Restock Shipment</option>
                    <option value="Stock Audit adjustment">Audit Reconciliation</option>
                    <option value="Damaged/Expired discards">Discard Expired/Damaged</option>
                  </select>
                </div>

                <div className="d-flex gap-2 justify-content-end mt-2">
                  <button type="button" onClick={() => setSelectedProduct(null)} className="btn btn-brand-secondary">Cancel</button>
                  <button type="submit" className="btn btn-brand">Apply Stock</button>
                </div>
              </form>
            ) : (
              <div className="text-center py-5 text-muted">
                <RefreshCw size={36} className="mb-2 mx-auto" />
                <p className="fs-7 m-0">Select an item from the inventory grid to perform adjustments.</p>
              </div>
            )}

            {statusMsg && <div className="alert alert-success p-2 fs-8 mt-3 mb-0">{statusMsg}</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
