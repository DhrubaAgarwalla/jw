import React, { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

// Mock product data - in real app, this would come from backend
const MOCK_PRODUCTS = [
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
  },
  {
    id: 3,
    name: 'Gold Hoop Earrings',
    category: 'Earrings',
    description: 'Classic 14k gold hoop earrings, perfect for everyday wear',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    b2cPrice: 180,
    b2bPrice: 130,
    minQuantityB2B: 10,
    inStock: true
  },
  {
    id: 4,
    name: 'Emerald Tennis Bracelet',
    category: 'Bracelets',
    description: 'Stunning emerald tennis bracelet in 18k yellow gold',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
    b2cPrice: 1200,
    b2bPrice: 850,
    minQuantityB2B: 3,
    inStock: true
  },
  {
    id: 5,
    name: 'Sapphire Pendant',
    category: 'Necklaces',
    description: 'Blue sapphire pendant with diamond accents on white gold chain',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    b2cPrice: 800,
    b2bPrice: 580,
    minQuantityB2B: 4,
    inStock: true
  },
  {
    id: 6,
    name: 'Wedding Band Set',
    category: 'Rings',
    description: 'Matching his and hers wedding bands in platinum',
    image: 'https://images.unsplash.com/photo-1544376664-80b17f09d399?w=400',
    b2cPrice: 1500,
    b2bPrice: 1100,
    minQuantityB2B: 2,
    inStock: true
  }
]

const Products = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [quantities, setQuantities] = useState({})
  const { addToCart } = useCart()
  const { isB2B } = useAuth()

  const categories = ['All', ...new Set(products.map(product => product.category))]

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }))
  }

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1
    const isB2BUser = isB2B()
    
    if (isB2BUser && quantity < product.minQuantityB2B) {
      alert(`Minimum quantity for B2B customers is ${product.minQuantityB2B}`)
      return
    }

    const price = isB2BUser ? product.b2bPrice : product.b2cPrice
    addToCart({ ...product, price }, quantity)
    
    // Reset quantity after adding to cart
    setQuantities(prev => ({ ...prev, [product.id]: 1 }))
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
        <div className="products-grid">
          {filteredProducts.map(product => {
            const quantity = quantities[product.id] || 1
            const isB2BUser = isB2B()
            const price = isB2BUser ? product.b2bPrice : product.b2cPrice
            const minQuantity = isB2BUser ? product.minQuantityB2B : 1

            return (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  {!product.inStock && <div className="out-of-stock">Out of Stock</div>}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-pricing">
                    <div className="price">
                      <span className="current-price">${price}</span>
                      {isB2BUser && (
                        <span className="original-price">${product.b2cPrice}</span>
                      )}
                    </div>
                    {isB2BUser && (
                      <div className="min-quantity">
                        Min. Qty: {product.minQuantityB2B}
                      </div>
                    )}
                  </div>

                  <div className="product-actions">
                    <div className="quantity-selector">
                      <button 
                        onClick={() => handleQuantityChange(product.id, -1)}
                        disabled={quantity <= minQuantity}
                        className="quantity-btn"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(product.id, 1)}
                        className="quantity-btn"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock || (isB2BUser && quantity < product.minQuantityB2B)}
                      className="add-to-cart-btn"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Products