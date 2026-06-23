import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import type { Notification, NotificationResponse } from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        
        enviarTokenQuandoLogado(token);
      }
    });

    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification: Notification) => {
        console.log('Notificação recebida em primeiro plano:', notification);
      }
    );

    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(
      (response: NotificationResponse) => {
        console.log('Operador clicou na notificação:', response.notification.request.content.data);
      }
    );

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  const enviarTokenQuandoLogado = async (token: string) => {
   
    await SecureStore.setItemAsync('pushToken', token);

    
    const userToken = await SecureStore.getItemAsync('userToken');
    if (!userToken) {
      console.log('Usuário não logado. Push token será enviado após o login.');
      return;
    }

    try {
      await api.post('/operador/atualizar-token/', { token });
      console.log('Push Token sincronizado com o servidor Django.');
     
      await SecureStore.deleteItemAsync('pushToken');
    } catch (error) {
      console.error('Erro ao enviar push token para o backend:', error);
      
    }
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563eb',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação push negada pelo usuário.');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token gerado:', token);
  } else {
    console.log('Notificações Push exigem um dispositivo físico.');
  }

  return token;
}