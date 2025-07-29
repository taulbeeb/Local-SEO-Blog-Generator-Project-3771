import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import BlogPreviewModal from './BlogPreviewModal'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiFileText, FiCopy, FiSend, FiEye, FiCalendar, FiTag } = FiIcons

const BlogList = ({ blogs, loading, onBlogUpdated, clientId }) => {
  const [selectedBlog, setSelectedBlog] = useState(null)

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('Blog content copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy content')
    }
  }

  const sendToN8n = async (blog) => {
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      if (!webhookUrl) {
        toast.error('N8N webhook URL not configured')
        return
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blog_id: blog.id,
          client_id: blog.client_id,
          title: blog.title,
          content: blog.content
        })
      })

      if (response.ok) {
        toast.success('Blog sent to N8N successfully!')
      } else {
        throw new Error('Failed to send to N8N')
      }
    } catch (error) {
      toast.error('Error sending to N8N: ' + error.message)
    }
  }

  const regenerateBlog = async (blogId) => {
    try {
      const { data, error } = await supabase.functions.invoke('regenerateBlog', {
        body: { blog_id: blogId, client_id: clientId }
      })

      if (error) throw error

      toast.success('Blog regenerated successfully!')
      onBlogUpdated()
    } catch (error) {
      toast.error('Error regenerating blog: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading blogs...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Generated Blogs</h2>
        </div>

        {blogs.length === 0 ? (
          <div className="p-8 text-center">
            <SafeIcon icon={FiFileText} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No blogs generated yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Click "Generate Blog" to create your first SEO-optimized blog post
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {blogs.map((blog) => (
              <div key={blog.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {blog.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                        {format(new Date(blog.created_at), 'MMM d, yyyy')}
                      </div>
                      {blog.keywords?.length > 0 && (
                        <div className="flex items-center">
                          <SafeIcon icon={FiTag} className="w-4 h-4 mr-1" />
                          {blog.keywords.length} keywords
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        blog.status === 'posted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedBlog(blog)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Preview"
                    >
                      <SafeIcon icon={FiEye} className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(blog.content)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="Copy"
                    >
                      <SafeIcon icon={FiCopy} className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => sendToN8n(blog)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                      title="Send to N8N"
                    >
                      <SafeIcon icon={FiSend} className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {blog.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {blog.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-sm text-gray-600 mb-4">
                  {blog.content.substring(0, 200)}...
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => regenerateBlog(blog.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BlogPreviewModal
        blog={selectedBlog}
        isOpen={!!selectedBlog}
        onClose={() => setSelectedBlog(null)}
      />
    </>
  )
}

export default BlogList