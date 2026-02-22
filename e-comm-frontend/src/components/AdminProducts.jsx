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

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', base_price: '', image_url: '', categoryId: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `http://localhost:5000/api/products/${editingId}` 
        : 'http://localhost:5000/api/products';
        
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          categoryId: parseInt(newProduct.categoryId)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Product ${editingId ? 'updated' : 'added'} successfully!`);
        setNewProduct({ name: '', description: '', base_price: '', image_url: '', categoryId: '' });
        setEditingId(null);
        setShowModal(false);
        fetchProducts(); 
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description,
      base_price: product.base_price,
      image_url: product.image_url,
      categoryId: product.categoryId
    });
    setShowModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewProduct({ name: '', description: '', base_price: '', image_url: '', categoryId: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewProduct({ name: '', description: '', base_price: '', image_url: '', categoryId: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Products</h1>
        <button 
          onClick={openAddModal}
          className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5"
        >
          <Icons.Plus />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div>
        {products.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-sm">
            <p className="text-gray-500 text-sm">No products yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map(product => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                {/* Image */}
                <div className="h-36 bg-gray-100 relative">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  {product.category && (
                    <div className="absolute top-2 right-2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded">
                      {product.category.name}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-0.5">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      ${parseFloat(product.base_price).toFixed(2)}
                    </span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                      >
                        <Icons.Pencil />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-red-600 px-2 py-1 rounded hover:bg-red-50"
                      >
                        <Icons.Trash />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmitProduct} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  placeholder="Product Name" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                  value={newProduct.name} 
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                  >
                    <option value="">Select</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Base Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                    value={newProduct.base_price} 
                    onChange={(e) => setNewProduct({...newProduct, base_price: e.target.value})} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                <input 
                  type="text" 
                  placeholder="Image URL" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                  value={newProduct.image_url} 
                  onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  placeholder="Product Description" 
                  required 
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
                  value={newProduct.description} 
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
                />
              </div>
              
              <div className="flex gap-2 pt-1">
                <button 
                  type="submit" 
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 px-3 rounded-sm text-xs font-medium"
                >
                  {editingId ? 'Update Product' : 'Add Product'}
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
