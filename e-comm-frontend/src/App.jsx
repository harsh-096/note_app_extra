import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import UserStore from './pages/UserStore';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Login from './pages/Login';
import MyOrders from './pages/MyOrders'; // <-- 1. Import the new page

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<UserStore />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/my-orders" element={<MyOrders />} /> {/* <-- 2. Add the route */}
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;