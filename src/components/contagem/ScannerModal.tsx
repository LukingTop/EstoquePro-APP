import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';

interface ScannerModalProps {
  visivel: boolean;
  escaneado: boolean;
  onLerCodigo: (data: any) => void;
  onFechar: () => void;
}

export default function ScannerModal({ visivel, escaneado, onLerCodigo, onFechar }: ScannerModalProps) {
  return (
    <Modal visible={visivel} animationType="slide">
      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera} 
          onBarcodeScanned={escaneado ? undefined : onLerCodigo} 
        />
        <TouchableOpacity style={styles.btnFecharCamera} onPress={onFechar}>
          <Text style={styles.btnTexto}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  btnFecharCamera: {
    backgroundColor: '#dc2626',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});