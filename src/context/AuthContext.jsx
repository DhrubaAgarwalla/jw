import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loginAdmin = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Check if user is admin
      if (data.user?.user_metadata?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin privileges required.')
      }

      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const loginB2B = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Check if user is approved B2B user
      const { data: b2bUser, error: b2bError } = await supabase
        .from('b2b_users')
        .select('*, reseller_applications(company_name)')
        .eq('user_id', data.user.id)
        .eq('approved', true)
        .single()

      if (b2bError || !b2bUser) {
        await supabase.auth.signOut()
        throw new Error('B2B account not found or not approved')
      }

      return { success: true, b2bData: b2bUser }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const isAdmin = () => {
    return user?.user_metadata?.role === 'admin'
  }

  const isB2B = () => {
    return user?.user_metadata?.role === 'b2b'
  }

  const value = {
    user,
    loginAdmin,
    loginB2B,
    logout,
    isAdmin,
    isB2B,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}