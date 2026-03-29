import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } : {}}
      className={`
        bg-white dark:bg-gray-800 rounded-2xl border border-gray-200
        dark:border-gray-700 shadow-sm ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
