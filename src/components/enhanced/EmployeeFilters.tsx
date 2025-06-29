import React from 'react'
import { Search, Filter, RotateCcw, Grid, List, SortAsc } from 'lucide-react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

interface EmployeeFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterRisk: string
  setFilterRisk: (risk: string) => void
  filterDepartment: string
  setFilterDepartment: (dept: string) => void
  filterPerformance: string
  setFilterPerformance: (perf: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  departments: string[]
  onReset: () => void
}

export default function EmployeeFilters({
  searchTerm,
  setSearchTerm,
  filterRisk,
  setFilterRisk,
  filterDepartment,
  setFilterDepartment,
  filterPerformance,
  setFilterPerformance,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  departments,
  onReset
}: EmployeeFiltersProps) {
  const riskOptions = [
    { value: 'all', label: 'Todos os níveis' },
    { value: 'alto', label: 'Alto Risco' },
    { value: 'médio', label: 'Médio Risco' },
    { value: 'baixo', label: 'Baixo Risco' }
  ]

  const departmentOptions = [
    { value: 'all', label: 'Todos os departamentos' },
    ...departments.map(dept => ({ value: dept, label: dept }))
  ]

  const performanceOptions = [
    { value: 'all', label: 'Todas as performances' },
    { value: 'excepcional', label: 'Excepcional' },
    { value: 'excelente', label: 'Excelente' },
    { value: 'acima do esperado', label: 'Acima do Esperado' },
    { value: 'bom', label: 'Bom' },
    { value: 'regular', label: 'Regular' },
    { value: 'abaixo do esperado', label: 'Abaixo do Esperado' }
  ]

  const sortOptions = [
    { value: 'score', label: 'Score (maior primeiro)' },
    { value: 'name', label: 'Nome (A-Z)' },
    { value: 'risk', label: 'Nível de Risco' },
    { value: 'performance', label: 'Performance' },
    { value: 'department', label: 'Departamento' },
    { value: 'tenure', label: 'Tempo na Empresa' }
  ]

  return (
    <Card>
      <div className="space-y-6">
        {/* Header com View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros e Visualização</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Filtros Principais */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Buscar Colaborador"
            placeholder="Nome, cargo ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
          
          <Select
            label="Nível de Risco"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            options={riskOptions}
          />

          <Select
            label="Departamento"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            options={departmentOptions}
          />
        </div>

        {/* Filtros Secundários */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Nível de Performance"
            value={filterPerformance}
            onChange={(e) => setFilterPerformance(e.target.value)}
            options={performanceOptions}
          />

          <Select
            label="Ordenar por"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={sortOptions}
            icon={<SortAsc className="h-4 w-4" />}
          />
        </div>
      </div>
    </Card>
  )
}