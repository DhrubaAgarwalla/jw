import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, FileText, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import jsPDF from 'jspdf'

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart()
  const { isB2B, user } = useAuth()
  const navigate = useNavigate()
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Seller WhatsApp number - you can change this
  const SELLER_WHATSAPP = '+1234567890'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    let yPosition = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text('JEWELRY STORE', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10
    
    doc.setFontSize(14)
    doc.text('Order Invoice', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Customer Information
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('CUSTOMER INFORMATION:', 20, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Name: ${customerInfo.name}`, 20, yPosition)
    yPosition += 6
    doc.text(`Email: ${customerInfo.email}`, 20, yPosition)
    yPosition += 6
    doc.text(`Phone: ${customerInfo.phone}`, 20, yPosition)
    yPosition += 6
    doc.text(`Address: ${customerInfo.address}`, 20, yPosition)
    yPosition += 6
    doc.text(`City: ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`, 20, yPosition)
    yPosition += 15

    // Order Details
    doc.setFontSize(12)
    doc.text('ORDER DETAILS:', 20, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    if (isB2B) {
      doc.text(`Customer Type: B2B Wholesale (${user?.companyName})`, 20, yPosition)
      yPosition += 8
    } else {
      doc.text('Customer Type: B2C Retail', 20, yPosition)
      yPosition += 8
    }
    
    doc.text('Date: ' + new Date().toLocaleDateString(), 20, yPosition)
    yPosition += 15

    // Items Table Header
    doc.setFontSize(10)
    doc.text('Item', 20, yPosition)
    doc.text('Qty', 120, yPosition)
    doc.text('Price', 140, yPosition)
    doc.text('Total', 170, yPosition)
    yPosition += 8
    
    // Draw line
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 8

    // Items
    items.forEach(item => {
      const itemTotal = (item.price * item.quantity).toFixed(2)
      
      doc.text(item.name.substring(0, 30), 20, yPosition)
      doc.text(item.quantity.toString(), 120, yPosition)
      doc.text(`$${item.price}`, 140, yPosition)
      doc.text(`$${itemTotal}`, 170, yPosition)
      yPosition += 6
    })

    // Total
    yPosition += 10
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 8
    
    doc.setFontSize(12)
    doc.text(`TOTAL AMOUNT: $${getTotalPrice().toFixed(2)}`, 20, yPosition)
    
    if (customerInfo.notes) {
      yPosition += 20
      doc.setFontSize(10)
      doc.text('NOTES:', 20, yPosition)
      yPosition += 8
      doc.text(customerInfo.notes, 20, yPosition)
    }

    return doc
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Generate PDF
      const pdf = generatePDF()
      const pdfBlob = pdf.output('blob')
      
      // Create order summary for WhatsApp
      const orderSummary = `🛍️ *NEW JEWELRY ORDER*\n\n` +
        `👤 *Customer:* ${customerInfo.name}\n` +
        `📧 *Email:* ${customerInfo.email}\n` +
        `📱 *Phone:* ${customerInfo.phone}\n` +
        `🏠 *Address:* ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}\n\n` +
        `${isB2B ? `🏢 *B2B Customer:* ${user?.companyName}\n\n` : ''}` +
        `📦 *Items Ordered:*\n` +
        items.map(item => 
          `• ${item.name} - Qty: ${item.quantity} - $${item.price} each`
        ).join('\n') +
        `\n\n💰 *Total Amount: $${getTotalPrice().toFixed(2)}*\n\n` +
        `${customerInfo.notes ? `📝 *Notes:* ${customerInfo.notes}\n\n` : ''}` +
        `📄 *Detailed invoice PDF will be shared separately*`

      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${SELLER_WHATSAPP.replace('+', '')}?text=${encodeURIComponent(orderSummary)}`
      
      // Clear cart
      clearCart()
      
      // Store order data for confirmation page
      sessionStorage.setItem('lastOrder', JSON.stringify({
        customerInfo,
        items,
        total: getTotalPrice(),
        whatsappUrl,
        isB2B
      }))
      
      // Redirect to WhatsApp
      window.open(whatsappUrl, '_blank')
      
      // Navigate to success page
      navigate('/order-success')
      
    } catch (error) {
      console.error('Error processing order:', error)
      alert('There was an error processing your order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="checkout">
      <div className="container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Customer Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Shipping Address</h3>
                
                <div className="form-group">
                  <label htmlFor="address">Street Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={customerInfo.address}
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
                      value={customerInfo.city}
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
                      value={customerInfo.state}
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
                      value={customerInfo.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Additional Notes</h3>
                <div className="form-group">
                  <label htmlFor="notes">Special Instructions (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={customerInfo.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any special requests or delivery instructions..."
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  'Processing Order...'
                ) : (
                  <>
                    <Phone className="btn-icon" />
                    Complete Order via WhatsApp
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="order-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              {items.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="item-total">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="summary-total">
                <span>Total: ${getTotalPrice().toFixed(2)}</span>
              </div>
              
              {isB2B && (
                <div className="b2b-notice">
                  <CheckCircle className="check-icon" />
                  <span>B2B Wholesale Pricing Applied</span>
                </div>
              )}
            </div>

            <div className="process-info">
              <h4>What happens next?</h4>
              <ol>
                <li>Your order details will be sent via WhatsApp</li>
                <li>You'll receive a detailed PDF invoice</li>
                <li>Our team will contact you for payment</li>
                <li>Order will be processed and shipped</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout