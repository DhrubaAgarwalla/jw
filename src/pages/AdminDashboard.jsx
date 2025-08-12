import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, Plus, Edit, Trash2, Package, Users, 
  TrendingUp, DollarSign, Eye, Check, X, 
  Search, Filter, Save, Upload
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Mock data - in real app, this would come from backend
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Diamond Solitaire Ring',
    category: 'Rings',
    description: 'Elegant 1-carat diamond solitaire ring in 18k white gold',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
    b2cPrice: 2500,
    b2bPrice: 1800,
    minQuantityB2B: 2,
    inStock: true
  },
  {
    id: 2,
    name: 'Pearl Necklace',
    category: 'Necklaces',
    description: 'Classic freshwater pearl necklace with sterling silver clasp',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    b2cPrice: 450,
    b2bPrice: 320,
    minQuantityB2B: 5,
    inStock: true
  }
]

const INITIAL_CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets']

const MOCK_RESELLER_APPLICATIONS = [
  {
    id: 1,
    companyName: 'Golden Gems LLC',
    contactPerson: 'John Smith',
    email: 'john@goldengems.com',
    phone: '+1-555-0123',
    businessType: 'jewelry-store',
    yearsInBusiness: '5-10',
    expectedVolume: '2500-5000',
    status: 'pending',
    submittedDate: '2024-01-15'
  },
  {
    id: 2,
    companyName: 'Sparkle Boutique',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@sparkleboutique.com',
    phone: '+1-555-0456',
    businessType: 'boutique',
    yearsInBusiness: '3-5',
    expectedVolume: '1000-2500',
    status: 'pending',
    submittedDate: '2024-01-12'
  }
]

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [resellerApplications, setResellerApplications] = useState(MOCK_RESELLER_APPLICATIONS)
  const [editingProduct, setEditingProduct] = useState(null)
  const [newCategory, setNewCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin-login')
    }
  }, [isAdmin, navigate])

  if (!user || !isAdmin()) {
    return null
  }

  const handleProductSave = (productData) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p
      ))
    } else {
      const newProduct = {
        ...productData,
        id: Math.max(...products.map(p => p.id)) + 1
      }
      setProducts(prev => [...prev, newProduct])
    }
    setEditingProduct(null)
  }

  const handleProductDelete = (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== productId))
    }
  }

  const handleCategoryAdd = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()])
      setNewCategory('')
    }
  }

  const handleCategoryDelete = (category) => {
    if (confirm(`Are you sure you want to delete the "${category}" category?`)) {
      setCategories(prev => prev.filter(c => c !== category))
    }
  }

  const handleApplicationAction = (applicationId, action) => {
    setResellerApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, status: action } : app
    ))
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingApplications = resellerApplications.filter(app => app.status === 'pending')
  const totalRevenue = 45670 // Mock data
  const totalOrders = 156 // Mock data

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
                    <h3>${totalRevenue.toLocaleString()}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Package className="icon" />
                  </div>
                  <div className="stat-content">
                    <h3>{totalOrders}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Package className="icon" />
                  </div>
                  <div className="stat-content">
                    <h3>{products.length}</h3>
                    <p>Products</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Users className="icon" />
                  </div>
                  <div className="stat-content">
                    <h3>{pendingApplications.length}</h3>
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
                      <img src={product.image} alt={product.name} className="product-thumb" />
                      <div>
                        <span className="product-name">{product.name}</span>
                        <span className="product-desc">{product.description}</span>
                      </div>
                    </div>
                    <span>{product.category}</span>
                    <span>${product.b2cPrice}</span>
                    <span>${product.b2bPrice}</span>
                    <span>{product.minQuantityB2B}</span>
                    <span className={`status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
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
                  <div key={category} className="category-card">
                    <span className="category-name">{category}</span>
                    <button 
                      className="delete-category"
                      onClick={() => handleCategoryDelete(category)}
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
                        <h4>{application.companyName}</h4>
                        <p>{application.contactPerson}</p>
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
                        <span>{application.businessType}</span>
                      </div>
                      <div className="detail-row">
                        <span>Years in Business:</span>
                        <span>{application.yearsInBusiness}</span>
                      </div>
                      <div className="detail-row">
                        <span>Expected Volume:</span>
                        <span>${application.expectedVolume}</span>
                      </div>
                      <div className="detail-row">
                        <span>Submitted:</span>
                        <span>{new Date(application.submittedDate).toLocaleDateString()}</span>
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
    category: product.category || categories[0] || '',
    description: product.description || '',
    image: product.image || '',
    b2cPrice: product.b2cPrice || '',
    b2bPrice: product.b2bPrice || '',
    minQuantityB2B: product.minQuantityB2B || 1,
    inStock: product.inStock !== undefined ? product.inStock : true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      b2cPrice: parseFloat(formData.b2cPrice),
      b2bPrice: parseFloat(formData.b2bPrice),
      minQuantityB2B: parseInt(formData.minQuantityB2B)
    })
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
          
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
            <label>Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>B2C Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.b2cPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, b2cPrice: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label>B2B Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.b2bPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, b2bPrice: e.target.value }))}
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
                value={formData.minQuantityB2B}
                onChange={(e) => setFormData(prev => ({ ...prev, minQuantityB2B: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
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