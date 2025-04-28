"use client"

import { createContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  // Load user from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setIsAuthenticated(true)
      // Set token in axios headers
      api.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.token}`
    }
    setLoading(false)
  }, [])

  // Register user
  const register = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post("/api/auth/register", userData)
      const data = response.data

      localStorage.setItem("user", JSON.stringify(data))
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`

      setUser(data)
      setIsAuthenticated(true)
      setLoading(false)
      navigate("/")
      return data
    } catch (err) {
      setLoading(false)
      const message = err.response?.data?.message || "Registration failed"
      setError(message)
      throw new Error(message)
    }
  }

  // Login user
  const login = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post("/api/auth/login", userData)
      const data = response.data

      localStorage.setItem("user", JSON.stringify(data))
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`

      setUser(data)
      setIsAuthenticated(true)
      setLoading(false)
      navigate("/")
      return data
    } catch (err) {
      setLoading(false)
      const message = err.response?.data?.message || "Login failed"
      setError(message)
      throw new Error(message)
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem("user")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
    setIsAuthenticated(false)
    navigate("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
