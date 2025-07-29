import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import BlogList from './BlogList'
import EditClientModal from './EditClientModal'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiArrowLeft, FiEdit, FiFileText, FiMapPin, FiTag } = FiIcons

const ClientDetail = ({ client, onBack, onClientUpdated }) => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadBlogs()
  }, [client.id])

  const loadBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBlogs(data)
    } catch (error) {
      toast.error('Error loading blogs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateBlog = async () => {
    setGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generateBlog', {
        body: { client_id: client.id }
      })

      if (error) throw error

      toast.success('Blog generated successfully!')
      loadBlogs()
    } catch (error) {
      toast.error('Error generating blog: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {client.business_name}
              </h1>
              <p className="text-gray-600 text-lg">{client.service}</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <SafeIcon icon={FiEdit} className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateBlog}
                disabled={generating}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <SafeIcon icon={FiFileText} className="w-4 h-4" />
                {generating ? 'Generating...' : 'Generate Blog'}
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium text-gray-700">Location</span>
              </div>
              <p className="text-gray-600">{client.city}</p>
              {client.areas?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Service Areas:</p>
                  <div className="flex flex-wrap gap-1">
                    {client.areas.map((area, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center mb-2">
                <SafeIcon icon={FiTag} className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium text-gray-700">Keywords</span>
              </div>
              {client.keywords?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {client.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No keywords added</p>
              )}
            </div>

            <div>
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-700">Tone</span>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                {client.tone || 'Professional'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <BlogList 
        blogs={blogs} 
        loading={loading} 
        onBlogUpdated={loadBlogs}
        clientId={client.id}
      />

      <EditClientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        client={client}
        onClientUpdated={onClientUpdated}
      />
    </div>
  )
}

export default ClientDetail