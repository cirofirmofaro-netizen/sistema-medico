import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
import { db } from '../db/client';
import { appointmentsLocal, patientsLocal } from '../db/schema';
import { eq, and, isNull, gte, lte, desc } from 'drizzle-orm';
import SyncIndicator from '../components/SyncIndicator';

interface Appointment {
  idLocal: string;
  idRemote: string | null;
  patientIdLocal: string;
  startsAt: string;
  endsAt: string;
  type: string;
  status: string;
  location: string | null;
  notes: string | null;
  updatedAt: string;
  deletedAt: string | null;
  patient?: {
    fullName: string;
  };
}

type ViewMode = 'list' | 'calendar';

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, viewMode]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      
      let query = db
        .select({
          idLocal: appointmentsLocal.idLocal,
          idRemote: appointmentsLocal.idRemote,
          patientIdLocal: appointmentsLocal.patientIdLocal,
          startsAt: appointmentsLocal.startsAt,
          endsAt: appointmentsLocal.endsAt,
          type: appointmentsLocal.type,
          status: appointmentsLocal.status,
          location: appointmentsLocal.location,
          notes: appointmentsLocal.notes,
          updatedAt: appointmentsLocal.updatedAt,
          deletedAt: appointmentsLocal.deletedAt,
        })
        .from(appointmentsLocal)
        .leftJoin(patientsLocal, eq(appointmentsLocal.patientIdLocal, patientsLocal.idLocal));

      // Filtrar apenas consultas não deletadas
      query = query.where(isNull(appointmentsLocal.deletedAt));

      if (viewMode === 'calendar') {
        // Filtrar por data selecionada
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        query = query.where(
          and(
            gte(appointmentsLocal.startsAt, startOfDay.toISOString()),
            lte(appointmentsLocal.startsAt, endOfDay.toISOString())
          )
        );
      } else {
        // Lista: mostrar próximas consultas (próximos 30 dias)
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        query = query.where(
          and(
            gte(appointmentsLocal.startsAt, now.toISOString()),
            lte(appointmentsLocal.startsAt, thirtyDaysFromNow.toISOString())
          )
        );
      }

      // Ordenar por data de início
      query = query.orderBy(appointmentsLocal.startsAt);

      const result = await query;
      
      // Buscar dados dos pacientes
      const appointmentsWithPatients = await Promise.all(
        result.map(async (appointment: any) => {
          const patient = await db
            .select({ fullName: patientsLocal.fullName })
            .from(patientsLocal)
            .where(eq(patientsLocal.idLocal, appointment.patientIdLocal));
          
          return {
            ...appointment,
            patient: patient[0] || { fullName: 'Paciente não encontrado' },
          };
        })
      );

      setAppointments(appointmentsWithPatients);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Erro', 'Erro ao carregar consultas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    navigation.navigate('AppointmentForm', { appointmentId: appointment.idLocal });
  };

  const handleNewAppointment = () => {
    navigation.navigate('AppointmentForm', {});
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADA':
        return '#007AFF';
      case 'CONCLUIDA':
        return '#28a745';
      case 'CANCELADA':
        return '#dc3545';
      default:
        return '#666';
    }
  };

  const getTypeText = (type: string) => {
    return type === 'PRESENCIAL' ? 'Presencial' : 'Teleconsulta';
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <TouchableOpacity
      style={styles.appointmentItem}
      onPress={() => handleAppointmentPress(item)}
    >
      <View style={styles.appointmentHeader}>
        <Text style={styles.patientName}>{item.patient?.fullName}</Text>
        {!item.idRemote && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>

      <View style={styles.appointmentDetails}>
        <Text style={styles.dateTimeText}>
          {formatDateTime(item.startsAt)}
        </Text>
        
        <View style={styles.appointmentMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          
          <Text style={styles.typeText}>{getTypeText(item.type)}</Text>
        </View>

        {item.location && (
          <Text style={styles.locationText}>📍 {item.location}</Text>
        )}

        {item.notes && (
          <Text style={styles.notesText} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCalendarView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const appointmentsByHour = hours.reduce((acc, hour) => {
      acc[hour] = appointments.filter(appointment => {
        const appointmentHour = new Date(appointment.startsAt).getHours();
        return appointmentHour === hour;
      });
      return acc;
    }, {} as Record<number, Appointment[]>);

    return (
      <ScrollView style={styles.calendarContainer}>
        {hours.map(hour => {
          const hourAppointments = appointmentsByHour[hour];
          if (!hourAppointments || hourAppointments.length === 0) return null;

          return (
            <View key={hour} style={styles.calendarHour}>
              <Text style={styles.hourLabel}>{`${hour.toString().padStart(2, '0')}:00`}</Text>
              {hourAppointments.map(appointment => (
                <TouchableOpacity
                  key={appointment.idLocal}
                  style={styles.calendarAppointment}
                  onPress={() => handleAppointmentPress(appointment)}
                >
                  <Text style={styles.calendarTime}>
                    {formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)}
                  </Text>
                  <Text style={styles.calendarPatientName}>
                    {appointment.patient?.fullName}
                  </Text>
                  <Text style={styles.calendarType}>{getTypeText(appointment.type)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {viewMode === 'calendar' 
          ? 'Nenhuma consulta nesta data'
          : 'Nenhuma consulta agendada'
        }
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        Toque no botão + para agendar uma nova consulta
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SyncIndicator />
      
      <View style={styles.header}>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleButtonText, viewMode === 'list' && styles.toggleButtonTextActive]}>
              Lista
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={[styles.toggleButtonText, viewMode === 'calendar' && styles.toggleButtonTextActive]}>
              Calendário
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleNewAppointment}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando consultas...</Text>
        </View>
      ) : viewMode === 'calendar' ? (
        renderCalendarView()
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.idLocal}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  viewModeToggle: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
    marginRight: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  calendarContainer: {
    flex: 1,
    padding: 16,
  },
  appointmentItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  offlineIndicator: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offlineText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#856404',
  },
  appointmentDetails: {
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  notesText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  calendarHour: {
    marginBottom: 16,
  },
  hourLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  calendarAppointment: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  calendarTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  calendarPatientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  calendarType: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
