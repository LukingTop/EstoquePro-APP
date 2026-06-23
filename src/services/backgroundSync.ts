import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import api from './api';

const BACKGROUND_SYNC_TASK = 'estoque-background-sync';


async function sincronizarContagensOffline(): Promise<void> {
  try {
    const dados = await SecureStore.getItemAsync('contagensOffline');
    const filaPendente = dados ? JSON.parse(dados) : [];
    if (filaPendente.length === 0) return;

    const contagensComErro: any[] = [];
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return; 

    for (const item of filaPendente) {
      try {
        await api.post('/contagens/', {
          endereco: item.endereco,
          codigo_produto: item.codigo_produto,
          descricao_produto: item.descricao_produto,
          pallets: item.pallets,
          observacao: item.observacao,
          id_local: item.id_local,
        }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,   
        });
      } catch (error) {
        
        contagensComErro.push(item);
      }
    }

    
    await SecureStore.setItemAsync('contagensOffline', JSON.stringify(contagensComErro));
    console.log(`[BackgroundSync] ${filaPendente.length - contagensComErro.length} enviadas, ${contagensComErro.length} restantes.`);
  } catch (error) {
    console.error('[BackgroundSync] Erro geral:', error);
  }
}


TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    await sincronizarContagensOffline();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});


export async function registerBackgroundSync(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.log('[BackgroundSync] Background fetch negado pelo usuário.');
      return;
    }

    const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!registered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60,   
        stopOnTerminate: false,     
        startOnBoot: true,          
      });
      console.log('[BackgroundSync] Tarefa registrada com sucesso.');
    } else {
      console.log('[BackgroundSync] Tarefa já registrada.');
    }
  } catch (error) {
    console.error('[BackgroundSync] Erro ao registrar:', error);
  }
}