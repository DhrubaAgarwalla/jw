import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, dbHelpers } from '../lib/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Check for stored admin session first
    const storedAdminSession = localStorage.getItem('admin_session')
    if (storedAdminSession) {
      try {
        const adminData = JSON.parse(storedAdminSession)
        setUser(adminData)
        setProfile({
          id: adminData.id,
          email: adminData.email,
          full_name: adminData.fullName,
          role: adminData.role,
          is_approved: adminData.isApproved
        })
        setLoading(false)
        return
      } catch (error) {
        localStorage.removeItem('admin_session')
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      setLoading(true)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 10000)
      )
      
      const profilePromise = dbHelpers.getUserProfile(userId)
      const userProfile = await Promise.race([profilePromise, timeoutPromise])
      
      if (!userProfile) {
        throw new Error('No profile data found')
      }
      
      setProfile(userProfile)
      setUser({
        id: userId,
        email: userProfile.email,
        role: userProfile.role,
        companyName: userProfile.company_name,
        fullName: userProfile.full_name,
        isApproved: userProfile.is_approved
      })
      
      // Return the profile data for use in login function
      return userProfile
    } catch (error) {
      console.error('Error loading user profile:', error)
      setProfile(null)
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      // For B2B users, skip email verification since manual approval is required
      const isB2BSignup = userData.companyName || userData.businessType
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || '',
            company_name: userData.companyName || ''
          },
          // Skip email confirmation for B2B users
          emailRedirectTo: isB2BSignup ? undefined : window.location.origin
        }
      })

      if (error) throw error

      // For B2B users, manually confirm email since admin approval is the verification
      if (isB2BSignup && data.user && !data.user.email_confirmed_at) {
        try {
          // This requires admin privileges, so we'll handle it in the backend
          console.log('B2B user created - email verification skipped for manual approval process')
        } catch (confirmError) {
          console.warn('Could not auto-confirm B2B user email:', confirmError)
          // Continue anyway as admin approval is the main verification
        }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      setSession(null)
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, message: error.message }
    }
  }

  // Legacy login method for backward compatibility
  const login = async (email, password, role = 'customer') => {
    // For admin login, check if it's the default admin
    if (role === 'admin' && email === 'admin' && password === 'admin123') {
      // Create a persistent admin session
      const mockAdmin = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@jewelrystore.com',
        role: 'admin',
        fullName: 'Admin User',
        isApproved: true
      }
      setUser(mockAdmin)
      setProfile({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@jewelrystore.com',
        full_name: 'Admin User',
        role: 'admin',
        is_approved: true
      })
      // Store admin session in localStorage for persistence
      localStorage.setItem('admin_session', JSON.stringify(mockAdmin))
      return { success: true }
    }

    // For B2B and regular users, use Supabase auth
    const result = await signIn(email, password)
    
    if (result.success && role === 'b2b') {
      // Wait for profile to load after successful sign in
      try {
        const userProfile = await loadUserProfile(result.data.user.id)
        
        if (userProfile && userProfile.role === 'b2b') {
          if (!userProfile.is_approved) {
            return {
              success: false,
              message: 'Your B2B account is pending approval. Please wait for admin confirmation.'
            }
          }
          return { success: true }
        } else {
          return {
            success: false,
            message: 'This account is not registered for B2B access. Please apply for a B2B account first.'
          }
        }
      } catch (profileError) {
        console.error('Error loading user profile:', profileError)
        // If profile doesn't exist, user needs to apply for B2B
        return {
          success: false,
          message: 'No B2B profile found. Please apply for a B2B account first.'
        }
      }
    }
    
    return result
  }

  const logout = async () => {
    // Clear admin session if it exists
    localStorage.removeItem('admin_session')
    setUser(null)
    setProfile(null)
    setSession(null)
    
    // Also sign out from Supabase if there's a session
    if (session) {
      return await signOut()
    }
    
    return { success: true }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error('No user logged in')
      
      const updatedProfile = await dbHelpers.updateUserProfile(user.id, updates)
      setProfile(updatedProfile)
      
      // Update user state
      setUser(prev => ({
        ...prev,
        ...updates,
        companyName: updates.company_name || prev.companyName,
        fullName: updates.full_name || prev.fullName,
        isApproved: updates.is_approved !== undefined ? updates.is_approved : prev.isApproved
      }))
      
      return { success: true, data: updatedProfile }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, message: error.message }
    }
  }

  const isAdmin = () => {
    return user && user.role === 'admin'
  }

  const isB2B = () => {
    return user && user.role === 'b2b' && user.isApproved
  }

  const isAuthenticated = () => {
    return !!session && !!user
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    login, // Legacy method
    logout, // Legacy method
    updateProfile,
    isAdmin,
    isB2B,
    isAuthenticated
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