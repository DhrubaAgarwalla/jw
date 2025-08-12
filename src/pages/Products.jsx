import React, { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, Loader, AlertCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { dbHelpers } from '../lib/supabase'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart } = useCart()
  const { isB2B } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Load categories and products in parallel
      const [categoriesData, productsData] = await Promise.all([
        dbHelpers.getCategories(),
        dbHelpers.getProducts({ in_stock: true })
      ])
      
      setCategories(['All', ...categoriesData.map(cat => cat.name)])
      setProducts(productsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.categories?.name === selectedCategory)

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }))
  }

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1
    const isB2BUser = isB2B()
    
    if (isB2BUser && quantity < product.min_quantity_b2b) {
      alert(`Minimum quantity for B2B customers is ${product.min_quantity_b2b}`)
      return
    }

    const price = isB2BUser ? product.b2b_price : product.b2c_price
    addToCart({ 
      ...product, 
      price,
      category: product.categories?.name || 'Uncategorized',
      image: product.image_url
    }, quantity)
    
    // Reset quantity after adding to cart
    setQuantities(prev => ({ ...prev, [product.id]: 1 }))
  }

  if (loading) {
    return (
      <div className="products">
        <div className="container">
          <div className="loading-state">
            <Loader className="spinner" size={48} />
            <h2>Loading Products...</h2>
            <p>Please wait while we fetch our jewelry collection.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="products">
        <div className="container">
          <div className="error-state">
            <AlertCircle className="error-icon" size={48} />
            <h2>Error Loading Products</h2>
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
    <div className="products">
      <div className="container">
        <div className="products-header">
          <h1>Our Jewelry Collection</h1>
          {isB2B() && (
            <div className="b2b-notice">
              <p>🏢 B2B Pricing Active - Wholesale prices and minimum quantities apply</p>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try selecting a different category or check back later.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => {
                  const quantity = quantities[product.id] || 1
                  const isB2BUser = isB2B()
                  const price = isB2BUser ? product.b2b_price : product.b2c_price
                  const minQuantity = isB2BUser ? product.min_quantity_b2b : 1
                  const savings = isB2BUser ? ((product.b2c_price - product.b2b_price) / product.b2c_price * 100).toFixed(0) : 0
                  const totalPrice = price * quantity

                  return (
                    <div key={product.id} className={`product-card ${isB2BUser ? 'b2b-card' : 'b2c-card'}`}>
                      <div className="product-image">
                        <img src={product.image_url} alt={product.name} />
                        {!product.in_stock && <div className="out-of-stock">Out of Stock</div>}
                        {isB2BUser && savings > 0 && (
                          <div className="savings-badge">{savings}% OFF</div>
                        )}
                        {product.sku && (
                          <div className="sku-badge">SKU: {product.sku}</div>
                        )}
                      </div>
                      
                      <div className="product-info">
                        <div className="product-header">
                          <h3 className="product-name">{product.name}</h3>
                          <span className="product-category">{product.categories?.name || 'Uncategorized'}</span>
                        </div>
                        
                        <p className="product-description">{product.description}</p>
                        
                        {product.material && (
                          <div className="product-material">
                            <strong>Material:</strong> {product.material}
                          </div>
                        )}
                        
                        <div className="product-pricing">
                          <div className="price-section">
                            <div className="main-price">
                              <span className="current-price">${price.toFixed(2)}</span>
                              <span className="price-label">{isB2BUser ? 'Wholesale' : 'Retail'}</span>
                            </div>
                            
                            {isB2BUser && (
                              <div className="price-comparison">
                                <span className="original-price">
                                  Retail: ${product.b2c_price.toFixed(2)}
                                </span>
                                <span className="savings-text">
                                  You save ${(product.b2c_price - product.b2b_price).toFixed(2)} per item
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {isB2BUser && (
                            <div className="b2b-info">
                              <div className="min-quantity-info">
                                <span className="min-qty-label">Minimum Order:</span>
                                <span className="min-qty-value">{product.min_quantity_b2b} pieces</span>
                              </div>
                              <div className="bulk-savings">
                                <span className="bulk-text">
                                  Total savings on min. order: ${((product.b2c_price - product.b2b_price) * product.min_quantity_b2b).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="product-actions">
                          <div className="quantity-section">
                            <label className="quantity-label">Quantity:</label>
                            <div className="quantity-selector">
                              <button 
                                onClick={() => handleQuantityChange(product.id, -1)}
                                disabled={quantity <= minQuantity}
                                className="quantity-btn"
                                title="Decrease quantity"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="quantity">{quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(product.id, 1)}
                                className="quantity-btn"
                                title="Increase quantity"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            {isB2BUser && quantity < product.min_quantity_b2b && (
                              <span className="quantity-warning">
                                Minimum {product.min_quantity_b2b} required
                              </span>
                            )}
                          </div>
                          
                          <div className="total-price">
                            <span className="total-label">Total:</span>
                            <span className="total-amount">${totalPrice.toFixed(2)}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.in_stock || (isB2BUser && quantity < product.min_quantity_b2b)}
                            className={`add-to-cart-btn ${isB2BUser ? 'b2b-btn' : 'b2c-btn'}`}
                          >
                            <ShoppingCart size={16} />
                            {isB2BUser ? 'Add to Wholesale Cart' : 'Add to Cart'}
                          </button>
                          
                          {!isB2BUser && (
                            <div className="b2b-promotion">
                              <p>Need wholesale pricing? <a href="/reseller-application">Apply for B2B account</a></p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products