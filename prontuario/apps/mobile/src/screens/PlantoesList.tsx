import React from 'react';
import { View, FlatList } from 'react-native';
import { Text, Button, Card, FAB, ActivityIndicator } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { listPlantoes, Plantao } from '../services/plantoes';
import { useNavigation } from '@react-navigation/native';
import { moneyBR } from '../utils/format';

export default function PlantoesList() {
  const nav = useNavigation();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['plantoes'],
    queryFn: listPlantoes
  });

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Botões de ação */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <Button 
          mode="contained" 
          onPress={() => nav.navigate('PlantaoForm')}
          style={{ flex: 1 }}
        >
          Novo Plantão
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => nav.navigate('Resumo')}
          icon="chart-box"
        >
          Resumo
        </Button>
      </View>

      <FlatList
        data={data}
        refreshing={isLoading}
        onRefresh={refetch}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Plantao }) => (
          <Card 
            key={item.id} 
            onPress={() => nav.navigate('PlantaoDetail', { id: item.id })}
            style={{ marginBottom: 8 }}
          >
            <Card.Title 
              title={item.local} 
              subtitle={`${item.contratante} • ${item.tipo}`}
            />
            <Card.Content>
              <Text variant="bodyMedium">
                {new Date(item.inicio).toLocaleString('pt-BR')}
              </Text>
              <Text variant="bodyMedium">
                {moneyBR(item.valorBruto)} 
                {item.valorLiquido ? ` • Líquido: ${moneyBR(item.valorLiquido)}` : ''} 
                • {item.statusPgto}
              </Text>
            </Card.Content>
          </Card>
        )}
      />

      {/* FAB para Resumo Financeiro */}
      <FAB
        icon="chart-box"
        onPress={() => nav.navigate('Resumo')}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
      />
    </View>
  );
}
