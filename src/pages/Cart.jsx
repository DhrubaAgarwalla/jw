import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const { isB2B } = useAuth()

  if (items.length === 0) {
    return (
      <div className="cart empty-cart">
        <div className="container">
          <div className="empty-cart-content">
            <ShoppingBag className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          {isB2B() && (
            <div className="b2b-notice">
              <p>🏢 B2B Customer - Wholesale pricing applied</p>
            </div>
          )}
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-category">{item.category}</div>
                </div>

                <div className="item-price">
                  <span className="price">${item.price}</span>
                  {isB2B() && (
                    <span className="price-type">Wholesale</span>
                  )}
                </div>

                <div className="item-quantity">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="quantity-btn"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="item-total">
                  <span className="total-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal ({items.reduce((total, item) => total + item.quantity, 0)} items)</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              
              {isB2B() && (
                <div className="summary-row discount">
                  <span>Wholesale Discount Applied</span>
                  <span>✓</span>
                </div>
              )}
              
              <div className="summary-row total">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="cart-actions">
                <Link to="/checkout" className="btn btn-primary btn-full">
                  Proceed to Checkout
                </Link>
                <button 
                  onClick={clearCart}
                  className="btn btn-secondary btn-full"
                >
                  Clear Cart
                </button>
                <Link to="/products" className="btn btn-outline btn-full">
                  Continue Shopping
                </Link>
              </div>
            </div>

            {isB2B() && (
              <div className="b2b-info">
                <h4>B2B Customer Benefits</h4>
                <ul>
                  <li>Wholesale pricing on all items</li>
                  <li>Priority customer support</li>
                  <li>Flexible payment terms</li>
                  <li>Bulk order discounts</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart