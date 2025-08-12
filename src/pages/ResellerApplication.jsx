import React, { useState } from 'react'
import { Building, Mail, Phone, FileText, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const ResellerApplication = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
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
    references: ''
  })
  
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const { error: insertError } = await supabase
        .from('reseller_applications')
        .insert([{
          company_name: formData.companyName,
          contact_person: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          business_address: formData.businessAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          business_type: formData.businessType,
          years_in_business: formData.yearsInBusiness,
          tax_id: formData.taxId,
          website: formData.website,
          expected_monthly_volume: formData.expectedMonthlyVolume,
          business_description: formData.businessDescription,
          references: formData.references
        }])

      if (insertError) throw insertError

      setIsSubmitted(true)
    } catch (err) {
      setError(err.message)
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
            <h2>Application Submitted Successfully!</h2>
            <p>
              Thank you for your interest in becoming a reseller partner. 
              We have received your application and will review it within 2-3 business days.
            </p>
            <div className="next-steps">
              <h3>What happens next?</h3>
              <ol>
                <li>Our team will review your application</li>
                <li>We may contact you for additional information</li>
                <li>Upon approval, you'll receive login credentials via email</li>
                <li>You'll gain access to wholesale pricing and B2B features</li>
              </ol>
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
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

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
              <label htmlFor="references">Trade References (Optional)</label>
              <textarea
                id="references"
                name="references"
                value={formData.references}
                onChange={handleInputChange}
                rows="3"
                placeholder="Please provide contact information for trade references or suppliers you currently work with..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResellerApplication