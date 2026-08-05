"use client";



import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders } from '../../../store/adminSlice';
import { Users, Mail, MapPin, Eye, Download } from 'lucide-react';

export default function AdminCustomersPage() {
  const dispatch = useDispatch();
  const { orders, ordersLoading } = useSelector((state) => state.admin);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  useEffect(() => {
    if (orders.length > 0) {
      // Group orders by customer email
      const customerMap = {};
      
      orders.forEach(order => {
        const user = order.user;
        if (!user) return;
        
        const email = user.email;
        if (!customerMap[email]) {
          customerMap[email] = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || 'N/A',
            addresses: order.deliveryAddress ? [order.deliveryAddress] : [],
            ordersCount: 0,
            totalSpent: 0,
            ordersList: []
          };
        }

        customerMap[email].ordersCount += 1;
        customerMap[email].totalSpent += order.totalAmount;
        customerMap[email].ordersList.push(order);
        
        // Push unique address
        if (order.deliveryAddress) {
          const addrStr = `${order.deliveryAddress.street || order.deliveryAddress.address || order.deliveryAddress.locality}, ${order.deliveryAddress.city}`;
          const hasAddr = customerMap[email].addresses.some(a => `${a.street || a.address || a.locality}, ${a.city}` === addrStr);
          if (!hasAddr) {
            customerMap[email].addresses.push(order.deliveryAddress);
          }
        }
      });

      setCustomers(Object.values(customerMap));
    }
  }, [orders]);

  const exportToExcel = () => {
    const csvRows = [];
    const headers = ['Customer Name', 'Email', 'Phone', 'Orders Count', 'Total Spent (INR)'];
    csvRows.push(headers.join(','));

    customers.forEach(cust => {
      const row = [
        `"${cust.name.replace(/"/g, '""')}"`,
        `"${cust.email.replace(/"/g, '""')}"`,
        `"${cust.phone.replace(/"/g, '""')}"`,
        cust.ordersCount,
        cust.totalSpent
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'customers_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font">Customer Profiling</h1>
          <p className="text-muted m-0">Inspect customer order metrics and contact registries.</p>
        </div>
        <button onClick={exportToExcel} className="btn btn-success d-flex align-items-center gap-2 btn-sm fw-medium px-3 py-2">
          <Download size={16} /> Export to Excel
        </button>
      </div>

      <div className="row g-4">
        
        {/* Customer list table */}
        <div className="col-lg-7">
          <div className="card shadow-sm p-4 border-0 rounded-4 bg-white">
            {ordersLoading ? (
              <p className="text-muted text-center py-4">Loading customer profiles...</p>
            ) : customers.length === 0 ? (
              <p className="text-muted text-center py-4">No customer transactions logged yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-borderless align-middle m-0 fs-7">
                  <thead>
                    <tr className="border-bottom text-muted">
                      <th>Customer</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((cust) => (
                      <tr key={cust.email} className="border-bottom">
                        <td className="py-3">
                          <div>
                            <span className="fw-bold text-dark d-block">{cust.name}</span>
                            <small className="text-muted">{cust.email}</small>
                          </div>
                        </td>
                        <td>{cust.ordersCount} checkouts</td>
                        <td className="fw-bold">₹{cust.totalSpent.toLocaleString()}</td>
                        <td className="text-center">
                          <button 
                            onClick={() => setSelectedCustomer(cust)}
                            className="btn btn-sm btn-brand-secondary py-1 px-3 d-inline-flex align-items-center gap-1"
                          >
                            <Eye size={14} /> Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Selected profile details */}
        <div className="col-lg-5">
          <div className="card shadow-sm p-4 border-0 rounded-4 bg-white sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark border-bottom pb-2">
              <Users size={18} color="var(--primary-color)" /> Customer Details
            </h5>

            {selectedCustomer ? (
              <div className="d-flex flex-column gap-4">
                <div>
                  <h4 className="fw-bold text-dark m-0 display-font">{selectedCustomer.name}</h4>
                  <span className="text-muted fs-7 d-flex align-items-center gap-1 mt-1">
                    <Mail size={14} /> {selectedCustomer.email}
                  </span>
                  <span className="text-muted fs-7 d-block">Phone: {selectedCustomer.phone}</span>
                </div>

                {/* KPI stats */}
                <div className="row g-2 text-center">
                  <div className="col-6">
                    <div className="bg-light p-2 rounded border">
                      <span className="text-muted fs-8 d-block">Orders Placed</span>
                      <strong className="fs-5">{selectedCustomer.ordersCount}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light p-2 rounded border">
                      <span className="text-muted fs-8 d-block">Total Purchase</span>
                      <strong className="fs-5 text-success">₹{selectedCustomer.totalSpent}</strong>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div>
                  <h6 className="fw-bold text-muted uppercase fs-8 mb-2">Shipping Destinations ({selectedCustomer.addresses.length})</h6>
                  <div className="d-flex flex-column gap-2">
                    {selectedCustomer.addresses.map((addr, idx) => (
                      <div key={idx} className="p-2 border rounded bg-light fs-8 d-flex align-items-start gap-1">
                        <MapPin size={12} className="text-muted mt-1" />
                        <span>{addr.street || addr.address || addr.locality}, {addr.city}, {addr.state} - {addr.zipCode || addr.pincode}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order ledger logs */}
                <div>
                  <h6 className="fw-bold text-muted uppercase fs-8 mb-2">Transaction History</h6>
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {selectedCustomer.ordersList.map(ord => (
                      <div key={ord._id} className="d-flex justify-content-between align-items-center fs-8 border-bottom pb-1">
                        <span className="font-monospace fw-semibold">#{ord._id.substring(0, 8)}</span>
                        <span className="text-muted">{new Date(ord.createdAt).toLocaleDateString()}</span>
                        <strong className="text-dark">₹{ord.totalAmount}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <Users size={36} className="mb-2 mx-auto" />
                <p className="fs-7 m-0">Select a buyer profile from the registry list to view history cards.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
