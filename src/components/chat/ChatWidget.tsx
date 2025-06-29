import React, { useState, useRef, useEffect } from 'react'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Sparkles,
  Brain,
  Zap,
  AlertCircle,
  Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { azureOpenAIService } from '../../services/azureOpenAIService'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'error'
  content: string
  timestamp: Date
}

interface ChatWidgetProps {
  className?: string
}

export default function ChatWidget({ className }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou o assistente de IA do ReconheceAI, powered by Azure OpenAI! 🤖\n\nComo posso ajudá-lo hoje? Posso responder perguntas sobre colaboradores, análises de performance, estratégias de retenção e muito mais!',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAzureConnected, setIsAzureConnected] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  // Testar conexão Azure OpenAI quando o chat abrir
  useEffect(() => {
    if (isOpen && isAzureConnected === null) {
      testAzureConnection()
    }
  }, [isOpen])

  const testAzureConnection = async () => {
    try {
      console.log('🔗 Testando conexão com Azure OpenAI...')
      const isConnected = await azureOpenAIService.testConnection()
      setIsAzureConnected(isConnected)
      
      if (isConnected) {
        console.log('✅ Azure OpenAI conectado com sucesso')
      } else {
        console.log('⚠️ Azure OpenAI não configurado')
        // Adicionar mensagem de aviso sobre configuração
        const warningMessage: Message = {
          id: 'warning-' + Date.now(),
          type: 'error',
          content: '⚠️ Azure OpenAI não configurado.\n\nPara usar o chat inteligente, configure as variáveis de ambiente do Azure OpenAI na página de Configurações.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, warningMessage])
      }
    } catch (error) {
      console.error('❌ Erro ao testar Azure OpenAI:', error)
      setIsAzureConnected(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    // Verificar se Azure OpenAI está configurado
    if (!isAzureConnected) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'error',
        content: '❌ Azure OpenAI não configurado.\n\nPara usar o chat inteligente, configure as variáveis de ambiente na página de Configurações.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      console.log('💬 Enviando mensagem para Azure OpenAI:', userMessage.content)
      
      // Preparar histórico da conversa (últimas 5 mensagens para contexto)
      const conversationHistory = messages
        .filter(msg => msg.type !== 'error') // Excluir mensagens de erro do histórico
        .slice(-5)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }))

      // Gerar resposta usando Azure OpenAI
      const response = await azureOpenAIService.generateChatResponse(
        userMessage.content,
        conversationHistory
      )
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      console.log('✅ Resposta recebida e exibida')

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: '❌ Erro ao processar sua mensagem.\n\nVerifique se o Azure OpenAI está configurado corretamente ou tente novamente em alguns instantes.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getConnectionStatus = () => {
    if (isAzureConnected === null) {
      return { icon: Zap, text: 'Conectando...', color: 'text-warning-600' }
    } else if (isAzureConnected) {
      return { icon: Brain, text: 'Azure OpenAI', color: 'text-success-600' }
    } else {
      return { icon: AlertCircle, text: 'Não Configurado', color: 'text-danger-600' }
    }
  }

  const connectionStatus = getConnectionStatus()
  const StatusIcon = connectionStatus.icon

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed bottom-6 right-6 z-50 ${className}`}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300 group relative"
            >
              <div className="relative">
                <MessageCircle className="h-6 w-6" />
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
                  isAzureConnected ? 'bg-success-500' : 'bg-warning-500'
                }`} />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Chat com IA Azure OpenAI
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            } transition-all duration-300 ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Assistente IA</h3>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      isAzureConnected ? 'bg-success-400' : 'bg-warning-400'
                    }`} />
                    <StatusIcon className={`h-3 w-3 ${connectionStatus.color}`} />
                    <span className="text-primary-100 text-xs">{connectionStatus.text}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 p-1"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user' 
                            ? 'bg-primary-600' 
                            : message.type === 'error'
                            ? 'bg-danger-500'
                            : 'bg-gradient-to-br from-purple-500 to-purple-600'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : message.type === 'error' ? (
                            <AlertCircle className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary-600 text-white'
                            : message.type === 'error'
                            ? 'bg-danger-50 text-danger-800 border border-danger-200'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="text-sm whitespace-pre-line">{message.content}</div>
                          {message.type === 'error' && (
                            <Link to="/settings" className="inline-flex items-center mt-2 text-xs text-danger-700 hover:text-danger-900">
                              <Settings className="h-3 w-3 mr-1" />
                              Configurar Azure OpenAI
                            </Link>
                          )}
                          <div className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-primary-100' : 
                            message.type === 'error' ? 'text-danger-600' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <LoadingSpinner size="sm" />
                            <span className="text-sm text-gray-600">
                              Processando com Azure OpenAI...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isAzureConnected ? "Digite sua pergunta..." : "Configure Azure OpenAI para usar o chat"}
                        disabled={isLoading || !isAzureConnected}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Sparkles className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading || !isAzureConnected}
                      className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-xs text-gray-500">
                      Powered by {isAzureConnected ? 'Azure OpenAI GPT-4.1 Mini' : 'ReconheceAI (Configure Azure OpenAI)'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}