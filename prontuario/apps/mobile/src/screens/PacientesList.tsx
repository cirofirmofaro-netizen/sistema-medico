import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { db } from '../db/client';
import { patientsLocal } from '../db/schema';
import { isNull, like, or } from 'drizzle-orm';

export default function PacientesList() {
  const nav = useNavigation();
  const [q, setQ] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      let query = db.select().from(patientsLocal).where(isNull(patientsLocal.deletedAt));
      
      if (q.trim()) {
        const searchTerm = `%${q.trim()}%`;
        query = query.where(
          or(
            like(patientsLocal.fullName, searchTerm),
            like(patientsLocal.cpf || '', searchTerm),
            like(patientsLocal.phone || '', searchTerm)
          )
        );
      }
      
      const result = await query.orderBy(patientsLocal.fullName);
      setData(result);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [q]);

  return (
    <View style={{ flex:1, padding:16 }}>
      <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
        <TextInput
          mode="outlined"
          placeholder="Buscar por nome/CPF/telefone"
          value={q}
          onChangeText={setQ}
          style={{ flex:1 }}
        />
        <Button mode="contained" onPress={()=>loadPatients()}>
          Buscar
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={()=>nav.navigate('PacienteForm')}
        style={{ marginBottom:12 }}
      >
        Novo Paciente
      </Button>

      {isLoading ? <ActivityIndicator/> : (
        <FlatList
          data={data}
          keyExtractor={(i)=>i.idLocal}
          renderItem={({ item }) => (
            <Card
              key={item.idLocal}
              onPress={()=>nav.navigate('PacienteDetail', { pacienteId: item.idLocal })}
              style={{ marginBottom:8 }}
            >
              <Card.Title
                title={item.fullName}
                subtitle={item.phone ?? item.email ?? ''}
              />
            </Card>
          )}
        />
      )}
    </View>
  );
}
