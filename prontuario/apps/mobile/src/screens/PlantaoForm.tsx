import React, { useState, useMemo } from 'react';
import { View, ScrollView, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, TouchableRipple } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createPlantao } from '../services/plantoes';
import { useNavigation } from '@react-navigation/native';
import { MaskedTextInput } from 'react-native-mask-text';
import { parseMoneyBR, moneyBR } from '../utils/format';
import { useSettings } from '../stores/useSettings';

const schema = z.object({
  local: z.string().nonempty(),
  contratante: z.string().nonempty(),
  tipo: z.string().nonempty(),
  valorBrutoMasked: z.string().nonempty(),
  notas: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function PlantaoForm() {
  const nav = useNavigation();
  const { aliquota } = useSettings();

  const { setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [inicioData, setInicioData] = useState<Date>(new Date());
  const [inicioHora, setInicioHora] = useState<Date>(new Date());
  const [fimData, setFimData] = useState<Date>(new Date());
  const [fimHora, setFimHora] = useState<Date>(new Date(Date.now() + 4 * 60 * 60 * 1000));

  const [show, setShow] = useState<{ k?: string }>({});

  const valorBruto = useMemo(() => parseMoneyBR(watch('valorBrutoMasked') || ''), [watch('valorBrutoMasked')]);
  const valorLiquido = useMemo(() => Number((valorBruto * (1 - aliquota)).toFixed(2)), [valorBruto, aliquota]);

  const isoFromDateTime = (d: Date, t: Date) => {
    const dt = new Date(d);
    dt.setHours(t.getHours(), t.getMinutes(), 0, 0);
    return dt.toISOString();
    // Se quiser timezone local, ajustar conforme necessidade.
  };

  const onSubmit = async (form: FormData) => {
    try {
      await createPlantao({
        inicio: isoFromDateTime(inicioData, inicioHora),
        fim: isoFromDateTime(fimData, fimHora),
        local: form.local,
        contratante: form.contratante,
        tipo: form.tipo,
        valorBruto,
        valorLiquido,
        statusPgto: 'PENDENTE',
        notas: form.notas,
      } as any);
      Alert.alert('Sucesso', 'Plantão criado com sucesso!');
      nav.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível criar o plantão.');
    }
  };

  const L = ({ label, children }: any) => (
    <View style={{ marginBottom: 12 }}>
      <Text variant="labelLarge" style={{ marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Início - Data e Hora separadas */}
      <L label="Início - Data">
        <TouchableRipple onPress={() => setShow({ k: 'inicioData' })}>
          <TextInput
            mode="outlined"
            value={inicioData.toLocaleDateString('pt-BR')}
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
          />
        </TouchableRipple>
        {show.k === 'inicioData' && (
          <DateTimePicker
            value={inicioData}
            mode="date"
            display={Platform.OS === 'android' ? 'default' : 'inline'}
            onChange={(_, d) => { setShow({}); if (d) setInicioData(d); }}
          />
        )}
      </L>
      <L label="Início - Hora">
        <TouchableRipple onPress={() => setShow({ k: 'inicioHora' })}>
          <TextInput
            mode="outlined"
            value={inicioHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            editable={false}
            right={<TextInput.Icon icon="clock" />}
          />
        </TouchableRipple>
        {show.k === 'inicioHora' && (
          <DateTimePicker
            value={inicioHora}
            mode="time"
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={(_, d) => { setShow({}); if (d) setInicioHora(d); }}
          />
        )}
      </L>

      {/* Fim - Data e Hora separadas */}
      <L label="Fim - Data">
        <TouchableRipple onPress={() => setShow({ k: 'fimData' })}>
          <TextInput
            mode="outlined"
            value={fimData.toLocaleDateString('pt-BR')}
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
          />
        </TouchableRipple>
        {show.k === 'fimData' && (
          <DateTimePicker
            value={fimData}
            mode="date"
            display={Platform.OS === 'android' ? 'default' : 'inline'}
            onChange={(_, d) => { setShow({}); if (d) setFimData(d); }}
          />
        )}
      </L>
      <L label="Fim - Hora">
        <TouchableRipple onPress={() => setShow({ k: 'fimHora' })}>
          <TextInput
            mode="outlined"
            value={fimHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            editable={false}
            right={<TextInput.Icon icon="clock" />}
          />
        </TouchableRipple>
        {show.k === 'fimHora' && (
          <DateTimePicker
            value={fimHora}
            mode="time"
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={(_, d) => { setShow({}); if (d) setFimHora(d); }}
          />
        )}
      </L>

      {/* Campos de texto */}
      <L label="Local">
        <TextInput 
          mode="outlined"
          placeholder="Hospital X" 
          onChangeText={(t)=>setValue('local', t)} 
        />
        {errors.local && <Text style={{ color: 'red' }}>{errors.local.message as string}</Text>}
      </L>

      <L label="Contratante">
        <TextInput 
          mode="outlined"
          placeholder="Clínica Y" 
          onChangeText={(t)=>setValue('contratante', t)} 
        />
        {errors.contratante && <Text style={{ color: 'red' }}>{errors.contratante.message as string}</Text>}
      </L>

      <L label="Tipo">
        <TextInput 
          mode="outlined"
          placeholder="UTI / PA / CTI" 
          onChangeText={(t)=>setValue('tipo', t)} 
        />
        {errors.tipo && <Text style={{ color: 'red' }}>{errors.tipo.message as string}</Text>}
      </L>

      {/* Moeda com máscara */}
      <L label="Valor Bruto (R$)">
        <MaskedTextInput
          mask="R$ 999.999.999,99"
          keyboardType="numeric"
          onChangeText={(t)=>setValue('valorBrutoMasked', t)}
          style={{ borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:6 }}
        />
        {errors.valorBrutoMasked && <Text style={{ color: 'red' }}>{errors.valorBrutoMasked.message as string}</Text>}
        <Text style={{ marginTop: 6, opacity: 0.8 }}>
          Alíquota: {(aliquota*100).toFixed(2)}% • Líquido estimado: {moneyBR(valorLiquido)}
        </Text>
      </L>

      <L label="Notas (opcional)">
        <TextInput 
          mode="outlined"
          placeholder="Observações" 
          multiline 
          numberOfLines={3} 
          onChangeText={(t)=>setValue('notas', t)} 
        />
      </L>

      <Button 
        mode="contained" 
        onPress={handleSubmit(onSubmit)}
        style={{ marginTop: 16 }}
      >
        Salvar
      </Button>
    </ScrollView>
  );
}
