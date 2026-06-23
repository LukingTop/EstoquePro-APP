import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export function useAppUpdates() {
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Atualização disponível',
            'Uma nova versão foi baixada. O app será reiniciado para aplicar as mudanças.',
            [{ text: 'Reiniciar', onPress: () => Updates.reloadAsync() }]
          );
        }
      } catch (error) {
        console.log('Erro ao verificar atualizações OTA:', error);
      }
    };

    checkForUpdates();
  }, []);
}