import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { exportarProntuario } from '../services/export';
import * as WebBrowser from 'expo-web-browser';

export default function ExportProntuario() {
  const route = useRoute<any>();
  const pacienteId = route.params?.pacienteId as string;

  const [from, setFrom] = React.useState<string | undefined>();
  const [to, setTo] = React.useState<string | undefined>();
  const [anexos, setAnexos] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const run = async () => {
    try {
      setLoading(true);
      const res = await exportarProntuario({ pacienteId, from, to, incluirAnexos: anexos });
      await WebBrowser.openBrowserAsync(res.url);
    } catch (e:any) {
      Alert.alert('Erro', e?.message || 'Falha ao exportar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex:1, padding:16, gap:12 }}>
      <Text style={{ fontWeight:'700', fontSize:18 }}>Exportar Prontuário</Text>
      <Text>Período (YYYY-MM-DD)</Text>
      <TextInput placeholder="De (opcional)" value={from} onChangeText={setFrom}
        style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:10 }} />
      <TextInput placeholder="Até (opcional)" value={to} onChangeText={setTo}
        style={{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:10 }} />

      <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginTop:8 }}>
        <Switch value={anexos} onValueChange={setAnexos} />
        <Text>Incluir anexos (gera ZIP)</Text>
      </View>

      <TouchableOpacity onPress={run} disabled={loading}
        style={{ backgroundColor:'#4CAF50', padding:14, borderRadius:6, marginTop:12 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>
          {loading ? 'Gerando…' : (anexos ? 'Gerar ZIP' : 'Gerar PDF')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
