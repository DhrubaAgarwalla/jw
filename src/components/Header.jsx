import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Gem } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { getTotalItems } = useCart()
  const { user, logout, isAdmin, isB2B } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <Gem className="logo-icon" />
          <span>Jewelry Store</span>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Products</Link>
          
          {!user && (
            <>
              <Link to="/reseller-application" className="nav-link">Become a Reseller</Link>
              <Link to="/b2b-login" className="nav-link">B2B Login</Link>
            </>
          )}

          {isB2B() && (
            <Link to="/b2b-dashboard" className="nav-link">B2B Dashboard</Link>
          )}

          {isAdmin() && (
            <Link to="/admin-dashboard" className="nav-link">Admin Dashboard</Link>
          )}
        </nav>

        <div className="header-actions">
          {!isAdmin() && (
            <Link to="/cart" className="cart-link">
              <ShoppingCart className="cart-icon" />
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </Link>
          )}

          {user ? (
            <div className="user-menu">
              <span className="user-name">
                <User className="user-icon" />
                {user.role === 'admin' ? 'Admin' : user.companyName || user.username}
              </span>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut className="logout-icon" />
              </button>
            </div>
          ) : (
            <Link to="/admin-login" className="admin-link">
              <User className="user-icon" />
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header