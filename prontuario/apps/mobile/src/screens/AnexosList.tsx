import * as React from 'react';
import { View, TouchableOpacity, Text, FlatList, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarAnexos, presign, finalize, getDownloadUrl, Anexo } from '../services/anexos';
import * as WebBrowser from 'expo-web-browser';
import { useRoute } from '@react-navigation/native';

export default function AnexosList() {
  const route = useRoute<any>();
  const evolucaoId = route.params?.evolucaoId as string;
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['anexos', evolucaoId],
    queryFn: () => listarAnexos(evolucaoId),
    enabled: !!evolucaoId,
  });

  const up = useMutation({
    mutationFn: async () => {
      const pick = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false, type: '*/*' });
      if (pick.canceled || !pick.assets?.[0]) return;
      const f = pick.assets[0];
      const info = await FileSystem.getInfoAsync(f.uri, { size: true });
      const size = Number((info as any).size || f.size || 0);

      const { uploadUrl, storageKey } = await presign(evolucaoId, {
        filename: f.name || 'arquivo',
        mimeType: f.mimeType || 'application/octet-stream',
        size,
      });

      const bin = await FileSystem.readAsStringAsync(f.uri, { encoding: FileSystem.EncodingType.Base64 });
      const resp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': f.mimeType || 'application/octet-stream' },
        body: Uint8Array.from(atob(bin), c => c.charCodeAt(0)),
      });
      if (!resp.ok) throw new Error('Falha no upload');

      await finalize(evolucaoId, {
        filename: f.name || 'arquivo',
        mimeType: f.mimeType || 'application/octet-stream',
        size,
        storageKey,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anexos', evolucaoId] }),
    onError: (e: any) => Alert.alert('Erro', e.message || 'Não foi possível enviar'),
  });

  return (
    <View style={{ flex:1, padding:16 }}>
      <TouchableOpacity onPress={() => up.mutate()} style={{ backgroundColor:'#1976D2', padding:12, borderRadius:6, marginBottom:12 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>Adicionar Anexo</Text>
      </TouchableOpacity>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={async () => {
              try {
                if (item.urlPublica) return WebBrowser.openBrowserAsync(item.urlPublica);
                const { url } = await getDownloadUrl(item.id);
                await WebBrowser.openBrowserAsync(url);
              } catch {
                Alert.alert('Erro', 'Não foi possível abrir o anexo.');
              }
            }}
            style={{ backgroundColor:'#fff', padding:12, borderRadius:6, marginBottom:8, elevation:1 }}
          >
            <Text style={{ fontWeight:'600' }}>{item.filename}</Text>
            <Text style={{ opacity:0.7 }}>{item.mimeType} • {Math.round(item.size/1024)} KB</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
