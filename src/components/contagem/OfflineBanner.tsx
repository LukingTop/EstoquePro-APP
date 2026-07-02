import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OfflineBannerProps {
  quantidadeOffline: number;
  isRecontagem: boolean;
  onSincronizar: () => void;
  salvando: boolean;
}

export default function OfflineBanner({ 
  quantidadeOffline, 
  isRecontagem, 
  onSincronizar, 
  salvando 
}: OfflineBannerProps) {
  
  
  if (quantidadeOffline === 0 || isRecontagem) {
    return null;
  }

  return (
    <View style={styles.bannerOffline}>
      <View style={styles.bannerInfo}>
        <Ionicons name="cloud-offline" size={24} color="#92400e" />
        <Text style={styles.bannerTexto}>Você tem {quantidadeOffline} contagens offline.</Text>
      </View>
      <TouchableOpacity style={styles.btnSincronizar} onPress={onSincronizar} disabled={salvando}>
        {salvando ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnSincronizarTexto}>SINCRONIZAR</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerOffline: {
    backgroundColor: '#fff7ed',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#C2410C',
    elevation: 2,
  },
  bannerInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  bannerTexto: { 
    color: '#92400e', 
    fontWeight: '600', 
    marginLeft: 10, 
    flex: 1, 
    fontSize: 15 
  },
  btnSincronizar: { 
    backgroundColor: '#C2410C',
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  btnSincronizarTexto: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
});