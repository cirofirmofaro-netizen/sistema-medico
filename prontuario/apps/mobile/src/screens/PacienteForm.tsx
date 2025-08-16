import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { z } from 'zod'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createPaciente } from '../services/pacientes';
import { useNavigation } from '@react-navigation/native';

const schema = z.object({
  nome: z.string().nonempty(),
  dtNasc: z.string().optional(),
  sexo: z.string().optional(),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  endereco: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function PacienteForm() {
  const nav = useNavigation();
  const { setValue, handleSubmit, formState:{ errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (f: FormData) => {
    try { 
      await createPaciente(f as any); 
      Alert.alert('OK','Paciente criado'); 
      nav.goBack(); 
    }
    catch { 
      Alert.alert('Erro','Não foi possível salvar'); 
    }
  }

  const Input = (label:string, name: keyof FormData, kb?: any) => (
    <View style={{ marginBottom:12 }}>
      <Text style={{ marginBottom:6, fontWeight:'600' }}>{label}</Text>
      <TextInput 
        style={{ borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:6 }} 
        keyboardType={kb}
        onChangeText={(t)=>setValue(name, t as any)} 
      />
      {errors[name] && <Text style={{ color:'red' }}>{String(errors[name]?.message)}</Text>}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding:16 }}>
      {Input('Nome*','nome')}
      {Input('Data de Nascimento (YYYY-MM-DD)','dtNasc')}
      {Input('Sexo','sexo')}
      {Input('CPF','cpf','numeric')}
      {Input('Telefone','telefone','phone-pad')}
      {Input('Email','email','email-address')}
      {Input('Endereço','endereco')}
      <TouchableOpacity onPress={handleSubmit(onSubmit)} style={{ backgroundColor:'#4CAF50', padding:14, borderRadius:6 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
