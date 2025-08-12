import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { loginAdmin, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in as admin
  React.useEffect(() => {
    if (user && user.user_metadata?.role === 'admin') {
      navigate('/admin-dashboard')
    }
  }, [user, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await loginAdmin(credentials.email, credentials.password)
      
      if (result.success) {
        navigate('/admin-dashboard')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="container">
        <div className="login-content">
          <div className="login-info">
            <div className="info-header">
              <Shield className="info-icon" />
              <h2>Admin Access</h2>
            </div>
            
            <div className="info-content">
              <h3>Store Management Portal</h3>
              <p>
                Access the administrative dashboard to manage products, 
                categories, pricing, and reseller applications.
              </p>
              
              <div className="admin-features">
                <h4>Admin Features:</h4>
                <ul>
                  <li>Product catalog management</li>
                  <li>Category creation and editing</li>
                  <li>B2B and B2C pricing control</li>
                  <li>Reseller application review</li>
                  <li>Order management</li>
                  <li>User account management</li>
                </ul>
              </div>
              
              <div className="demo-credentials">
                <h4>Admin Account Setup:</h4>
                <p>
                  To create an admin account, you need to sign up through Supabase 
                  and set the user metadata role to 'admin'.
                </p>
                <small className="security-note">
                  ⚠️ In production, use strong passwords and enable 2FA
                </small>
              </div>
            </div>
          </div>

          <div className="login-form-container">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-header">
                <Shield className="form-icon" />
                <h3>Administrator Login</h3>
                <p>Enter your admin credentials to continue</p>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">
                  <Mail className="label-icon" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  placeholder="Enter admin email"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <Lock className="label-icon" />
                  Password
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    placeholder="Enter admin password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In as Admin'}
              </button>

              <div className="form-footer">
                <div className="security-notice">
                  <Shield className="notice-icon" />
                  <p>
                    This is a secure admin area. All activities are logged and monitored.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin