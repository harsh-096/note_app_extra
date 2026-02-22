import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

// Professional SVG Icons
const Icons = {
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Pencil: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '', 
    password: '', 
    role: 'user', 
    price_modifier_percentage: 0, 
    logo_url: '',
    visible_category_ids: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${API_BASE_URL}/api/users/${editingId}` 
        : `${API_BASE_URL}/api/users`;
        
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`User ${editingId ? 'updated' : 'added'} successfully!`);
        setNewUser({ username: '', password: '', role: 'user', price_modifier_percentage: 0, logo_url: '', visible_category_ids: '' });
        setEditingId(null);
        setShowModal(false);
        fetchUsers(); 
      } else {
        alert(data.message || "Failed to save user.");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user.");
    }
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setNewUser({
      username: user.username,
      password: user.password || '',
      role: user.role,
      price_modifier_percentage: user.price_modifier_percentage,
      logo_url: user.logo_url || '',
      visible_category_ids: user.visible_category_ids || ''
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewUser({ username: '', password: '', role: 'user', price_modifier_percentage: 0, logo_url: '', visible_category_ids: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewUser({ username: '', password: '', role: 'user', price_modifier_percentage: 0, logo_url: '', visible_category_ids: '' });
  };

  const toggleCategory = (catId) => {
    const ids = newUser.visible_category_ids 
      ? newUser.visible_category_ids.split(',').map(id => parseInt(id.trim())).filter(id => id)
      : [];
    
    if (ids.includes(catId)) {
      setNewUser({
        ...newUser, 
        visible_category_ids: ids.filter(id => id !== catId).join(',')
      });
    } else {
      setNewUser({
        ...newUser, 
        visible_category_ids: [...ids, catId].join(',')
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Users</h1>
        <button 
          onClick={openAddModal}
          className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5"
        >
          <Icons.Plus />
          Add User
        </button>
      </div>

      {/* Users Grid */}
      <div>
        {users.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-sm">
            <p className="text-gray-500 text-sm">No users yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map(user => (
              <div key={user.id} className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 p-4 text-white">
                  <div className="flex items-center gap-3">
                    {user.logo_url ? (
                      <img src={user.logo_url} alt={user.username} className="w-10 h-10 rounded-full border-2 border-white/30" />
                    ) : (
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{user.username}</h3>
                      <p className={`text-[10px] ${user.role === 'admin' ? 'text-red-300' : 'text-gray-400'}`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-500">Price Modifier</span>
                      <span className={`text-xs font-medium ${user.price_modifier_percentage > 0 ? 'text-green-600' : user.price_modifier_percentage < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {user.price_modifier_percentage > 0 ? '+' : ''}{user.price_modifier_percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-500">ID</span>
                      <span className="text-xs font-medium text-gray-900">#{user.id}</span>
                    </div>

                    {user.visible_category_ids && (
                      <div>
                        <span className="text-[10px] text-gray-500">Categories</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {categories
                            .filter(cat => user.visible_category_ids.split(',').map(id => parseInt(id.trim())).includes(cat.id))
                            .map(cat => (
                              <span key={cat.id} className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded">
                                {cat.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 pt-2 border-t">
                    <button 
                      onClick={() => handleEditClick(user)}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-gray-100 text-gray-600 py-1.5 rounded hover:bg-gray-200"
                    >
                      <Icons.Pencil />
                      Edit
                    </button>
                    {user.username !== 'admin' && (
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-gray-100 text-red-600 py-1.5 rounded hover:bg-red-50"
                      >
                        <Icons.Trash />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Add/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-gray-900">
                {editingId ? 'Edit User' : 'Add New User'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmitUser} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                  <input 
                    type="text" 
                    placeholder="Username" 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                    value={newUser.username} 
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="text" 
                    placeholder={editingId ? "Leave blank to keep" : "Password"} 
                    required={!editingId} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                    value={newUser.password} 
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500 bg-white"
                    value={newUser.role} 
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price Modifier (%)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                    value={newUser.price_modifier_percentage} 
                    onChange={(e) => setNewUser({...newUser, price_modifier_percentage: e.target.value})} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Logo URL (Optional)</label>
                <input 
                  type="text" 
                  placeholder="https://..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                  value={newUser.logo_url} 
                  onChange={(e) => setNewUser({...newUser, logo_url: e.target.value})} 
                />
              </div>
              
              {/* Categories Selection */}
              {newUser.role === 'user' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Visible Categories</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2">
                    {categories.map(cat => {
                      const ids = newUser.visible_category_ids 
                        ? newUser.visible_category_ids.split(',').map(id => parseInt(id.trim())).filter(id => id)
                        : [];
                      return (
                        <label 
                          key={cat.id} 
                          className="flex items-center gap-2 p-1.5 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 text-[10px]"
                        >
                          <input 
                            type="checkbox" 
                            checked={ids.includes(cat.id)}
                            onChange={() => toggleCategory(cat.id)}
                            className="w-3 h-3"
                          />
                          <span className="truncate">{cat.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-1">
                <button 
                  type="submit" 
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 px-3 rounded-sm text-xs font-medium"
                >
                  {editingId ? 'Update User' : 'Add User'}
                </button>
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-sm text-xs font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
