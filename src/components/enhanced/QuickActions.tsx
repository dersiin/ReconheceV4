import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Download, 
  Upload, 
  Settings, 
  BarChart3, 
  Users, 
  AlertTriangle,
  FileText,
  Zap,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface QuickActionsProps {
  className?: string
}

export default function QuickActions({ className }: QuickActionsProps) {
  const actions = [
    {
      label: 'Novo Relatório',
      icon: FileText,
      href: '/reports',
      color: 'primary',
      description: 'Gerar relatório personalizado'
    },
    {
      label: 'Análise Rápida',
      icon: Zap,
      href: '/analytics',
      color: 'warning',
      description: 'Insights instantâneos'
    },
    {
      label: 'Gestão Orçamento',
      icon: DollarSign,
      href: '/budget',
      color: 'success',
      description: 'Controle orçamentário'
    },
    {
      label: 'Promoções',
      icon: TrendingUp,
      href: '/promotions',
      color: 'purple',
      description: 'Candidatos a promoção'
    },
    {
      label: 'Ver Alertas',
      icon: AlertTriangle,
      href: '/alerts',
      color: 'danger',
      description: 'Revisar alertas críticos'
    },
    {
      label: 'Configurações',
      icon: Settings,
      href: '/settings',
      color: 'neutral',
      description: 'Ajustar parâmetros'
    }
  ]

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              to={action.href}
              className="group"
            >
              <div className={`p-4 rounded-lg border-2 border-gray-200 hover:border-${action.color}-300 transition-all duration-200 hover:shadow-md group-hover:scale-105`}>
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-2 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                    <Icon className={`h-5 w-5 text-${action.color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}