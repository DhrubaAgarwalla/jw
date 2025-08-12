import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const B2BLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { loginB2B, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in as B2B
  React.useEffect(() => {
    if (user && user.user_metadata?.role === 'b2b') {
      navigate('/b2b-dashboard')
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
      const result = await loginB2B(credentials.email, credentials.password)
      
      if (result.success) {
        navigate('/b2b-dashboard')
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
    <div className="b2b-login">
      <div className="container">
        <div className="login-content">
          <div className="login-info">
            <div className="info-header">
              <Building className="info-icon" />
              <h2>B2B Partner Login</h2>
            </div>
            
            <div className="info-content">
              <h3>Welcome Back, Partner!</h3>
              <p>
                Access your wholesale account to view special pricing, 
                place bulk orders, and manage your business relationship with us.
              </p>
              
              <div className="b2b-benefits">
                <h4>B2B Benefits:</h4>
                <ul>
                  <li>Wholesale pricing on all products</li>
                  <li>Minimum quantity requirements</li>
                  <li>Priority customer support</li>
                  <li>Exclusive product access</li>
                  <li>Flexible payment terms</li>
                </ul>
              </div>
              
              <div className="demo-credentials">
                <h4>B2B Account Setup:</h4>
                <p>
                  To get B2B access, you need to:
                </p>
                <ol>
                  <li>Submit a reseller application</li>
                  <li>Wait for admin approval</li>
                  <li>Receive login credentials via email</li>
                  <li>Access wholesale pricing and features</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="login-form-container">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-header">
                <h3>Sign In to Your Account</h3>
                <p>Enter your B2B credentials to continue</p>
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
                  placeholder="Enter your email"
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
                    placeholder="Enter your password"
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
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="form-footer">
                <p>
                  Don't have a B2B account?{' '}
                  <Link to="/reseller-application" className="link">
                    Apply to become a reseller
                  </Link>
                </p>
                
                <p>
                  Need help? Contact our B2B support team at{' '}
                  <a href="mailto:b2b@jewelrystore.com" className="link">
                    b2b@jewelrystore.com
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default B2BLogin