import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  Bell,
  Menu,
  X,
  Brain,
  Sparkles,
  Shield,
  Zap,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import { useStore } from '../store/useStore'
import Button from './ui/Button'
import ChatWidget from './chat/ChatWidget'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Colaboradores', href: '/employees', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Orçamento', href: '/budget', icon: DollarSign },
  { name: 'Promoções', href: '/promotions', icon: TrendingUp },
  { name: 'Relatórios', href: '/reports', icon: FileText },
  { name: 'Alertas', href: '/alerts', icon: Bell },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { unreadAlertsCount, employees } = useStore()

  const currentPage = navigation.find(item => item.href === location.pathname)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              ReconheceAI
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-r-2 border-primary-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 transition-colors ${
                  isActive ? 'text-primary-600' : 'group-hover:text-gray-700'
                }`} />
                {item.name}
                {item.name === 'Alertas' && unreadAlertsCount > 0 && (
                  <span className="ml-auto bg-gradient-to-r from-danger-500 to-danger-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center animate-pulse shadow-sm">
                    {unreadAlertsCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Sistema Online</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span className="text-primary-600 font-medium">IA Generativa Ativa</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="h-4 w-4 text-success-500" />
              <span className="text-success-600 font-medium">{employees.length} Colaboradores</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex h-16 items-center px-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-sm">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                ReconheceAI
              </span>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-r-2 border-primary-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-colors ${
                    isActive ? 'text-primary-600' : 'group-hover:text-gray-700'
                  }`} />
                  {item.name}
                  {item.name === 'Alertas' && unreadAlertsCount > 0 && (
                    <span className="ml-auto bg-gradient-to-r from-danger-500 to-danger-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center animate-pulse shadow-sm">
                      {unreadAlertsCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium">Sistema Online</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary-500" />
                <span className="text-primary-600 font-medium">IA Generativa Ativa</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4 text-success-500" />
                <span className="text-success-600 font-medium">{employees.length} Colaboradores</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Zap className="h-4 w-4 text-warning-500" />
                <span className="text-warning-600 font-medium">Chat IA Disponível</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <div className="flex items-center space-x-3">
                {currentPage?.icon && (
                  <currentPage.icon className="h-5 w-5 text-gray-400" />
                )}
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentPage?.name || 'Dashboard'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-success-50 rounded-full">
                  <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-success-700">Online</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary-50 rounded-full">
                  <Brain className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">IA Ativa</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}