import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import Header from '../components/Layout/Header'
import ClientCard from '../components/Dashboard/ClientCard'
import AddClientModal from '../components/Dashboard/AddClientModal'
import ClientDetail from '../components/Client/ClientDetail'
import SettingsModal from '../components/Settings/SettingsModal'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiPlus, FiUsers } = FiIcons

const Dashboard = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data)
    } catch (error) {
      toast.error('Error loading clients: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClientAdded = (newClient) => {
    setClients(prev => [newClient, ...prev])
    setShowAddModal(false)
  }

  const handleClientUpdated = (updatedClient) => {
    setClients(prev => prev.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ))
    setSelectedClient(updatedClient)
  }

  if (selectedClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onOpenSettings={() => setShowSettings(true)} />
        <ClientDetail
          client={selectedClient}
          onBack={() => setSelectedClient(null)}
          onClientUpdated={handleClientUpdated}
        />
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => setShowSettings(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage your clients and generate SEO-optimized blog content
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Add Client
          </motion.button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading clients...</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiUsers} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first client to generate SEO blogs
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Add Your First Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={setSelectedClient}
              />
            ))}
          </div>
        )}
      </div>

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onClientAdded={handleClientAdded}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}

export default Dashboard