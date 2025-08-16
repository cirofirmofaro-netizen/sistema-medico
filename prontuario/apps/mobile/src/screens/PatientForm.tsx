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
import { patientsLocal } from '../db/schema';
import { eq } from 'drizzle-orm';
import { addToOutbox } from '../sync/push';
import DateTimePicker from '@react-native-community/datetimepicker';

interface PatientFormData {
  fullName: string;
  cpf: string;
  birthDate: string | null;
  sex: string;
  email: string;
  phone: string;
  notes: string;
}

export default function PatientForm() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const patientId = route.params?.patientId;
  
  const [formData, setFormData] = useState<PatientFormData>({
    fullName: '',
    cpf: '',
    birthDate: null,
    sex: '',
    email: '',
    phone: '',
    notes: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setIsLoading(true);
      const result = await db.select().from(patientsLocal).where(eq(patientsLocal.idLocal, patientId));
      
      if (result.length > 0) {
        const patient = result[0];
        setFormData({
          fullName: patient.fullName,
          cpf: patient.cpf || '',
          birthDate: patient.birthDate,
          sex: patient.sex || '',
          email: patient.email || '',
          phone: patient.phone || '',
          notes: patient.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading patient:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do paciente');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }
    
    if (formData.cpf && formData.cpf.length !== 11) {
      Alert.alert('Erro', 'CPF deve ter 11 dígitos');
      return false;
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      Alert.alert('Erro', 'Email inválido');
      return false;
    }
    
    return true;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      
      const now = new Date().toISOString();
      const patientData = {
        ...formData,
        updatedAt: now,
      };

      if (patientId) {
        // Atualizar paciente existente
        await db.update(patientsLocal)
          .set(patientData)
          .where(eq(patientsLocal.idLocal, patientId));

        // Adicionar ao outbox para sincronização
        const patient = await db.select().from(patientsLocal).where(eq(patientsLocal.idLocal, patientId));
        if (patient.length > 0 && patient[0].idRemote) {
          await addToOutbox('patient', 'update', {
            idRemote: patient[0].idRemote,
            ...patientData,
          });
        }
      } else {
        // Criar novo paciente
        const newId = `local_${Date.now()}_${Math.random()}`;
        await db.insert(patientsLocal).values({
          idLocal: newId,
          ...patientData,
        });

        // Adicionar ao outbox para sincronização
        await addToOutbox('patient', 'create', {
          idLocal: newId,
          ...patientData,
        });
      }

      Alert.alert(
        'Sucesso',
        patientId ? 'Paciente atualizado com sucesso' : 'Paciente criado com sucesso',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving patient:', error);
      Alert.alert('Erro', 'Erro ao salvar paciente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!patientId) return;

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este paciente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              
              // Marcar como deletado (soft delete)
              await db.update(patientsLocal)
                .set({ deletedAt: new Date().toISOString() })
                .where(eq(patientsLocal.idLocal, patientId));

              // Adicionar ao outbox para sincronização
              const patient = await db.select().from(patientsLocal).where(eq(patientsLocal.idLocal, patientId));
              if (patient.length > 0 && patient[0].idRemote) {
                await addToOutbox('patient', 'delete', {
                  idRemote: patient[0].idRemote,
                });
              }

              Alert.alert('Sucesso', 'Paciente excluído com sucesso', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error deleting patient:', error);
              Alert.alert('Erro', 'Erro ao excluir paciente');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        birthDate: selectedDate.toISOString(),
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
          {patientId ? 'Editar Paciente' : 'Novo Paciente'}
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
            placeholder="Digite o nome completo"
          />

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            value={formData.cpf}
            onChangeText={(text) => setFormData(prev => ({ ...prev, cpf: text.replace(/\D/g, '') }))}
            placeholder="00000000000"
            keyboardType="numeric"
            maxLength={11}
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formData.birthDate 
                ? new Date(formData.birthDate).toLocaleDateString('pt-BR')
                : 'Selecionar data'
              }
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Sexo</Text>
          <View style={styles.sexContainer}>
            <TouchableOpacity
              style={[
                styles.sexButton,
                formData.sex === 'M' && styles.sexButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, sex: 'M' }))}
            >
              <Text style={[
                styles.sexButtonText,
                formData.sex === 'M' && styles.sexButtonTextActive
              ]}>
                Masculino
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sexButton,
                formData.sex === 'F' && styles.sexButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, sex: 'F' }))}
            >
              <Text style={[
                styles.sexButtonText,
                formData.sex === 'F' && styles.sexButtonTextActive
              ]}>
                Feminino
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="Observações sobre o paciente"
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

          {patientId && (
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

      {showDatePicker && (
        <DateTimePicker
          value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
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
  sexContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sexButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sexButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sexButtonText: {
    fontSize: 16,
    color: '#333',
  },
  sexButtonTextActive: {
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
