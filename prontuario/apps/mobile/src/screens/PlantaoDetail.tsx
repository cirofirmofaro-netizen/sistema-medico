import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPlantao, registrarPagamento } from '../services/plantoes';
import { dt, moneyBR } from '../utils/format';

export default function PlantaoDetail() {
  const route = useRoute<any>();
  const nav = useNavigation();
  const qc = useQueryClient();
  const id = route.params?.id as string;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['plantao', id],
    queryFn: () => getPlantao(id)
  });

  const [valorPago, setValorPago] = React.useState<string>('');
  const [dtPgto, setDtPgto] = React.useState<string>('');

  const { mutateAsync, isLoading: saving } = useMutation({
    mutationFn: () => registrarPagamento(id, { valorPago: Number(valorPago.replace(',', '.')), dtPgto }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['plantao', id] });
      await qc.invalidateQueries({ queryKey: ['plantoes'] });
      Alert.alert('OK', 'Pagamento registrado');
      setValorPago('');
      setDtPgto('');
      refetch();
    },
    onError: () => Alert.alert('Erro', 'Falha ao registrar pagamento'),
  });

  useLayoutEffect(() => {
    nav.setOptions({ title: 'Detalhe do Plantão' });
  }, [nav]);

  if (isLoading || !data) return <Text style={{ padding: 16 }}>Carregando...</Text>;

  const p = data;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, elevation: 2 }}>
        <Text style={{ fontSize: 16, fontWeight: '700' }}>{p.local}</Text>
        <Text>{p.contratante} • {p.tipo}</Text>
        <Text>Início: {dt(p.inicio)}</Text>
        <Text>Fim: {dt(p.fim)}</Text>
        <Text>Bruto: {moneyBR(p.valorBruto)} {p.valorLiquido ? `• Líquido: ${moneyBR(p.valorLiquido)}` : ''}</Text>
        <Text>Status: {p.statusPgto}</Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>{p.notas ?? ''}</Text>
      </View>

      <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, elevation: 2 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>Pagamentos</Text>
        {(p.pagamentos?.length ? p.pagamentos : []).map((pg: any, i: number) => (
          <View key={i} style={{ paddingVertical: 6, borderBottomWidth: i === p.pagamentos.length - 1 ? 0 : 1, borderColor: '#eee' }}>
            <Text>{moneyBR(pg.valorPago)} • {dt(pg.dtPgto)}</Text>
            {pg.obs ? <Text style={{ opacity: 0.7 }}>{pg.obs}</Text> : null}
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, elevation: 2, gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>Registrar pagamento</Text>
        <TextInput
          placeholder="Valor pago (ex: 1200,00)"
          keyboardType="numeric"
          value={valorPago}
          onChangeText={setValorPago}
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 }}
        />
        <TextInput
          placeholder="Data de pagamento ISO (ex: 2025-08-12T15:00:00Z)"
          value={dtPgto}
          onChangeText={setDtPgto}
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 }}
        />
        <TouchableOpacity
          disabled={saving || !valorPago}
          onPress={() => mutateAsync()}
          style={{ backgroundColor: '#4CAF50', padding: 12, borderRadius: 6, opacity: saving || !valorPago ? 0.6 : 1 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
            {saving ? 'Salvando...' : 'Salvar pagamento'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
