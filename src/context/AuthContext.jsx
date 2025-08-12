import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const MOCK_ADMIN = {
  username: 'admin',
  password: 'admin123',
  role: 'admin'
}

// Mock B2B users - in real app, this would come from backend
const MOCK_B2B_USERS = [
  {
    id: 1,
    username: 'reseller1',
    password: 'pass123',
    role: 'b2b',
    companyName: 'ABC Jewelry Store',
    approved: true
  },
  {
    id: 2,
    username: 'reseller2',
    password: 'pass456',
    role: 'b2b',
    companyName: 'XYZ Gems',
    approved: true
  }
]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (username, password, role = 'b2b') => {
    if (role === 'admin') {
      if (username === MOCK_ADMIN.username && password === MOCK_ADMIN.password) {
        const userData = { ...MOCK_ADMIN }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        return { success: true }
      }
      return { success: false, message: 'Invalid admin credentials' }
    }

    if (role === 'b2b') {
      const b2bUser = MOCK_B2B_USERS.find(
        user => user.username === username && user.password === password && user.approved
      )
      if (b2bUser) {
        const userData = { ...b2bUser }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        return { success: true }
      }
      return { success: false, message: 'Invalid B2B credentials or account not approved' }
    }

    return { success: false, message: 'Invalid role' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAdmin = () => {
    return user && user.role === 'admin'
  }

  const isB2B = () => {
    return user && user.role === 'b2b'
  }

  const value = {
    user,
    login,
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