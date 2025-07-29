import React, { useEffect, useState } from 'react'
import { HashRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginForm from './components/Auth/LoginForm'
import Dashboard from './pages/Dashboard'
import './index.css'

// App content with error boundary
function AppContent() {
  const { user, loading } = useAuth()
  const [error, setError] = useState(null)

  // Error handler for runtime errors
  useEffect(() => {
    const handleError = (event) => {
      console.error('Runtime error caught:', event.error)
      setError(event.error || new Error('Unknown application error'))
      event.preventDefault()
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Application Error</h2>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
            <p className="text-sm font-mono text-red-700">{error.toString()}</p>
          </div>
          <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <LoginForm />
}

function App() {
  // Log environment info for debugging
  useEffect(() => {
    console.log('App initialized')
    console.log('Environment:', import.meta.env.MODE)
    console.log('Base URL:', window.location.href)
  }, [])

  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </Router>
  )
}

export default App