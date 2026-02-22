export default function OrderReceipt({ order, handleDeleteOrder }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      
      {/* Order Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-sm text-gray-500 block">Order ID</span>
          <span className="font-mono font-bold text-gray-800">#{order.id}</span>
        </div>
        <div>
          <span className="text-sm text-gray-500 block">Date Placed</span>
          <span className="font-medium text-gray-800">
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="text-sm text-gray-500 block">Total Amount</span>
          <span className="font-bold text-gray-800">${order.total_price.toFixed(2)}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-sm text-gray-500 block">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {order.status}
            </span>
          </div>
          <button 
            onClick={() => handleDeleteOrder(order.id)}
            className="ml-4 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-sm font-medium transition-colors border border-red-200"
          >
            Delete History
          </button>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4">
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center space-x-4">
              <img 
                src={item.product?.image_url || 'https://via.placeholder.com/50'} 
                alt={item.product?.name} 
                className="w-12 h-12 object-cover rounded shadow-sm"
              />
              <div>
                <p className="font-medium text-gray-800">{item.product?.name || 'Unknown Product'}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity} | Locked Price: ${item.price_at_purchase.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}