import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import ToastContainer from '../ui/Toast'
import { useTheme } from '../../contexts/ThemeContext'

export default function Layout() {
  const { backgroundStyle } = useTheme()

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500"
      style={backgroundStyle}
    >
      <Sidebar />
      <div className="md:ml-64">
        <Navbar />
        <main className="px-4 md:px-6 py-6 pb-24 md:pb-6 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
