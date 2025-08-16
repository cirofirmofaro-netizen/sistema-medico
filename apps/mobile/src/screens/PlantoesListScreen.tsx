import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { plantoesStore } from '../stores/plantoesStore';

export const PlantoesListScreen = ({ navigation }: any) => {
  const { data: plantoes, isLoading, error } = useQuery({
    queryKey: ['plantoes'],
    queryFn: () => plantoesStore.getPlantoes(),
  });

  const renderPlantao = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.plantaoItem}
      onPress={() => navigation.navigate('PlantaoDetail', { id: item.id })}
    >
      <View style={styles.plantaoHeader}>
        <Text style={styles.plantaoLocal}>{item.local}</Text>
        <Text style={[styles.plantaoStatus, { color: getStatusColor(item.statusPgto) }]}>
          {item.statusPgto}
        </Text>
      </View>
      <Text style={styles.plantaoContratante}>{item.contratante}</Text>
      <Text style={styles.plantaoTipo}>{item.tipo}</Text>
      <View style={styles.plantaoFooter}>
        <Text style={styles.plantaoData}>
          {new Date(item.inicio).toLocaleDateString('pt-BR')}
        </Text>
        <Text style={styles.plantaoValor}>
          R$ {item.valorBruto.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGO': return '#4CAF50';
      case 'PARCIAL': return '#FF9800';
      case 'ATRASADO': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Carregando plantões...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>Erro ao carregar plantões</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plantoes}
        renderItem={renderPlantao}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PlantaoForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  plantaoItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  plantaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plantaoLocal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  plantaoStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  plantaoContratante: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  plantaoTipo: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  plantaoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plantaoData: {
    fontSize: 14,
    color: '#666',
  },
  plantaoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});
