import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMapPin, FiTag, FiCalendar, FiArrowRight } = FiIcons

const ClientCard = ({ client, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(client)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {client.business_name}
          </h3>
          <p className="text-gray-600 text-sm">
            {client.service}
          </p>
        </div>
        <SafeIcon icon={FiArrowRight} className="text-gray-400 w-5 h-5" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-2" />
          <span>{client.city}</span>
          {client.areas?.length > 0 && (
            <span className="ml-1">
              + {client.areas.length} areas
            </span>
          )}
        </div>

        {client.keywords?.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <SafeIcon icon={FiTag} className="w-4 h-4 mr-2" />
            <span>{client.keywords.length} keywords</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
          <span>Created {format(new Date(client.created_at), 'MMM d, yyyy')}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          {client.tone || 'Professional'}
        </span>
      </div>
    </motion.div>
  )
}

export default ClientCard