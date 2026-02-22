import { useState, useEffect } from 'react';

// Order status options with colors
const ORDER_STATUSES = [
  { id: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '○' },
  { id: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: '✓' },
  { id: 'PROCESSING', label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: '⚙' },
  { id: 'SHIPPED', label: 'Shipped', color: 'bg-orange-100 text-orange-800', icon: '→' },
  { id: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✓✓' }
];

// Status progression for visual progress
const getStatusIndex = (status) => ORDER_STATUSES.findIndex(s => s.id === status);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Filter orders based on status
  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  // Get status info
  const getStatusInfo = (status) => ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
        <span className="text-sm text-gray-500">{orders.length} total orders</span>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            filterStatus === 'ALL' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All
        </button>
        {ORDER_STATUSES.map(status => (
          <button
            key={status.id}
            onClick={() => setFilterStatus(status.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filterStatus === status.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            const statusIndex = getStatusIndex(order.status);
            
            return (
              <div 
                key={order.id} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* Order Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-gray-500">Order</span>
                        <p className="font-mono text-sm font-medium text-gray-900">#{order.id}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Date</span>
                        <p className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Customer</span>
                        <p className="text-sm font-medium text-gray-900">@{order.user?.username || 'Unknown'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Total</span>
                        <p className="font-semibold text-gray-900">${order.total_price?.toFixed(2) || '0.00'}</p>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 flex items-center gap-1">
                    {ORDER_STATUSES.map((status, index) => (
                      <div 
                        key={status.id}
                        className={`flex-1 h-1 rounded ${
                          index <= statusIndex ? 'bg-gray-900' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900"
                    >
                      {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                    </button>
                    
                    {/* Quick Status Update */}
                    <div className="flex gap-1">
                      {ORDER_STATUSES.map((status, index) => {
                        if (index <= statusIndex) return null;
                        return (
                          <button
                            key={status.id}
                            onClick={() => handleUpdateStatus(order.id, status.id)}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          >
                            {status.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {selectedOrder === order.id && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Items</h4>
                    <div className="space-y-2">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                              <img 
                                src={item.product?.image_url || 'https://via.placeholder.com/40'} 
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.product?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            ${(item.price_at_purchase * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
