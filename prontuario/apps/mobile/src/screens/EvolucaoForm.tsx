import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form'; 
import { z } from 'zod'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { criarEvolucao } from '../services/evolucoes';
import { useNavigation, useRoute } from '@react-navigation/native';

const schema = z.object({
  resumo: z.string().nonempty(),
  texto: z.string().nonempty(),
  pa: z.string().optional(),
  fc: z.string().optional(),
  fr: z.string().optional(),
  sat: z.string().optional(),
  temp: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function EvolucaoForm() {
  const nav = useNavigation(); 
  const route = useRoute<any>();
  const episodioId = route.params?.episodioId as string;

  const { setValue, handleSubmit, formState:{ errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (f: FormData) => {
    try {
      const sinaisVitais = { pa:f.pa, fc:f.fc, fr:f.fr, sat:f.sat, temp:f.temp };
      await criarEvolucao({ episodioId, resumo: f.resumo, texto: f.texto, sinaisVitais });
      Alert.alert('OK','Evolução registrada'); 
      nav.goBack();
    } catch { 
      Alert.alert('Erro','Não foi possível salvar'); 
    }
  };

  const Input = (label:string, name: keyof FormData, multiline=false) => (
    <View style={{ marginBottom:12 }}>
      <Text style={{ marginBottom:6, fontWeight:'600' }}>{label}</Text>
      <TextInput 
        multiline={multiline} 
        numberOfLines={multiline?4:1}
        style={{ borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:6 }}
        onChangeText={(t)=>setValue(name, t as any)} 
      />
      {errors[name] && <Text style={{ color:'red' }}>{String(errors[name]?.message)}</Text>}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding:16 }}>
      {Input('Resumo*','resumo')}
      {Input('Texto*','texto', true)}
      <View style={{ flexDirection:'row', gap:8 }}>
        <View style={{ flex:1 }}>{Input('PA','pa')}</View>
        <View style={{ flex:1 }}>{Input('FC','fc')}</View>
      </View>
      <View style={{ flexDirection:'row', gap:8 }}>
        <View style={{ flex:1 }}>{Input('FR','fr')}</View>
        <View style={{ flex:1 }}>{Input('Sat O₂','sat')}</View>
      </View>
      {Input('Temperatura','temp')}
      <TouchableOpacity onPress={handleSubmit(onSubmit)} style={{ backgroundColor:'#4CAF50', padding:14, borderRadius:6 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
