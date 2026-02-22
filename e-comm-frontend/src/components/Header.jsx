import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Header() {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  // Get logged-in user
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Calculate total number of items in the cart
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. Logo / Store Name */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl font-black text-blue-600 tracking-tight">
              E-Comm<span className="text-gray-800">Store</span>
            </span>
          </div>

          {/* 2. Middle Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Store
            </Link>
            <Link to="/my-orders" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              My Orders
            </Link>
          </nav>

          {/* 3. Right Side: Cart & User info */}
          <div className="flex items-center space-x-6">
            
            {/* Cart Button with Dynamic Badge */}
            <button 
              onClick={() => navigate('/cart')} 
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Logout */}
            <div className="flex items-center space-x-4 border-l pl-6 border-gray-200">
              {user && (
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  Hi, @{user.username}
                </span>
              )}
              <button 
                onClick={handleLogout} 
                className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
}