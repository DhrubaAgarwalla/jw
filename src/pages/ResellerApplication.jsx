import React, { useState } from 'react'
import { Building, Mail, Phone, FileText, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { dbHelpers } from '../lib/supabase'

const ResellerApplication = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    businessType: '',
    yearsInBusiness: '',
    taxId: '',
    website: '',
    expectedMonthlyVolume: '',
    businessDescription: '',
    tradeReferences: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsSubmitting(false)
      return
    }
    
    try {
      // Create user account with Supabase Auth
      const signUpResult = await signUp(formData.email, formData.password, {
        fullName: formData.contactPerson,
        companyName: formData.companyName
      })
      
      if (!signUpResult.success) {
        throw new Error(signUpResult.message)
      }
      
      // Prepare application data
      const applicationData = {
        user_id: signUpResult.data.user.id,
        company_name: formData.companyName,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        business_address: {
          street: formData.businessAddress,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode
        },
        business_type: formData.businessType,
        years_in_business: formData.yearsInBusiness,
        tax_id: formData.taxId,
        website: formData.website,
        expected_monthly_volume: formData.expectedMonthlyVolume,
        business_description: formData.businessDescription,
        trade_references: formData.tradeReferences
      }
      
      // Submit reseller application
      await dbHelpers.createResellerApplication(applicationData)
      
      setIsSubmitted(true)
      console.log('Reseller application submitted successfully')
      
    } catch (err) {
      console.error('Error submitting application:', err)
      setError(err.message || 'Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="reseller-application">
        <div className="container">
          <div className="success-message">
            <CheckCircle className="success-icon" />
            <h2>Account Created & Application Submitted!</h2>
            <p>
              Your B2B account has been created successfully and your wholesale application 
              has been submitted for review. We will process your application within 2-3 business days.
            </p>
            <p>
              <strong>Your login credentials:</strong><br/>
              Email: {formData.email}<br/>
              Password: (as set by you)
            </p>
            <p>
              You can attempt to log in, but B2B features will only be available after admin approval.
            </p>
            <div className="next-steps">
              <h3>What happens next?</h3>
              <ol>
                <li>Our team will review your application</li>
                <li>We may contact you for additional information</li>
                <li>Upon approval, your account will be activated for wholesale pricing</li>
                <li>You'll receive an email confirmation when approved</li>
                <li>Start ordering with wholesale prices immediately after approval</li>
              </ol>
            </div>
            <div className="action-buttons">
              <a href="/b2b-login" className="btn btn-primary">Go to B2B Login</a>
              <a href="/" className="btn btn-secondary">Return to Home</a>
            </div>
            <p className="contact-info">
              If you have any questions, please contact us at: <strong>business@jewelrystore.com</strong>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reseller-application">
      <div className="container">
        <div className="application-header">
          <h1>Become a Reseller Partner</h1>
          <p>
            Join our network of trusted resellers and gain access to wholesale pricing, 
            exclusive collections, and dedicated support.
          </p>
        </div>

        <div className="benefits-section">
          <h2>Reseller Benefits</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <Building className="benefit-icon" />
              <h3>Wholesale Pricing</h3>
              <p>Access to competitive wholesale prices on our entire collection</p>
            </div>
            <div className="benefit-item">
              <Mail className="benefit-icon" />
              <h3>Dedicated Support</h3>
              <p>Priority customer service and dedicated account management</p>
            </div>
            <div className="benefit-item">
              <Phone className="benefit-icon" />
              <h3>Flexible Terms</h3>
              <p>Flexible payment terms and minimum order quantities</p>
            </div>
            <div className="benefit-item">
              <FileText className="benefit-icon" />
              <h3>Marketing Support</h3>
              <p>Product catalogs, images, and marketing materials</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-section">
            <h3>Company Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person *</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Business Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Business Phone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
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
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Business Address</h3>
            
            <div className="form-group">
              <label htmlFor="businessAddress">Street Address *</label>
              <input
                type="text"
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Business Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="businessType">Business Type *</label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Business Type</option>
                  <option value="retail-store">Retail Store</option>
                  <option value="online-store">Online Store</option>
                  <option value="boutique">Boutique</option>
                  <option value="jewelry-store">Jewelry Store</option>
                  <option value="department-store">Department Store</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="yearsInBusiness">Years in Business *</label>
                <select
                  id="yearsInBusiness"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Years</option>
                  <option value="less-than-1">Less than 1 year</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="more-than-10">More than 10 years</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="taxId">Tax ID / EIN *</label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="website">Website (Optional)</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="expectedMonthlyVolume">Expected Monthly Order Volume *</label>
              <select
                id="expectedMonthlyVolume"
                name="expectedMonthlyVolume"
                value={formData.expectedMonthlyVolume}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Volume Range</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="1000-2500">$1,000 - $2,500</option>
                <option value="2500-5000">$2,500 - $5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000+">$10,000+</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            
            <div className="form-group">
              <label htmlFor="businessDescription">Business Description *</label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                rows="4"
                placeholder="Please describe your business, target market, and how you plan to sell our jewelry..."
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tradeReferences">Trade References (Optional)</label>
              <textarea
                id="tradeReferences"
                name="tradeReferences"
                value={formData.tradeReferences}
                onChange={handleInputChange}
                rows="3"
                placeholder="Please provide contact information for trade references or suppliers you currently work with..."
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account & Submitting Application...' : 'Create Account & Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResellerApplication