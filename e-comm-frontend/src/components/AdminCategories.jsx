import { useState, useEffect } from 'react';

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

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `http://localhost:5000/api/categories/${editingId}` 
        : 'http://localhost:5000/api/categories';
        
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Category ${editingId ? 'updated' : 'added'} successfully!`);
        setNewCategory({ name: '', description: '', icon: '' });
        setEditingId(null);
        setShowModal(false);
        fetchCategories();
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  const handleEditClick = (category) => {
    setEditingId(category.id);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      icon: category.icon || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewCategory({ name: '', description: '', icon: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewCategory({ name: '', description: '', icon: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Categories</h1>
        <button 
          onClick={openAddModal}
          className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5"
        >
          <Icons.Plus />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div>
        {categories.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-sm">
            <p className="text-gray-500 text-sm">No categories yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(category => (
              <div key={category.id} className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 p-4 text-center text-white">
                  <div className="text-2xl mb-1">{category.icon || '🏷️'}</div>
                  <h3 className="text-xs font-medium">{category.name}</h3>
                </div>

                {/* Content */}
                <div className="p-3">
                  <p className="text-[10px] text-gray-500 mb-2">{category.description || 'No description'}</p>
                  
                  <div className="flex gap-1 pt-2 border-t">
                    <button 
                      onClick={() => handleEditClick(category)}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-gray-100 text-gray-600 py-1 rounded hover:bg-gray-200"
                    >
                      <Icons.Pencil />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-gray-100 text-red-600 py-1 rounded hover:bg-red-50"
                    >
                      <Icons.Trash />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Category */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmitCategory} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 📦" 
                  maxLength="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                  value={newCategory.icon} 
                  onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  placeholder="Category Name" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                  value={newCategory.name} 
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  placeholder="Description" 
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                  value={newCategory.description} 
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})} 
                />
              </div>
              
              <div className="flex gap-2 pt-1">
                <button 
                  type="submit" 
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 px-3 rounded-sm text-xs font-medium"
                >
                  {editingId ? 'Update Category' : 'Add Category'}
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
