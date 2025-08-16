import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Settings,
  MessageSquare,
  FileText,
  User,
  Clock,
  MapPin
} from 'lucide-react'
import { appointmentsService, Appointment } from '../../services/appointments'

export function Telemedicine() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isCallActive, setIsCallActive] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    sender: 'doctor' | 'patient'
    message: string
    timestamp: Date
  }>>([])

  // Query para buscar dados da consulta
  const { data: appointment, isLoading, error } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsService.getAppointment(id!),
    enabled: !!id
  })

  useEffect(() => {
    if (appointment) {
      // Registrar evento de início da teleconsulta no prontuário
      console.log('Teleconsulta iniciada para:', appointment.patientName)
      toast.success('Teleconsulta iniciada!')
    }
  }, [appointment])

  const handleStartCall = () => {
    setIsCallActive(true)
    toast.success('Chamada iniciada!')
    
    // Adicionar mensagem de sistema
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'doctor',
      message: 'Teleconsulta iniciada',
      timestamp: new Date()
    }])
  }

  const handleEndCall = () => {
    setIsCallActive(false)
    toast.success('Chamada encerrada!')
    
    // Adicionar mensagem de sistema
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'doctor',
      message: 'Teleconsulta encerrada',
      timestamp: new Date()
    }])

    // Registrar evento de encerramento no prontuário
    if (appointment) {
      console.log('Teleconsulta encerrada para:', appointment.patientName)
    }
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'doctor',
        message: chatMessage,
        timestamp: new Date()
      }])
      setChatMessage('')
    }
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando teleconsulta...</p>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar consulta</p>
          <button
            onClick={() => navigate('/appointments')}
            className="btn btn-primary"
          >
            Voltar para consultas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/appointments')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-white text-lg font-semibold">Teleconsulta</h1>
            <p className="text-gray-400 text-sm">
              {appointment.patientName} • {formatTime(appointment.horaInicio)} - {formatTime(appointment.horaFim)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-white hover:text-gray-300 transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Placeholder Video */}
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg font-medium">{appointment.patientName}</p>
              <p className="text-gray-500 text-sm">Aguardando conexão...</p>
            </div>
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className={`p-4 rounded-full transition-colors ${
                  isVideoEnabled 
                    ? 'bg-white text-gray-900 hover:bg-gray-100' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </button>

              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-4 rounded-full transition-colors ${
                  isAudioEnabled 
                    ? 'bg-white text-gray-900 hover:bg-gray-100' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </button>

              {!isCallActive ? (
                <button
                  onClick={handleStartCall}
                  className="p-4 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-6 w-6" />
                </button>
              ) : (
                <button
                  onClick={handleEndCall}
                  className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>

          {/* Call Status */}
          {isCallActive && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>AO VIVO</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat
            </h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Nenhuma mensagem ainda</p>
                <p className="text-xs">Inicie a conversa enviando uma mensagem</p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.sender === 'doctor'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p>{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'doctor' ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Info Bar */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <User className="h-4 w-4" />
              <span className="font-medium">{appointment.patientName}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{formatTime(appointment.horaInicio)} - {formatTime(appointment.horaFim)}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{appointment.local}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/patients/${appointment.patientId}`)}
              className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">Prontuário</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
