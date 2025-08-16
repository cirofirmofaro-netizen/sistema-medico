import { Plantao } from './plantoes'

export interface NotificationPreferences {
  enabled: boolean
  reminders24h: boolean
  reminders1h: boolean
  sound: boolean
}

export interface NotificationData {
  id: string
  title: string
  body: string
  data?: any
  timestamp: number
}

const NOTIFICATION_PREFS_KEY = 'plantao_notification_preferences'
const NOTIFICATION_HISTORY_KEY = 'plantao_notification_history'

export class NotificationService {
  private static instance: NotificationService
  private checkInterval: NodeJS.Timeout | null = null
  private preferences: NotificationPreferences

  private constructor() {
    this.preferences = this.loadPreferences()
    this.requestPermission()
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private loadPreferences(): NotificationPreferences {
    const stored = localStorage.getItem(NOTIFICATION_PREFS_KEY)
    return stored ? JSON.parse(stored) : {
      enabled: true,
      reminders24h: true,
      reminders1h: true,
      sound: true
    }
  }

  private savePreferences(): void {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(this.preferences))
  }

  private async requestPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences }
  }

  updatePreferences(prefs: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...prefs }
    this.savePreferences()
    
    if (this.preferences.enabled) {
      this.startChecking()
    } else {
      this.stopChecking()
    }
  }

  private canNotify(): boolean {
    return this.preferences.enabled && 
           'Notification' in window && 
           Notification.permission === 'granted'
  }

  private async sendNotification(title: string, body: string, data?: any): Promise<void> {
    if (!this.canNotify()) return

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'plantao-reminder',
        requireInteraction: false,
        data
      })

      // Salvar no histórico
      this.saveToHistory({
        id: Date.now().toString(),
        title,
        body,
        data,
        timestamp: Date.now()
      })

      // Auto-close após 10 segundos
      setTimeout(() => {
        notification.close()
      }, 10000)

      // Click handler
      notification.onclick = () => {
        window.focus()
        notification.close()
        if (data?.plantaoId) {
          // Aqui você pode navegar para o plantão específico
          window.location.href = `/plantoes?plantao=${data.plantaoId}`
        }
      }

    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
    }
  }

  private saveToHistory(notification: NotificationData): void {
    const history = this.getHistory()
    history.unshift(notification)
    
    // Manter apenas as últimas 50 notificações
    if (history.length > 50) {
      history.splice(50)
    }
    
    localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(history))
  }

  getHistory(): NotificationData[] {
    const stored = localStorage.getItem(NOTIFICATION_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  }

  clearHistory(): void {
    localStorage.removeItem(NOTIFICATION_HISTORY_KEY)
  }

  startChecking(): void {
    if (this.checkInterval) return

    this.checkInterval = setInterval(() => {
      this.checkUpcomingPlantoes()
    }, 60000) // Verificar a cada minuto

    // Verificar imediatamente
    this.checkUpcomingPlantoes()
  }

  stopChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  private async checkUpcomingPlantoes(): Promise<void> {
    if (!this.preferences.enabled) return

    try {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const nextHour = new Date(now)
      nextHour.setHours(nextHour.getHours() + 1)

      // Buscar plantões confirmados
      const response = await fetch('/api/plantoes?status=CONFIRMADO&limit=100')
      const data = await response.json()
      
      if (!data.plantoes) return

      const plantoes = data.plantoes as Plantao[]
      const sentNotifications = this.getSentNotificationIds()

      for (const plantao of plantoes) {
        const plantaoDate = new Date(plantao.data + 'T' + plantao.horaInicio)
        const timeDiff = plantaoDate.getTime() - now.getTime()
        const hoursDiff = timeDiff / (1000 * 60 * 60)

        // Notificação 24h antes
        if (this.preferences.reminders24h && 
            hoursDiff > 23 && hoursDiff < 25 && 
            !sentNotifications.has(`${plantao.id}-24h`)) {
          
          await this.sendNotification(
            'Plantão amanhã!',
            `${plantao.local} - ${plantao.horaInicio} às ${plantao.horaFim}`,
            { plantaoId: plantao.id }
          )
          
          sentNotifications.add(`${plantao.id}-24h`)
        }

        // Notificação 1h antes
        if (this.preferences.reminders1h && 
            hoursDiff > 0.5 && hoursDiff < 1.5 && 
            !sentNotifications.has(`${plantao.id}-1h`)) {
          
          await this.sendNotification(
            'Plantão em 1 hora!',
            `${plantao.local} - ${plantao.horaInicio} às ${plantao.horaFim}`,
            { plantaoId: plantao.id }
          )
          
          sentNotifications.add(`${plantao.id}-1h`)
        }
      }

      this.saveSentNotificationIds(sentNotifications)

    } catch (error) {
      console.error('Erro ao verificar plantões:', error)
    }
  }

  private getSentNotificationIds(): Set<string> {
    const stored = localStorage.getItem('sent_notification_ids')
    return stored ? new Set(JSON.parse(stored)) : new Set()
  }

  private saveSentNotificationIds(ids: Set<string>): void {
    localStorage.setItem('sent_notification_ids', JSON.stringify([...ids]))
  }

  // Método para testar notificações
  async testNotification(): Promise<void> {
    await this.sendNotification(
      'Teste de Notificação',
      'Esta é uma notificação de teste do sistema de plantões.',
      { test: true }
    )
  }
}

export const notificationService = NotificationService.getInstance()
