import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Professional SVG Icons
const Icons = {
  Logo: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const cartTotal = cartItems.reduce((total, item) => total + (item.price_at_purchase * item.quantity), 0);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please log in to checkout.");
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cartItems: cartItems,
          total_price: cartTotal
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Order placed! Order ID: #${data.order.id}`);
        clearCart();
        navigate('/');
      } else {
        alert("Checkout failed: " + data.message);
      }
    } catch (err) {
      console.error("Error during checkout:", err);
      alert("Server error during checkout.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-75 transition"
          >
            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
              <Icons.Logo />
            </div>
            <h1 className="text-base font-semibold text-gray-900">SignHub</h1>
          </button>

          <button 
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Back to Store
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-0.5">Shopping Cart</h1>
        <p className="text-xs text-gray-500 mb-5">Review your items before checkout</p>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-sm p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icons.Logo />
            </div>
            <h2 className="text-base font-medium text-gray-900 mb-1">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-5">Start shopping to add items to your cart</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-sm p-3">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded shrink-0">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-[10px] text-gray-500">Unit Price</p>
                          <p className="text-xs font-medium text-gray-900">
                            ${parseFloat(item.price_at_purchase).toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            <Icons.Minus />
                          </button>
                          <span className="font-medium text-gray-900 text-xs min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            <Icons.Plus />
                          </button>
                        </div>

                        <div>
                          <p className="text-[10px] text-gray-500">Total</p>
                          <p className="text-xs font-medium text-gray-900">
                            ${(item.price_at_purchase * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Icons.Close />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-sm p-4 sticky top-20">
                <h2 className="text-sm font-medium text-gray-900 mb-3">Order Summary</h2>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Items ({cartItems.length})</span>
                    <span className="text-xs font-medium text-gray-900">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Total</span>
                      <span className="text-base font-semibold text-gray-900">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded text-xs font-medium transition-colors mb-2"
                >
                  Checkout
                </button>

                <button 
                  onClick={() => clearCart()}
                  className="w-full bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-2 rounded text-xs font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
