export interface User {
  id: string
  name: string
  email: string
  specialty: string
  role: string
}

export interface Patient {
  id: string
  name: string
  cpf: string
  phone: string
  email: string
  age: number
  gender: 'Masculino' | 'Feminino'
  address: string
  registrationDate: string
  comorbidities: string[]
  allergies: Allergy[]
  continuousMedications: Medication[]
}

export interface Allergy {
  id: string
  name: string
  severity: 'Leve' | 'Moderada' | 'Severa'
  type: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  status: 'Ativo' | 'Inativo'
}

export interface Shift {
  id: string
  title: string
  hospital: string
  date: string
  startTime: string
  endTime: string
  location: string
  type: 'noturno' | 'diurno'
  status: 'agendado' | 'em_andamento' | 'finalizado'
}

export interface VitalSigns {
  id: string
  patientId: string
  bloodPressure: string
  oxygenSaturation: string
  heartRate: string
  temperature: string
  weight: string
  height: string
  respiratoryRate: string
  date: string
  professional: string
}

export interface Evolution {
  id: string
  patientId: string
  description: string
  date: string
  professional: string
  number: number
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  type: string
  date: string
  status: 'agendado' | 'em_andamento' | 'finalizado'
  professional: string
}

export interface DashboardStats {
  activePatients: number
  shiftsThisMonth: number
  medicalRecords: number
  hoursWorked: number
  activePatientsIncrease: string
  shiftsIncrease: string
  recordsIncrease: string
  hoursIncrease: string
}

export interface RecentActivity {
  id: string
  type: 'shift' | 'appointment' | 'record'
  title: string
  description: string
  timeAgo: string
  icon: string
}
