import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';
import { listPlantoesFiltered, Plantao } from '../services/plantoes';
import { moneyBR, dt } from '../utils/format';
import { useSettings } from '../stores/useSettings';
import { Picker } from '@react-native-picker/picker';

function sum(nums: number[]) { return nums.reduce((a,b)=>a+(Number(b)||0), 0); }

export default function FinanceiroResumo() {
  const { aliquota } = useSettings();

  // Período
  const [from, setFrom] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [to, setTo] = useState<Date>(new Date());
  const [show, setShow] = useState<{k?: 'from'|'to'}>({});

  // Filtros extras
  const [contratante, setContratante] = useState<string>('');
  const [tipo, setTipo] = useState<string>('');
  const [statusPgto, setStatusPgto] = useState<'PENDENTE'|'PAGO'|'PARCIAL'|'ATRASADO'|''>('');

  const params = useMemo(() => ({
    from: from.toISOString(),
    to: to.toISOString(),
    contratante: contratante || undefined,
    tipo: tipo || undefined,
    statusPgto: (statusPgto as any) || undefined,
  }), [from, to, contratante, tipo, statusPgto]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['plantoes','financeiro', params],
    queryFn: () => listPlantoesFiltered(params)
  });

  const brutoTotal = useMemo(() => sum((data||[]).map(p => p.valorBruto)), [data]);
  const liquidoTotal = useMemo(() =>
    sum((data||[]).map(p => (p.valorLiquido ?? Number((p.valorBruto * (1 - aliquota)).toFixed(2))))),
  [data, aliquota]);

  const pagos = useMemo(() => (data||[]).filter(p => p.statusPgto === 'PAGO'), [data]);
  const pendentes = useMemo(() => (data||[]).filter(p => p.statusPgto !== 'PAGO'), [data]);
  const brutoPagos = sum(pagos.map(p => p.valorBruto));
  const brutoPend = sum(pendentes.map(p => p.valorBruto));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {/* Período */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>De</Text>
          <TouchableOpacity onPress={()=>setShow({k:'from'})} style={{ borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:6 }}>
            <Text>{from.toLocaleDateString('pt-BR')}</Text>
          </TouchableOpacity>
          {show.k==='from' && (
            <DateTimePicker value={from} mode="date" display={Platform.OS==='android'?'default':'inline'}
              onChange={(_,d)=>{ setShow({}); if(d) setFrom(d); }} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Até</Text>
          <TouchableOpacity onPress={()=>setShow({k:'to'})} style={{ borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:6 }}>
            <Text>{to.toLocaleDateString('pt-BR')}</Text>
          </TouchableOpacity>
          {show.k==='to' && (
            <DateTimePicker value={to} mode="date" display={Platform.OS==='android'?'default':'inline'}
              onChange={(_,d)=>{ setShow({}); if(d) setTo(d); }} />
          )}
        </View>
      </View>

      {/* Filtros: contratante / tipo / status */}
      <View style={{ backgroundColor:'#fff', padding:12, borderRadius:8, elevation:2, gap: 8 }}>
        <Text style={{ fontWeight:'700' }}>Filtros</Text>
        <View>
          <Text style={{ marginBottom: 4 }}>Contratante</Text>
          <TextInput
            value={contratante}
            onChangeText={setContratante}
            placeholder="ex: Clínica Y"
            style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:10 }}
          />
        </View>
        <View>
          <Text style={{ marginBottom: 4 }}>Tipo</Text>
          <TextInput
            value={tipo}
            onChangeText={setTipo}
            placeholder="ex: UTI, PA, CTI"
            style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:10 }}
          />
        </View>
        <View>
          <Text style={{ marginBottom: 4 }}>Status</Text>
          <View style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6 }}>
            <Picker
              selectedValue={statusPgto}
              onValueChange={(v) => setStatusPgto(v)}
            >
              <Picker.Item label="(Todos)" value="" />
              <Picker.Item label="Pendente" value="PENDENTE" />
              <Picker.Item label="Pago" value="PAGO" />
              <Picker.Item label="Parcial" value="PARCIAL" />
              <Picker.Item label="Atrasado" value="ATRASADO" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity onPress={()=>refetch()} style={{ backgroundColor:'#1976D2', padding:12, borderRadius:6 }}>
          <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>Aplicar filtros</Text>
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View style={{ gap: 12 }}>
        <View style={{ backgroundColor:'#fff', padding:14, borderRadius:8, elevation:2 }}>
          <Text style={{ fontWeight:'700' }}>Bruto (período)</Text>
          <Text style={{ fontSize:20 }}>{moneyBR(brutoTotal)}</Text>
        </View>
        <View style={{ backgroundColor:'#fff', padding:14, borderRadius:8, elevation:2 }}>
          <Text style={{ fontWeight:'700' }}>Líquido estimado</Text>
          <Text style={{ fontSize:20 }}>{moneyBR(liquidoTotal)}</Text>
          <Text style={{ opacity:0.7, marginTop:4 }}>Alíquota atual: {(aliquota*100).toFixed(2)}%</Text>
        </View>
        <View style={{ backgroundColor:'#fff', padding:14, borderRadius:8, elevation:2 }}>
          <Text style={{ fontWeight:'700' }}>Pagos</Text>
          <Text>{pagos.length} plantões • {moneyBR(brutoPagos)}</Text>
        </View>
        <View style={{ backgroundColor:'#fff', padding:14, borderRadius:8, elevation:2 }}>
          <Text style={{ fontWeight:'700' }}>Pendentes</Text>
          <Text>{pendentes.length} plantões • {moneyBR(brutoPend)}</Text>
        </View>
      </View>

      {/* Lista compacta */}
      <View style={{ marginTop: 8 }}>
        {(data||[]).map((p)=>(
          <View key={p.id} style={{ backgroundColor:'#fff', padding:12, borderRadius:6, marginTop:8, elevation:1 }}>
            <Text style={{ fontWeight:'600' }}>{p.local} • {p.tipo}</Text>
            <Text>{dt(p.inicio)} → {dt(p.fim)}</Text>
            <Text>{moneyBR(p.valorBruto)} {p.valorLiquido ? `• Líq: ${moneyBR(p.valorLiquido)}` : ''} • {p.statusPgto}</Text>
          </View>
        ))}
      </View>

      {/* Ações */}
      <TouchableOpacity onPress={()=>refetch()} style={{ backgroundColor:'#4CAF50', padding:12, borderRadius:6, marginTop:12 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>Atualizar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
