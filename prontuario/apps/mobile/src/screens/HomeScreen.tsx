import * as React from 'react';
import { View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { listPlantoes } from '../services/plantoes';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const { data } = useQuery({
    queryKey: ['home_plantoes'],
    queryFn: async () => {
      const items = await listPlantoes();
      return items.slice(0, 2);
    }
  });

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text variant="titleLarge">Bem-vindo 👋</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button mode="contained" onPress={() => nav.navigate('PlantaoForm')}>Novo Plantão</Button>
        <Button mode="outlined" onPress={() => nav.navigate('PacienteForm')}>Novo Paciente</Button>
      </View>
      <Button onPress={() => nav.navigate('Resumo')} icon="chart-box">Abrir Resumo</Button>

      <Text variant="titleMedium" style={{ marginTop: 10 }}>Últimos plantões</Text>
      {(data ?? []).map((p: any) => (
        <Card key={p.id} onPress={() => nav.navigate('PlantaoDetail', { id: p.id })}>
          <Card.Title title={p.local} subtitle={`${p.contratante} • ${p.tipo}`} />
          <Card.Content>
            <Text>{new Date(p.inicio).toLocaleString('pt-BR')} → {new Date(p.fim).toLocaleString('pt-BR')}</Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}
