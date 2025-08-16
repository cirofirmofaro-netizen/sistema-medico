import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { db } from '../db/client';
import { patientsLocal } from '../db/schema';
import { eq } from 'drizzle-orm';

export default function PacienteDetail() {
  const route = useRoute<any>();
  const nav = useNavigation();
  const pacienteId = route.params?.pacienteId as string;
  const [paciente, setPaciente] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaciente();
  }, [pacienteId]);

  const loadPaciente = async () => {
    try {
      setIsLoading(true);
      const result = await db.select().from(patientsLocal).where(eq(patientsLocal.idLocal, pacienteId));
      
      if (result.length > 0) {
        setPaciente(result[0]);
      } else {
        Alert.alert('Erro', 'Paciente não encontrado');
        nav.goBack();
      }
    } catch (error) {
      console.error('Error loading patient:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do paciente');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!paciente) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Paciente não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 2 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>{paciente.fullName}</Text>
        
        {paciente.birthDate && (
          <Text style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Nascimento:</Text> {new Date(paciente.birthDate).toLocaleDateString('pt-BR')}
          </Text>
        )}
        
        {paciente.sex && (
          <Text style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Sexo:</Text> {paciente.sex}
          </Text>
        )}
        
        {paciente.cpf && (
          <Text style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>CPF:</Text> {paciente.cpf}
          </Text>
        )}
        
        {paciente.phone && (
          <Text style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Telefone:</Text> {paciente.phone}
          </Text>
        )}
        
        {paciente.email && (
          <Text style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Email:</Text> {paciente.email}
          </Text>
        )}
        
        {paciente.notes && (
          <Text style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Observações:</Text> {paciente.notes}
          </Text>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <TouchableOpacity 
          onPress={() => nav.navigate('EvolucoesList' as never, { pacienteId, nome: paciente.nome } as never)}
          style={{ 
            backgroundColor: '#4CAF50', 
            padding: 16, 
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>📋 Evoluções</Text>
          <Text style={{ color: '#fff', fontSize: 14 }}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => nav.navigate('ExportProntuario' as never, { pacienteId } as never)}
          style={{ 
            backgroundColor: '#9C27B0', 
            padding: 16, 
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>📄 Exportar Prontuário</Text>
          <Text style={{ color: '#fff', fontSize: 14 }}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
