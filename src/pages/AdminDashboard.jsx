import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, Plus, Edit, Trash2, Package, Users, 
  TrendingUp, DollarSign, Eye, Check, X, 
  Search, Filter, Save, Upload, Loader, AlertCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { dbHelpers, STORAGE_BUCKETS } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [resellerApplications, setResellerApplications] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [newCategory, setNewCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingApplications: 0
  })

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin-login')
    } else {
      loadData()
    }
  }, [isAdmin, navigate])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Load all data in parallel
      const [productsData, categoriesData, applicationsData] = await Promise.all([
        dbHelpers.getProducts(),
        dbHelpers.getCategories(),
        dbHelpers.getResellerApplications()
      ])
      
      setProducts(productsData)
      setCategories(categoriesData)
      setResellerApplications(applicationsData)
      
      // Calculate stats
      const pendingApps = applicationsData.filter(app => app.status === 'pending')
      setStats({
        totalRevenue: 45670, // Mock data - would come from orders
        totalOrders: 156, // Mock data - would come from orders
        totalProducts: productsData.length,
        pendingApplications: pendingApps.length
      })
    } catch (err) {
      console.error('Error loading admin data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !isAdmin()) {
    return null
  }

  const handleProductSave = async (productData) => {
    try {
      setLoading(true)
      
      if (editingProduct && editingProduct.id) {
        // Update existing product
        const updatedProduct = await dbHelpers.updateProduct(editingProduct.id, productData)
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id ? updatedProduct : p
        ))
      } else {
        // Create new product
        const newProduct = await dbHelpers.createProduct(productData)
        setProducts(prev => [...prev, newProduct])
      }
      
      setEditingProduct(null)
    } catch (err) {
      console.error('Error saving product:', err)
      alert('Failed to save product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleProductDelete = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await dbHelpers.deleteProduct(productId)
        setProducts(prev => prev.filter(p => p.id !== productId))
      } catch (err) {
        console.error('Error deleting product:', err)
        alert('Failed to delete product. Please try again.')
      }
    }
  }

  const handleCategoryAdd = async () => {
    if (newCategory.trim()) {
      try {
        const categoryData = {
          name: newCategory.trim(),
          description: `${newCategory.trim()} collection`
        }
        
        const newCat = await dbHelpers.createCategory(categoryData)
        setCategories(prev => [...prev, newCat])
        setNewCategory('')
      } catch (err) {
        console.error('Error adding category:', err)
        alert('Failed to add category. Please try again.')
      }
    }
  }

  const handleCategoryDelete = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    if (confirm(`Are you sure you want to delete the "${category?.name}" category?`)) {
      try {
        await dbHelpers.deleteCategory(categoryId)
        setCategories(prev => prev.filter(c => c.id !== categoryId))
      } catch (err) {
        console.error('Error deleting category:', err)
        alert('Failed to delete category. Please try again.')
      }
    }
  }

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const updatedApp = await dbHelpers.updateApplicationStatus(applicationId, action, user.id)
      setResellerApplications(prev => prev.map(app => 
        app.id === applicationId ? updatedApp : app
      ))
      
      // Update stats
      if (action === 'approved' || action === 'rejected') {
        setStats(prev => ({
          ...prev,
          pendingApplications: prev.pendingApplications - 1
        }))
      }
    } catch (err) {
      console.error('Error updating application:', err)
      alert('Failed to update application. Please try again.')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingApplications = resellerApplications.filter(app => app.status === 'pending')

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="loading-state">
            <Loader className="spinner" size={48} />
            <h2>Loading Dashboard...</h2>
            <p>Please wait while we load your admin data.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="error-state">
            <AlertCircle className="error-icon" size={48} />
            <h2>Error Loading Dashboard</h2>
            <p>{error}</p>
            <button onClick={loadData} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <Shield className="admin-icon" />
              <div>
                <h1>Admin Dashboard</h1>
                <p>Manage your jewelry store</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp className="tab-icon" />
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package className="tab-icon" />
            Products
          </button>
          <button 
            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <Filter className="tab-icon" />
            Categories
          </button>
          <button 
            className={`tab ${activeTab === 'resellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('resellers')}
          >
            <Users className="tab-icon" />
            Reseller Applications
            {pendingApplications.length > 0 && (
              <span className="notification-badge">{pendingApplications.length}</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <DollarSign className="icon" />
                  </div>
                  <div className="stat-content">
                    <h3>${stats.totalRevenue.toLocaleString()}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Package className="icon" />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalOrders}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Package className="icon" />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalProducts}</h3>
                    <p>Products</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Users className="icon" />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.pendingApplications}</h3>
                    <p>Pending Applications</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <Package className="activity-icon" />
                    <span>New product "Diamond Earrings" added</span>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                  <div className="activity-item">
                    <Users className="activity-icon" />
                    <span>Reseller application from Golden Gems LLC</span>
                    <span className="activity-time">1 day ago</span>
                  </div>
                  <div className="activity-item">
                    <DollarSign className="activity-icon" />
                    <span>B2B pricing updated for Rings category</span>
                    <span className="activity-time">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-content">
              <div className="content-header">
                <div className="search-bar">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => setEditingProduct({})}
                >
                  <Plus className="btn-icon" />
                  Add Product
                </button>
              </div>

              <div className="products-table">
                <div className="table-header">
                  <span>Product</span>
                  <span>Category</span>
                  <span>B2C Price</span>
                  <span>B2B Price</span>
                  <span>Min Qty B2B</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                
                {filteredProducts.map(product => (
                  <div key={product.id} className="table-row">
                    <div className="product-info">
                      <img src={product.image_url} alt={product.name} className="product-thumb" />
                      <div>
                        <span className="product-name">{product.name}</span>
                        <span className="product-desc">{product.description}</span>
                      </div>
                    </div>
                    <span>{product.categories?.name || 'Uncategorized'}</span>
                    <span>${product.b2c_price}</span>
                    <span>${product.b2b_price}</span>
                    <span>{product.min_quantity_b2b}</span>
                    <span className={`status ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <div className="actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleProductDelete(product.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="categories-content">
              <div className="content-header">
                <h3>Manage Categories</h3>
                <div className="add-category">
                  <input
                    type="text"
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCategoryAdd()}
                  />
                  <button className="btn btn-primary" onClick={handleCategoryAdd}>
                    <Plus className="btn-icon" />
                    Add
                  </button>
                </div>
              </div>

              <div className="categories-grid">
                {categories.map(category => (
                  <div key={category.id} className="category-card">
                    <span className="category-name">{category.name}</span>
                    <button 
                      className="delete-category"
                      onClick={() => handleCategoryDelete(category.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resellers' && (
            <div className="resellers-content">
              <div className="content-header">
                <h3>Reseller Applications</h3>
              </div>

              <div className="applications-list">
                {resellerApplications.map(application => (
                  <div key={application.id} className="application-card">
                    <div className="application-header">
                      <div className="company-info">
                        <h4>{application.company_name}</h4>
                        <p>{application.contact_person}</p>
                      </div>
                      <span className={`status status-${application.status}`}>
                        {application.status}
                      </span>
                    </div>
                    
                    <div className="application-details">
                      <div className="detail-row">
                        <span>Email:</span>
                        <span>{application.email}</span>
                      </div>
                      <div className="detail-row">
                        <span>Phone:</span>
                        <span>{application.phone}</span>
                      </div>
                      <div className="detail-row">
                        <span>Business Type:</span>
                        <span>{application.business_type}</span>
                      </div>
                      <div className="detail-row">
                        <span>Years in Business:</span>
                        <span>{application.years_in_business}</span>
                      </div>
                      <div className="detail-row">
                        <span>Expected Volume:</span>
                        <span>${application.expected_monthly_volume}</span>
                      </div>
                      <div className="detail-row">
                        <span>Submitted:</span>
                        <span>{new Date(application.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {application.status === 'pending' && (
                      <div className="application-actions">
                        <button 
                          className="btn btn-success"
                          onClick={() => handleApplicationAction(application.id, 'approved')}
                        >
                          <Check className="btn-icon" />
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleApplicationAction(application.id, 'rejected')}
                        >
                          <X className="btn-icon" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Edit Modal */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          onSave={handleProductSave}
          onCancel={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}

// Product Edit Modal Component
const ProductEditModal = ({ product, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    category_id: product.category_id || (categories[0]?.id || ''),
    description: product.description || '',
    image_url: product.image_url || '',
    b2c_price: product.b2c_price || '',
    b2b_price: product.b2b_price || '',
    min_quantity_b2b: product.min_quantity_b2b || 1,
    in_stock: product.in_stock !== undefined ? product.in_stock : true,
    sku: product.sku || '',
    material: product.material || ''
  })
  
  const [imageUploading, setImageUploading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (imageUploading) {
      alert('Please wait for image upload to complete')
      return
    }
    
    onSave({
      ...formData,
      b2c_price: parseFloat(formData.b2c_price),
      b2b_price: parseFloat(formData.b2b_price),
      min_quantity_b2b: parseInt(formData.min_quantity_b2b)
    })
  }
  
  const handleImageChange = (imageData) => {
    if (imageData) {
      setFormData(prev => ({ ...prev, image_url: imageData.url }))
    } else {
      setFormData(prev => ({ ...prev, image_url: '' }))
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{product.id ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Product SKU"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Material</label>
            <input
              type="text"
              value={formData.material}
              onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
              placeholder="e.g., 18k Gold, Sterling Silver"
            />
          </div>
          
          <div className="form-group">
            <label>Product Image</label>
            <ImageUpload
              bucket={STORAGE_BUCKETS.PRODUCT_IMAGES}
              currentImage={formData.image_url}
              onImageChange={handleImageChange}
              placeholder="Upload product image"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>B2C Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.b2c_price}
                onChange={(e) => setFormData(prev => ({ ...prev, b2c_price: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label>B2B Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.b2b_price}
                onChange={(e) => setFormData(prev => ({ ...prev, b2b_price: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Min Quantity B2B</label>
              <input
                type="number"
                min="1"
                value={formData.min_quantity_b2b}
                onChange={(e) => setFormData(prev => ({ ...prev, min_quantity_b2b: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, in_stock: e.target.checked }))}
                />
                In Stock
              </label>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save className="btn-icon" />
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminDashboard