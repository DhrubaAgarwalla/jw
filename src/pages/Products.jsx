import React, { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, Loader } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addToCart } = useCart()
  const { isB2B } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError

      // Fetch products with category names
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('name')

      if (productsError) throw productsError

      setCategories(categoriesData)
      setProducts(productsData.map(product => ({
        ...product,
        category: product.categories.name
      })))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
    
    if (isB2BUser && quantity < product.min_quantity_b2b) {
      alert(`Minimum quantity for B2B customers is ${product.min_quantity_b2b}`)
      return
    }

    const price = isB2BUser ? product.b2b_price : product.b2c_price
    addToCart({ 
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      image: product.image_url,
      price: parseFloat(price)
    }, quantity)
    
    // Reset quantity after adding to cart
    setQuantities(prev => ({ ...prev, [product.id]: 1 }))
  }

  if (loading) {
    return (
      <div className="products">
        <div className="container">
          <div className="loading-state">
            <Loader className="loading-spinner" />
            <p>Loading products...</p>
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
            <p>Error loading products: {error}</p>
            <button onClick={fetchData} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const categoryOptions = ['All', ...categories.map(cat => cat.name)]

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
          {categoryOptions.map(category => (
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
            const price = isB2BUser ? parseFloat(product.b2b_price) : parseFloat(product.b2c_price)
            const minQuantity = isB2BUser ? product.min_quantity_b2b : 1

            return (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image_url} alt={product.name} />
                  {!product.in_stock && <div className="out-of-stock">Out of Stock</div>}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-pricing">
                    <div className="price">
                      <span className="current-price">${price.toFixed(2)}</span>
                      {isB2BUser && (
                        <span className="original-price">${parseFloat(product.b2c_price).toFixed(2)}</span>
                      )}
                    </div>
                    {isB2BUser && (
                      <div className="min-quantity">
                        Min. Qty: {product.min_quantity_b2b}
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
                      disabled={!product.in_stock || (isB2BUser && quantity < product.min_quantity_b2b)}
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

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products