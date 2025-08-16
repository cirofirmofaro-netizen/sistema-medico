import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { db } from '../db/client';
import { patientsLocal } from '../db/schema';
import { eq, like, isNull, desc } from 'drizzle-orm';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
import SyncIndicator from '../components/SyncIndicator';

interface Patient {
  idLocal: string;
  idRemote: string | null;
  fullName: string;
  cpf: string | null;
  birthDate: string | null;
  sex: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  updatedAt: string;
  deletedAt: string | null;
}

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      
      let query = db.select().from(patientsLocal);
      
      // Filtrar por busca
      if (searchTerm.trim()) {
        query = query.where(
          like(patientsLocal.fullName, `%${searchTerm.trim()}%`)
        );
      }
      
      // Filtrar apenas pacientes não deletados
      query = query.where(isNull(patientsLocal.deletedAt));
      
      // Ordenar por nome
      query = query.orderBy(patientsLocal.fullName);
      
      const result = await query;
      setPatients(result);
    } catch (error) {
      console.error('Error loading patients:', error);
      Alert.alert('Erro', 'Erro ao carregar pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [searchTerm]);

  const handlePatientPress = (patient: Patient) => {
    navigation.navigate('PatientForm', { patientId: patient.idLocal });
  };

  const handleNewPatient = () => {
    navigation.navigate('PatientForm', {});
  };

  const formatPatientInfo = (patient: Patient) => {
    const info = [];
    
    if (patient.cpf) {
      info.push(`CPF: ${patient.cpf}`);
    }
    
    if (patient.birthDate) {
      const age = calculateAge(patient.birthDate);
      info.push(`${age} anos`);
    }
    
    if (patient.phone) {
      info.push(patient.phone);
    }
    
    return info.join(' • ');
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => handlePatientPress(item)}
    >
      <View style={styles.patientHeader}>
        <Text style={styles.patientName}>{item.fullName}</Text>
        {!item.idRemote && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.patientInfo}>{formatPatientInfo(item)}</Text>
      
      {item.notes && (
        <Text style={styles.patientNotes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchTerm 
          ? 'Tente ajustar os termos de busca'
          : 'Toque no botão + para adicionar um novo paciente'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SyncIndicator />
      
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pacientes..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleNewPatient}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando pacientes...</Text>
        </View>
      ) : (
        <FlatList
          data={patients}
          renderItem={renderPatientItem}
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
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 12,
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
  patientItem: {
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
  patientHeader: {
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
  patientInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  patientNotes: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
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
