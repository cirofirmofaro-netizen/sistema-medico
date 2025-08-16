import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useSettings } from '../stores/useSettings';

export default function SettingsScreen() {
  const { aliquota, setAliquota } = useSettings();
  const [txt, setTxt] = React.useState(String(aliquota * 100));

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '700' }}>Configurações</Text>
      <Text>Alíquota (em %)</Text>
      <TextInput
        value={txt}
        keyboardType="numeric"
        onChangeText={(t) => {
          setTxt(t);
          const n = Number(t.replace(',', '.'));
          if (!isNaN(n)) setAliquota(Math.max(0, Math.min(100, n)) / 100);
        }}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 }}
      />
      <Text style={{ opacity: 0.7 }}>Atual: {(aliquota * 100).toFixed(2)}%</Text>
    </View>
  );
}
