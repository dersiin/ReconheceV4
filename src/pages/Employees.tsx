import React, { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import EmployeeCard from '../components/enhanced/EmployeeCard'
import EmployeeFilters from '../components/enhanced/EmployeeFilters'
import StatsOverview from '../components/enhanced/StatsOverview'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Users, Filter, TrendingUp, Award } from 'lucide-react'

export default function Employees() {
  const { employees, loading, fetchEmployees } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterPerformance, setFilterPerformance] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Get unique departments
  const departments = [...new Set(employees.map(emp => emp.area).filter(Boolean))]

  // Filter and sort employees
  const filteredEmployees = employees
    .filter(emp => {
      const matchesSearch = emp.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.area?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRisk = filterRisk === 'all' || emp.riscoPerdaTexto?.toLowerCase() === filterRisk
      const matchesDepartment = filterDepartment === 'all' || emp.area === filterDepartment
      const matchesPerformance = filterPerformance === 'all' || emp.desempenhoTexto?.toLowerCase() === filterPerformance
      return matchesSearch && matchesRisk && matchesDepartment && matchesPerformance
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score
        case 'name':
          return (a.nome || '').localeCompare(b.nome || '')
        case 'risk':
          const riskOrder = { 'alto': 3, 'médio': 2, 'baixo': 1 }
          return (riskOrder[b.riscoPerdaTexto?.toLowerCase() as keyof typeof riskOrder] || 0) - 
                 (riskOrder[a.riscoPerdaTexto?.toLowerCase() as keyof typeof riskOrder] || 0)
        case 'performance':
          const perfOrder = { 'excepcional': 6, 'excelente': 5, 'acima do esperado': 4, 'bom': 3, 'regular': 2, 'abaixo do esperado': 1 }
          return (perfOrder[b.desempenhoTexto?.toLowerCase() as keyof typeof perfOrder] || 0) - 
                 (perfOrder[a.desempenhoTexto?.toLowerCase() as keyof typeof perfOrder] || 0)
        case 'department':
          return (a.area || '').localeCompare(b.area || '')
        case 'tenure':
          return b.tempoDeCasa - a.tempoDeCasa
        default:
          return 0
      }
    })

  const riskDistribution = {
    alto: employees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'alto').length,
    medio: employees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'médio').length,
    baixo: employees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'baixo').length,
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setFilterRisk('all')
    setFilterDepartment('all')
    setFilterPerformance('all')
    setSortBy('score')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Carregando colaboradores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Aprimorado */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestão de Colaboradores</h1>
            <p className="text-primary-100">
              Analise, gerencie e otimize o desempenho de toda a equipe
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{employees.length}</div>
              <div className="text-sm text-primary-200">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{riskDistribution.alto}</div>
              <div className="text-sm text-primary-200">Alto Risco</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {employees.filter(e => e.score >= 400).length}
              </div>
              <div className="text-sm text-primary-200">Top Performers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Avançados */}
      <EmployeeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterRisk={filterRisk}
        setFilterRisk={setFilterRisk}
        filterDepartment={filterDepartment}
        setFilterDepartment={setFilterDepartment}
        filterPerformance={filterPerformance}
        setFilterPerformance={setFilterPerformance}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        departments={departments}
        onReset={handleResetFilters}
      />

      {/* Stats Overview Melhorado */}
      <StatsOverview
        totalEmployees={employees.length}
        filteredCount={filteredEmployees.length}
        riskDistribution={riskDistribution}
      />

      {/* Lista de Colaboradores */}
      {filteredEmployees.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
        }>
          {filteredEmployees.map((employee) => (
            <EmployeeCard 
              key={employee.id} 
              employee={employee} 
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Filter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador encontrado</h3>
          <p className="text-gray-600 mb-4">Tente ajustar os filtros de busca</p>
          <button
            onClick={handleResetFilters}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  )
}