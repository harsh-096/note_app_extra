require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Prisma and the PostgreSQL adapter tools
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Set up the database connection pool and Prisma adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(cors()); 
app.use(express.json()); 

// ==========================================
// 🛣️ API ROUTES
// ==========================================

// 0. Route to get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true }
    });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// 0.1 Create a new category (Admin)
app.post('/api/categories', async (req, res) => {
  const { name, description, icon } = req.body;
  try {
    const newCategory = await prisma.category.create({
      data: { name, description: description || '', icon: icon || '' }
    });
    res.json({ success: true, category: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
});

// 0.2 Delete a category (Admin)
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
});

// 1. Route to get all products or filter by category
app.get('/api/products', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId: parseInt(categoryId) } : {},
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 2. Route to handle Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find the user by their unique username
    const user = await prisma.user.findUnique({
      where: { username: username }
    });
    
    // Check if user exists and password matches
    if (user && user.password === password) {
      const { password, ...safeUser } = user; // Strip the password before sending to frontend
      res.json({ success: true, user: safeUser });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// 3. Route to handle Checkout (UPDATED TO FORCE PENDING STATUS)
app.post('/api/checkout', async (req, res) => {
  const { userId, cartItems, total_price } = req.body;

  try {
    const order = await prisma.order.create({
      data: {
        userId: userId,
        total_price: total_price,
        status: "PENDING", // <--- NEW: Forces new checkouts to be pending
        items: {
          create: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase
          }))
        }
      }
    });
    res.json({ success: true, order });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ success: false, message: "Failed to process checkout" });
  }
});

// 4. Route to Add a New Product (Admin)
app.post('/api/products', async (req, res) => {
  const { name, description, base_price, image_url, categoryId } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        base_price: parseFloat(base_price),
        image_url,
        categoryId: parseInt(categoryId)
      },
      include: { category: true }
    });
    res.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
});

// 5. Route to Edit/Update a Product (Admin)
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, base_price, image_url, categoryId } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        base_price: parseFloat(base_price),
        image_url,
        categoryId: parseInt(categoryId)
      },
      include: { category: true }
    });
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
});

// 6. Route to Delete a Product (Admin)
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
});

// ==========================================
// 👥 USER MANAGEMENT ROUTES (ADMIN)
// ==========================================

// 7. Get all users
app.get('/api/users', async (req, res) => {
  try {
    // We removed the 'select' restriction here, so Prisma will now grab 
    // EVERYTHING from the database, including the passwords!
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 8. Create a new user (Admin adding a user)
app.post('/api/users', async (req, res) => {
  const { username, password, role, logo_url, price_modifier_percentage, visible_category_ids } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        password, // Reminder: In a production app, hash this!
        role: role || 'user',
        logo_url: logo_url || null,
        price_modifier_percentage: parseFloat(price_modifier_percentage) || 0.0,
        visible_category_ids: visible_category_ids || ''
      }
    });
    res.json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create user. Username might already exist." });
  }
});

// 9. Delete a user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user." });
  }
});

// ==========================================
// 📦 ORDER MANAGEMENT ROUTES (ADMIN)
// ==========================================

// 10. Get all orders with user and product details
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }, 
      include: {
        user: {
          select: { username: true, logo_url: true } // <-- ADDED: logo_url: true
        },
        items: {
          include: {
            product: {
              select: { name: true, image_url: true } 
            }
          }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 11. Update a user (Admin editing a user)
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, role, logo_url, price_modifier_percentage, visible_category_ids } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username,
        password,
        role,
        logo_url: logo_url || null,
        price_modifier_percentage: parseFloat(price_modifier_percentage) || 0.0,
        visible_category_ids: visible_category_ids || ''
      }
    });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Failed to update user." });
  }
});

// 12. Route to Update Order Status (Admin)
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expects "PENDING" or "COMPLETED"

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: status }
    });
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
});

// 13. Get orders for a specific user (User Storefront)
app.get('/api/orders/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) }, // ONLY fetch orders matching this user ID
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, image_url: true }
            }
          }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 14. Delete a specific order (User clearing their history)
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Step A: Delete all items inside the order first (Foreign Key rule!)
    await prisma.orderItem.deleteMany({
      where: { orderId: parseInt(id) }
    });

    // Step B: Delete the actual order
    await prisma.order.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Failed to delete order" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});