import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { criarReceita, urlDocumento } from '../services/documentos';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';

type Item = { medicamento: string; posologia: string; quantidade?: string };

export default function ReceitaForm() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const pacienteId = route.params?.pacienteId as string;
  const evolucaoId = route.params?.evolucaoId as string | undefined;

  const [itens, setItens] = React.useState<Item[]>([{ medicamento:'', posologia:'', quantidade:'' }]);
  const [observacoes, setObs] = React.useState('');
  const [assinaturaB64, setAssinaturaB64] = React.useState<string | undefined>();

  const addItem = () => setItens((l)=>[...l, { medicamento:'', posologia:'', quantidade:'' }]);
  const setItem = (i: number, k: keyof Item, v: string) => {
    setItens((arr)=> arr.map((it,idx)=> idx===i ? { ...it, [k]: v } : it));
  };

  const pickSignature = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, allowsEditing: false });
    if (!res.canceled && res.assets[0]?.base64) {
      const mime = res.assets[0].mimeType || 'image/png';
      setAssinaturaB64(`data:${mime};base64,${res.assets[0].base64}`);
    }
  };

  const mut = useMutation({
    mutationFn: async () => {
      const doc = await criarReceita({ pacienteId, evolucaoId, itens, observacoes, assinaturaImagemBase64: assinaturaB64 });
      const { url } = await urlDocumento(doc.id);
      await WebBrowser.openBrowserAsync(url);
      return doc;
    },
    onError: (e: any) => Alert.alert('Erro', e?.message || 'Falha ao gerar receita'),
    onSuccess: () => nav.goBack(),
  });

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontWeight:'700', fontSize:18, marginBottom:8 }}>Nova Receita</Text>

      {itens.map((it, i)=>(
        <View key={i} style={{ backgroundColor:'#fff', padding:12, borderRadius:8, gap:6, marginBottom:8 }}>
          <Text style={{ fontWeight:'600' }}>Item {i+1}</Text>
          <TextInput placeholder="Medicamento" value={it.medicamento} onChangeText={(t)=>setItem(i,'medicamento', t)}
            style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:10 }} />
          <TextInput placeholder="Posologia" value={it.posologia} onChangeText={(t)=>setItem(i,'posologia', t)}
            style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:10 }} />
          <TextInput placeholder="Quantidade (opcional)" value={it.quantidade} onChangeText={(t)=>setItem(i,'quantidade', t)}
            style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:10 }} />
        </View>
      ))}

      <TouchableOpacity onPress={addItem} style={{ backgroundColor:'#1976D2', padding:12, borderRadius:6 }}>
        <Text style={{ color:'#fff', textAlign:'center' }}>Adicionar Item</Text>
      </TouchableOpacity>

      <Text style={{ marginTop:10, fontWeight:'600' }}>Observações</Text>
      <TextInput placeholder="Ex.: Não substituir. Validade: 30 dias." value={observacoes} onChangeText={setObs}
        style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:10 }} multiline />

      <View style={{ marginTop:10, gap:8 }}>
        <Text style={{ fontWeight:'600' }}>Assinatura (imagem opcional)</Text>
        {assinaturaB64 ? <Image source={{ uri: assinaturaB64 }} style={{ width:180, height:60, resizeMode:'contain', backgroundColor:'#f2f2f2' }} /> : null}
        <TouchableOpacity onPress={pickSignature} style={{ backgroundColor:'#455A64', padding:12, borderRadius:6 }}>
          <Text style={{ color:'#fff', textAlign:'center' }}>{assinaturaB64 ? 'Trocar imagem' : 'Selecionar imagem'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={()=>mut.mutate()} disabled={mut.isLoading}
        style={{ backgroundColor:'#4CAF50', padding:14, borderRadius:6, marginTop:16 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>{mut.isLoading ? 'Gerando...' : 'Gerar PDF'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
