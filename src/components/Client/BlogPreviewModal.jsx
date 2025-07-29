import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiX, FiCalendar, FiTag } = FiIcons

const BlogPreviewModal = ({ blog, isOpen, onClose }) => {
  if (!blog) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{blog.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
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
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {blog.keywords?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Keywords:</h3>
                  <div className="flex flex-wrap gap-1">
                    {blog.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default BlogPreviewModal