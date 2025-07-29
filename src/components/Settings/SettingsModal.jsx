import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiX, FiSave } = FiIcons

const defaultPrompt = `You are an expert SEO content writer. Write a fully optimized local blog for a business that must rank in Google search, the local Map Pack, and AI tools like Gemini, ChatGPT, and Grok. Make sure this is WordPress-ready with the appropriate heading tags and metadata.

The content must:
• Include @Service + @City in headings and copy
• Use natural language to answer real searcher questions
• Include an FAQ section with long-tail questions
• Use bullet points, lists, short paragraphs
• Mention nearby service areas like @Areas
• Include a strong CTA and local trust signals (reviews, experience, etc.)

Target service: @Service
City: @City
Areas: @Areas
Business: @Business
Tone: @Tone`

const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    prompt_template: defaultPrompt,
    n8n_webhook_url: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
    unlock_api_keys: false
  })
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    if (isOpen && initialLoad) {
      loadSettings()
      setInitialLoad(false)
    }
  }, [isOpen, initialLoad])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setSettings({
          prompt_template: data.prompt_template || defaultPrompt,
          n8n_webhook_url: data.n8n_webhook_url || import.meta.env.VITE_N8N_WEBHOOK_URL || '',
          unlock_api_keys: data.unlock_api_keys || false
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          ...settings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Settings saved successfully!')
      onClose()
    } catch (error) {
      toast.error('Error saving settings: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt Template
                </label>
                <textarea
                  value={settings.prompt_template}
                  onChange={(e) => setSettings(prev => ({ ...prev, prompt_template: e.target.value }))}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter your prompt template..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use variables: @Business, @Service, @City, @Areas, @Tone
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N8N Webhook URL
                </label>
                <input
                  type="url"
                  value={settings.n8n_webhook_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, n8n_webhook_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://your-n8n-instance.com/webhook/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL where generated blogs will be sent
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.unlock_api_keys}
                    onChange={(e) => setSettings(prev => ({ ...prev, unlock_api_keys: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Unlock API Key editing for clients
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  When enabled, clients can edit their OpenAI API keys
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SettingsModal