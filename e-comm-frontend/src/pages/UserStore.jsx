import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';

// Professional SVG Icons
const Icons = {
  Logo: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
    </svg>
  ),
  Cart: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
};

export default function UserStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity } = useCart();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await fetch(`${API_BASE_URL}/api/products`);
        const productsData = await prodRes.json();
        
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (user?.role === 'user') fetchData();
  }, [user]);

  const calculateFinalPrice = (basePrice) => {
    const modifier = user?.price_modifier_percentage || 0;
    return (basePrice * (1 + modifier / 100)).toFixed(2);
  };

  const getItemQuantity = (id) => {
    const item = cartItems.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
              <Icons.Logo />
            </div>
            <h1 className="text-base font-semibold text-gray-900">SignHub</h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/my-orders')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded text-sm font-medium"
            >
              My Orders
            </button>
            <button 
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-800"
            >
              <Icons.Cart />
              <span>Cart</span>
              {cartItems.length > 0 && (
                <span className="ml-1 bg-gray-700 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>
            
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Products Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Products</h2>
          <p className="text-xs text-gray-500">{products.length} products available</p>
        </div>
        
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-sm">
            <p className="text-gray-500 text-sm">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="p-2">
                  <h3 className="text-xs font-medium text-gray-900 mb-0.5 line-clamp-1">{product.name}</h3>
                  <p className="text-[10px] text-gray-500 mb-2 line-clamp-1">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        ${calculateFinalPrice(product.base_price)}
                      </p>
                    </div>

                    {getItemQuantity(product.id) === 0 ? (
                      <button
                        onClick={() => addToCart(product, calculateFinalPrice(product.base_price))}
                        className="bg-gray-900 text-white px-2 py-1 rounded text-[10px] font-medium hover:bg-gray-800"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-gray-100 rounded">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="p-0.5 text-gray-600 hover:text-gray-900"
                        >
                          −
                        </button>
                        <span className="font-medium text-gray-900 text-[10px] min-w-[16px] text-center">
                          {getItemQuantity(product.id)}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="p-0.5 text-gray-600 hover:text-gray-900"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
