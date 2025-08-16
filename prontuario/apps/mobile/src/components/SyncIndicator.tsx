import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSyncScheduler } from '../sync/schedule';

export default function SyncIndicator() {
  const { isRunning, lastSyncAt, error, syncNow } = useSyncScheduler();

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Nunca';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={styles.statusIndicator}>
          {isRunning ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <View style={[styles.dot, error ? styles.dotError : styles.dotSuccess]} />
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>
            {isRunning ? 'Sincronizando...' : error ? 'Erro na sincronização' : 'Sincronizado'}
          </Text>
          <Text style={styles.lastSyncText}>
            Última sincronização: {formatLastSync(lastSyncAt)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.syncButton, isRunning && styles.syncButtonDisabled]}
        onPress={syncNow}
        disabled={isRunning}
      >
        <Text style={styles.syncButtonText}>
          {isRunning ? 'Sincronizando...' : 'Sync'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    marginRight: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotSuccess: {
    backgroundColor: '#28a745',
  },
  dotError: {
    backgroundColor: '#dc3545',
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: '#ccc',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
