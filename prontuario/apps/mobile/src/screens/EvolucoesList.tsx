import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { episodiosPorPaciente, evolucoesPorEpisodio, criarEpisodio } from '../services/evolucoes';

export default function EvolucoesList() {
  const route = useRoute<any>(); 
  const nav = useNavigation(); 
  const qc = useQueryClient();
  const pacienteId = route.params?.pacienteId as string; 
  const nome = route.params?.nome as string;

  useLayoutEffect(()=>{ 
    nav.setOptions({ title: `Evoluções • ${nome}` }); 
  }, [nav, nome]);

  const { data: episodios } = useQuery({
    queryKey: ['episodios', pacienteId],
    queryFn: () => episodiosPorPaciente(pacienteId)
  });
  const episodio = episodios?.[0]; // último ou cria um novo

  const { data: evolucoes, refetch } = useQuery({
    queryKey: ['evolucoes', episodio?.id],
    queryFn: () => episodio ? evolucoesPorEpisodio(episodio.id) : Promise.resolve([]),
    enabled: !!episodio
  });

  const { mutateAsync: novoEpisodio } = useMutation({
    mutationFn: () => criarEpisodio(pacienteId),
    onSuccess: async () => { 
      await qc.invalidateQueries({ queryKey: ['episodios', pacienteId] }); 
      await refetch(); 
    }
  });

  return (
    <View style={{ flex:1, padding:16 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TouchableOpacity 
          onPress={()=>nav.navigate('EvolucaoForm' as never, { episodioId: episodio?.id ?? '' } as never)} 
          disabled={!episodio}
          style={{ 
            backgroundColor: episodio ? '#4CAF50' : '#9E9E9E', 
            padding:12, 
            borderRadius:6, 
            flex: 1 
          }}
        >
          <Text style={{ color:'#fff', textAlign:'center' }}>Nova Evolução</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={()=>nav.navigate('ReceitaForm' as never, { pacienteId, evolucaoId: episodio?.id } as never)} 
          disabled={!episodio}
          style={{ 
            backgroundColor: episodio ? '#FF5722' : '#9E9E9E', 
            padding:12, 
            borderRadius:6, 
            flex: 1 
          }}
        >
          <Text style={{ color:'#fff', textAlign:'center' }}>Receita</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        onPress={()=>nav.navigate('ExportProntuario' as never, { pacienteId } as never)}
        style={{ 
          backgroundColor: '#9C27B0', 
          padding:12, 
          borderRadius:6, 
          marginBottom: 12 
        }}
      >
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'600' }}>📄 Exportar Prontuário</Text>
      </TouchableOpacity>

      {!episodio ? (
        <TouchableOpacity onPress={()=>novoEpisodio()} style={{ backgroundColor:'#1976D2', padding:12, borderRadius:6 }}>
          <Text style={{ color:'#fff', textAlign:'center' }}>Abrir Episódio</Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          data={evolucoes}
          keyExtractor={(i)=>i.id}
          renderItem={({ item }) => (
            <View style={{ backgroundColor:'#fff', padding:12, borderRadius:6, marginBottom:8, elevation:1 }}>
              <Text style={{ fontWeight:'700' }}>{item.resumo}</Text>
              <Text style={{ opacity:0.7, marginTop:4 }}>{new Date(item.registradoEm).toLocaleString('pt-BR')}</Text>
              <TouchableOpacity 
                onPress={() => nav.navigate('AnexosList' as never, { evolucaoId: item.id } as never)}
                style={{ backgroundColor:'#FF9800', padding:8, borderRadius:4, marginTop:8, alignSelf:'flex-start' }}
              >
                <Text style={{ color:'#fff', fontSize:12 }}>📎 Anexos</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
