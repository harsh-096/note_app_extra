export default function CartItem({ item, updateQuantity, removeFromCart }) {
  return (
    <li className="p-6 flex flex-col sm:flex-row items-center justify-between">
      <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
        <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
        <div>
          <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
          <p className="text-gray-600 text-sm">Locked Price: ${item.price_at_purchase.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => updateQuantity(item.id, -1)} 
            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded text-gray-800 hover:bg-gray-300 font-bold transition-colors"
          >
            -
          </button>
          <span className="font-bold w-4 text-center text-gray-800">
            {item.quantity}
          </span>
          <button 
            onClick={() => updateQuantity(item.id, 1)} 
            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded text-gray-800 hover:bg-gray-300 font-bold transition-colors"
          >
            +
          </button>
        </div>
        <button 
          onClick={() => removeFromCart(item.id)}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Remove
        </button>
      </div>
    </li>
  );
}