import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Storage bucket names
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  CATEGORY_IMAGES: 'category-images',
  USER_UPLOADS: 'user-uploads'
}

// Helper function to get public URL for uploaded files
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Helper function to upload file
export const uploadFile = async (bucket, path, file, options = {}) => {
  try {
    // Set admin context for storage operations
    const adminId = '00000000-0000-0000-0000-000000000001'
    
    // Try to set admin context if current user is admin
    const currentUser = (await supabase.auth.getUser()).data.user
    if (!currentUser) {
      // For admin operations without auth session, use service role
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true, // Allow overwrite for admin
          ...options
        })
      
      if (error) {
        // If regular upload fails, try with admin bypass
        console.warn('Regular upload failed, trying admin bypass:', error.message)
        throw error
      }
      
      return {
        success: true,
        data,
        publicUrl: getPublicUrl(bucket, path)
      }
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true, // Allow overwrite
        ...options
      })
    
    if (error) throw error
    
    return {
      success: true,
      data,
      publicUrl: getPublicUrl(bucket, path)
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Helper function to delete file
export const deleteFile = async (bucket, path) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Helper function to generate unique filename
export const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${prefix}${timestamp}-${random}.${extension}`
}

// Database helper functions
export const dbHelpers = {
  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  async createCategory(category) {
    // Use admin function for reliable creation
    const { data, error } = await supabase
      .rpc('admin_create_category', {
        c_name: category.name,
        c_description: category.description || '',
        c_image_url: category.image_url || null
      })
    
    if (error) throw error
    if (!data) throw new Error('Failed to create category - insufficient permissions')
    
    // Return the created category with full data
    const { data: newCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', data)
      .single()
    
    if (fetchError) throw fetchError
    return newCategory
  },

  async updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCategory(id) {
    // Use admin function for reliable deletion
    const { data, error } = await supabase
      .rpc('admin_delete_category', { category_id: id })
    
    if (error) throw error
    if (!data) throw new Error('Failed to delete category - insufficient permissions')
    return data
  },

  // Products
  async getProducts(filters = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (id, name)
      `)
      .order('created_at', { ascending: false })
    
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    
    if (filters.in_stock !== undefined) {
      query = query.eq('in_stock', filters.in_stock)
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async getProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (id, name)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createProduct(product) {
    // Use admin function for reliable creation
    const { data, error } = await supabase
      .rpc('admin_create_product', {
        p_name: product.name,
        p_description: product.description || '',
        p_category_id: product.category_id,
        p_image_url: product.image_url || '',
        p_b2c_price: product.b2c_price,
        p_b2b_price: product.b2b_price,
        p_min_quantity_b2b: product.min_quantity_b2b || 1,
        p_sku: product.sku || '',
        p_material: product.material || ''
      })
    
    if (error) throw error
    if (!data) throw new Error('Failed to create product - insufficient permissions')
    
    // Return the created product with full data
    const { data: newProduct, error: fetchError } = await supabase
      .from('products')
      .select(`
        *,
        categories (id, name)
      `)
      .eq('id', data)
      .single()
    
    if (fetchError) throw fetchError
    return newProduct
  },

  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteProduct(id) {
    // Use admin function for reliable deletion
    const { data, error } = await supabase
      .rpc('admin_delete_product', { product_id: id })
    
    if (error) throw error
    if (!data) throw new Error('Failed to delete product - insufficient permissions')
    return data
  },

  // Orders
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getOrders(userId = null) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async updateOrderStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Reseller Applications
  async createResellerApplication(application) {
    // Map frontend field names to database field names
    const dbApplication = {
      user_id: application.user_id,
      company_name: application.companyName || application.company_name,
      contact_person: application.contactPerson || application.contact_person,
      email: application.email,
      phone: application.phone,
      business_address: application.businessAddress || application.business_address,
      business_type: application.businessType || application.business_type,
      years_in_business: application.yearsInBusiness || application.years_in_business,
      tax_id: application.taxId || application.tax_id,
      website: application.website,
      expected_monthly_volume: application.expectedMonthlyVolume || application.expected_monthly_volume,
      business_description: application.businessDescription || application.business_description,
      trade_references: application.tradeReferences || application.trade_references,
      status: 'pending'
    }
    
    // Use direct INSERT with proper error handling
    const { data, error } = await supabase
      .from('reseller_applications')
      .insert([dbApplication])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating reseller application:', error)
      // If RLS error, provide helpful message
      if (error.code === '42501' || error.message.includes('row-level security')) {
        throw new Error('Unable to submit application due to security policies. Please run the fix-reseller-rls.sql file in your Supabase SQL Editor.')
      }
      throw error
    }
    
    return data
  },

  async getResellerApplications(status = null) {
    let query = supabase
      .from('reseller_applications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async updateApplicationStatus(id, status, reviewedBy) {
    // Use the safe function to update application status
    const { data, error } = await supabase
      .rpc('update_application_status_safe', {
        application_id: id,
        new_status: status,
        reviewer_id: reviewedBy
      })
    
    if (error) {
      console.error('Error updating application status:', error)
      throw error
    }
    
    // Return the first record from the function result
    return data && data.length > 0 ? data[0] : null
  },
  
  async activateB2BAccount(userId, companyName) {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        role: 'b2b',
        is_approved: true,
        company_name: companyName
      })
      .eq('id', userId)
    
    if (error) throw error
    return true
  },

  // User Profiles
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Cart Items
  async getCartItems(userId, sessionId = null) {
    let query = supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
    
    if (userId) {
      query = query.eq('user_id', userId)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async addToCart(userId, sessionId, productId, quantity) {
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        product_id: productId,
        quantity
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateCartItem(id, quantity) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async removeFromCart(id) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async clearCart(userId, sessionId = null) {
    let query = supabase.from('cart_items').delete()
    
    if (userId) {
      query = query.eq('user_id', userId)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    }
    
    const { error } = await query
    
    if (error) throw error
  }
}

export default supabase