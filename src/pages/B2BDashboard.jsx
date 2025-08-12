import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building, ShoppingCart, Package, TrendingUp, User, Phone, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const B2BDashboard = () => {
  const { user, isB2B } = useAuth()
  const { getTotalItems, getTotalPrice } = useCart()
  const navigate = useNavigate()
  
  const [orderHistory] = useState([
    {
      id: 'ORD-001',
      date: '2024-01-15',
      items: 12,
      total: 2450.00,
      status: 'Delivered'
    },
    {
      id: 'ORD-002',
      date: '2024-01-08',
      items: 8,
      total: 1680.00,
      status: 'Shipped'
    },
    {
      id: 'ORD-003',
      date: '2024-01-02',
      items: 15,
      total: 3200.00,
      status: 'Processing'
    }
  ])

  // Redirect if not B2B user
  useEffect(() => {
    if (!isB2B()) {
      navigate('/b2b-login')
    }
  }, [isB2B, navigate])

  if (!user || !isB2B()) {
    return null
  }

  const totalOrderValue = orderHistory.reduce((sum, order) => sum + order.total, 0)
  const totalItemsPurchased = orderHistory.reduce((sum, order) => sum + order.items, 0)

  return (
    <div className="b2b-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <Building className="company-icon" />
              <div>
                <h1>Welcome back, {user.companyName}</h1>
                <p>Manage your wholesale account and orders</p>
              </div>
            </div>
            
            <div className="quick-actions">
              <Link to="/products" className="btn btn-primary">
                <ShoppingCart className="btn-icon" />
                Browse Products
              </Link>
              {getTotalItems() > 0 && (
                <Link to="/cart" className="btn btn-secondary">
                  View Cart ({getTotalItems()})
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Package className="icon" />
            </div>
            <div className="stat-content">
              <h3>{orderHistory.length}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp className="icon" />
            </div>
            <div className="stat-content">
              <h3>${totalOrderValue.toLocaleString()}</h3>
              <p>Total Order Value</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <ShoppingCart className="icon" />
            </div>
            <div className="stat-content">
              <h3>{totalItemsPurchased}</h3>
              <p>Items Purchased</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Package className="icon" />
            </div>
            <div className="stat-content">
              <h3>{getTotalItems()}</h3>
              <p>Items in Cart</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Account Information */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Account Information</h2>
            </div>
            
            <div className="account-info">
              <div className="info-grid">
                <div className="info-item">
                  <Building className="info-icon" />
                  <div>
                    <label>Company Name</label>
                    <span>{user.companyName}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <User className="info-icon" />
                  <div>
                    <label>Account ID</label>
                    <span>{user.username}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <Package className="info-icon" />
                  <div>
                    <label>Account Status</label>
                    <span className="status-active">Active</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <TrendingUp className="info-icon" />
                  <div>
                    <label>Pricing Tier</label>
                    <span>Wholesale</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Link to="/orders" className="view-all-link">View All Orders</Link>
            </div>
            
            <div className="orders-table">
              <div className="table-header">
                <span>Order ID</span>
                <span>Date</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
              </div>
              
              {orderHistory.map(order => (
                <div key={order.id} className="table-row">
                  <span className="order-id">{order.id}</span>
                  <span>{new Date(order.date).toLocaleDateString()}</span>
                  <span>{order.items} items</span>
                  <span>${order.total.toLocaleString()}</span>
                  <span className={`status status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* B2B Benefits */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Your B2B Benefits</h2>
            </div>
            
            <div className="benefits-grid">
              <div className="benefit-card">
                <TrendingUp className="benefit-icon" />
                <h3>Wholesale Pricing</h3>
                <p>Save 20-30% on all products with our exclusive B2B pricing</p>
              </div>
              
              <div className="benefit-card">
                <Package className="benefit-icon" />
                <h3>Bulk Orders</h3>
                <p>Minimum quantity requirements ensure better margins for your business</p>
              </div>
              
              <div className="benefit-card">
                <Phone className="benefit-icon" />
                <h3>Priority Support</h3>
                <p>Dedicated B2B support team for faster resolution of your queries</p>
              </div>
              
              <div className="benefit-card">
                <Mail className="benefit-icon" />
                <h3>Marketing Materials</h3>
                <p>Access to product catalogs, high-res images, and marketing content</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            
            <div className="quick-links">
              <Link to="/products" className="quick-link">
                <ShoppingCart className="link-icon" />
                <span>Browse Products</span>
              </Link>
              
              <Link to="/cart" className="quick-link">
                <Package className="link-icon" />
                <span>View Cart</span>
              </Link>
              
              <a href="mailto:b2b@jewelrystore.com" className="quick-link">
                <Mail className="link-icon" />
                <span>Contact Support</span>
              </a>
              
              <a href="tel:+1234567890" className="quick-link">
                <Phone className="link-icon" />
                <span>Call Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default B2BDashboard