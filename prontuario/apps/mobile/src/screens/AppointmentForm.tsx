import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../db/client';
import { appointmentsLocal, patientsLocal } from '../db/schema';
import { eq, and, isNull, or, lt, gt, gte, lte } from 'drizzle-orm';
import { addToOutbox } from '../sync/push';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface AppointmentFormData {
  patientIdLocal: string;
  startsAt: string;
  endsAt: string;
  type: string;
  status: string;
  location: string;
  notes: string;
}

interface Patient {
  idLocal: string;
  fullName: string;
}

export default function AppointmentForm() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const appointmentId = route.params?.appointmentId;
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientIdLocal: '',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min depois
    type: 'PRESENCIAL',
    status: 'AGENDADA',
    location: '',
    notes: '',
  });
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadPatients();
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  const loadPatients = async () => {
    try {
      const result = await db
        .select({ idLocal: patientsLocal.idLocal, fullName: patientsLocal.fullName })
        .from(patientsLocal)
        .where(isNull(patientsLocal.deletedAt))
        .orderBy(patientsLocal.fullName);
      
      setPatients(result);
    } catch (error) {
      console.error('Error loading patients:', error);
      Alert.alert('Erro', 'Erro ao carregar pacientes');
    }
  };

  const loadAppointment = async () => {
    try {
      setIsLoading(true);
      const result = await db.select().from(appointmentsLocal).where(eq(appointmentsLocal.idLocal, appointmentId));
      
      if (result.length > 0) {
        const appointment = result[0];
        setFormData({
          patientIdLocal: appointment.patientIdLocal,
          startsAt: appointment.startsAt,
          endsAt: appointment.endsAt,
          type: appointment.type,
          status: appointment.status,
          location: appointment.location || '',
          notes: appointment.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      Alert.alert('Erro', 'Erro ao carregar dados da consulta');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.patientIdLocal) {
      Alert.alert('Erro', 'Selecione um paciente');
      return false;
    }
    
    const startDate = new Date(formData.startsAt);
    const endDate = new Date(formData.endsAt);
    
    if (startDate >= endDate) {
      Alert.alert('Erro', 'A data/hora de início deve ser anterior à data/hora de fim');
      return false;
    }
    
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    
    if (durationMinutes < 10) {
      Alert.alert('Erro', 'A consulta deve ter pelo menos 10 minutos de duração');
      return false;
    }
    
    if (formData.type === 'PRESENCIAL' && !formData.location.trim()) {
      Alert.alert('Erro', 'Local é obrigatório para consultas presenciais');
      return false;
    }
    
    return true;
  };

  const checkTimeConflict = async (): Promise<boolean> => {
    try {
      const startDate = new Date(formData.startsAt);
      const endDate = new Date(formData.endsAt);
      
      // Buscar consultas que conflitam com o horário
      const conflictingAppointments = await db
        .select()
        .from(appointmentsLocal)
        .where(
          and(
            isNull(appointmentsLocal.deletedAt),
            eq(appointmentsLocal.patientIdLocal, formData.patientIdLocal),
            or(
              // Caso 1: Nova consulta começa durante uma consulta existente
              and(
                gte(appointmentsLocal.startsAt, startDate.toISOString()),
                lt(appointmentsLocal.startsAt, endDate.toISOString())
              ),
              // Caso 2: Nova consulta termina durante uma consulta existente
              and(
                gt(appointmentsLocal.endsAt, startDate.toISOString()),
                lte(appointmentsLocal.endsAt, endDate.toISOString())
              ),
              // Caso 3: Nova consulta engloba uma consulta existente
              and(
                lte(appointmentsLocal.startsAt, startDate.toISOString()),
                gte(appointmentsLocal.endsAt, endDate.toISOString())
              )
            )
          )
        );

      // Se estiver editando, excluir a própria consulta do conflito
      const filteredConflicts = appointmentId 
        ? conflictingAppointments.filter((app: any) => app.idLocal !== appointmentId)
        : conflictingAppointments;

      if (filteredConflicts.length > 0) {
        const conflict = filteredConflicts[0];
        const conflictStart = new Date(conflict.startsAt);
        const conflictEnd = new Date(conflict.endsAt);
        
        Alert.alert(
          'Conflito de Horário',
          `Existe uma consulta agendada para ${conflictStart.toLocaleString('pt-BR')} - ${conflictEnd.toLocaleString('pt-BR')}. Deseja continuar mesmo assim?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Continuar', onPress: () => handleSave() },
          ]
        );
        return true; // Conflito encontrado
      }
      
      return false; // Sem conflito
    } catch (error) {
      console.error('Error checking time conflict:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Verificar conflito de horário
    const hasConflict = await checkTimeConflict();
    if (hasConflict) return; // A função checkTimeConflict já trata o conflito

    try {
      setIsSaving(true);
      
      const now = new Date().toISOString();
      const appointmentData = {
        ...formData,
        updatedAt: now,
      };

      if (appointmentId) {
        // Atualizar consulta existente
        await db.update(appointmentsLocal)
          .set(appointmentData)
          .where(eq(appointmentsLocal.idLocal, appointmentId));

        // Adicionar ao outbox para sincronização
        const appointment = await db.select().from(appointmentsLocal).where(eq(appointmentsLocal.idLocal, appointmentId));
        if (appointment.length > 0 && appointment[0].idRemote) {
          await addToOutbox('appointment', 'update', {
            idRemote: appointment[0].idRemote,
            ...appointmentData,
          });
        }
      } else {
        // Criar nova consulta
        const newId = `local_${Date.now()}_${Math.random()}`;
        await db.insert(appointmentsLocal).values({
          idLocal: newId,
          ...appointmentData,
        });

        // Adicionar ao outbox para sincronização
        await addToOutbox('appointment', 'create', {
          idLocal: newId,
          ...appointmentData,
        });
      }

      Alert.alert(
        'Sucesso',
        appointmentId ? 'Consulta atualizada com sucesso' : 'Consulta criada com sucesso',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving appointment:', error);
      Alert.alert('Erro', 'Erro ao salvar consulta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!appointmentId) return;

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta consulta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              
              // Marcar como deletado (soft delete)
              await db.update(appointmentsLocal)
                .set({ deletedAt: new Date().toISOString() })
                .where(eq(appointmentsLocal.idLocal, appointmentId));

              // Adicionar ao outbox para sincronização
              const appointment = await db.select().from(appointmentsLocal).where(eq(appointmentsLocal.idLocal, appointmentId));
              if (appointment.length > 0 && appointment[0].idRemote) {
                await addToOutbox('appointment', 'delete', {
                  idRemote: appointment[0].idRemote,
                });
              }

              Alert.alert('Sucesso', 'Consulta excluída com sucesso', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error deleting appointment:', error);
              Alert.alert('Erro', 'Erro ao excluir consulta');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (field: 'startsAt' | 'endsAt', event: any, selectedDate?: Date) => {
    if (field === 'startsAt') {
      setShowStartDatePicker(false);
    } else {
      setShowEndDatePicker(false);
    }
    
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [field]: selectedDate.toISOString(),
      }));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {appointmentId ? 'Editar Consulta' : 'Nova Consulta'}
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Paciente *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.patientIdLocal}
              onValueChange={(value) => setFormData(prev => ({ ...prev, patientIdLocal: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um paciente" value="" />
              {patients.map(patient => (
                <Picker.Item
                  key={patient.idLocal}
                  label={patient.fullName}
                  value={patient.idLocal}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Data/Hora de Início *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {new Date(formData.startsAt).toLocaleString('pt-BR')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Data/Hora de Fim *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {new Date(formData.endsAt).toLocaleString('pt-BR')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Tipo *</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'PRESENCIAL' && styles.typeButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'PRESENCIAL' }))}
            >
              <Text style={[
                styles.typeButtonText,
                formData.type === 'PRESENCIAL' && styles.typeButtonTextActive
              ]}>
                Presencial
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'TELE' && styles.typeButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'TELE' }))}
            >
              <Text style={[
                styles.typeButtonText,
                formData.type === 'TELE' && styles.typeButtonTextActive
              ]}>
                Teleconsulta
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Status *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Agendada" value="AGENDADA" />
              <Picker.Item label="Concluída" value="CONCLUIDA" />
              <Picker.Item label="Cancelada" value="CANCELADA" />
            </Picker>
          </View>

          {formData.type === 'PRESENCIAL' && (
            <>
              <Text style={styles.label}>Local *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="Digite o local da consulta"
              />
            </>
          )}

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="Observações sobre a consulta"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>

          {appointmentId && (
            <TouchableOpacity
              style={[styles.deleteButton, isSaving && styles.buttonDisabled]}
              onPress={handleDelete}
              disabled={isSaving}
            >
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {showStartDatePicker && (
        <DateTimePicker
          value={new Date(formData.startsAt)}
          mode="datetime"
          display="default"
          onChange={(event, date) => handleDateChange('startsAt', event, date)}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={new Date(formData.endsAt)}
          mode="datetime"
          display="default"
          onChange={(event, date) => handleDateChange('endsAt', event, date)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
