import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import OrderReceipt from '../components/OrderReceipt'; // <-- 1. Import it here

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyOrders();
  }, [user, navigate]);

  const fetchMyOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/user/${user.id}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching my orders:", error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order from your history?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        fetchMyOrders();
      } else {
        alert("Failed to delete order.");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Server error while deleting order.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Order History</h1>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-lg shadow-md text-center">
            <p className="text-xl text-gray-500 mb-4">You haven't placed any orders yet, or your history is clear.</p>
            <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
               /* 2. Much cleaner and easier to read! */
               <OrderReceipt 
                 key={order.id} 
                 order={order} 
                 handleDeleteOrder={handleDeleteOrder} 
               />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}