import * as SQLite from 'expo-sqlite';
import api from './api';

let db: SQLite.SQLiteDatabase;

function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('estoque_offline.db');
  }
  return db;
}


export function initOfflineDatabase(): void {
  const database = getDatabase();
  database.execSync(`
    CREATE TABLE IF NOT EXISTS ruas (
      id INTEGER PRIMARY KEY,
      codigo TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS enderecos (
      id INTEGER PRIMARY KEY,
      codigo TEXT UNIQUE,
      rua_codigo TEXT,
      predio_num INTEGER,
      posicao_num INTEGER,
      rua_num INTEGER
    );
  `);
}

// Baixa todas as ruas e armazena localmente
export async function cacheRuas(): Promise<void> {
  try {
    const response = await api.get('/ruas/');
    const ruas = response.data.results || response.data;
    const database = getDatabase();

    const statement = database.prepareSync(
      'INSERT OR REPLACE INTO ruas (id, codigo) VALUES (?, ?)'
    );

    for (const rua of ruas) {
      statement.executeSync([rua.id, rua.codigo]);
    }

    statement.finalizeSync();
    console.log(`${ruas.length} ruas salvas offline.`);
  } catch (error) {
    console.error('Erro ao cachear ruas:', error);
  }
}

// Baixa todos os endereços de uma rua e armazena localmente
export async function cacheEnderecos(ruaCodigo: string): Promise<void> {
  try {
    const response = await api.get('/enderecos/', { params: { rua_codigo: ruaCodigo } });
    const enderecos = response.data.results || response.data;
    const database = getDatabase();

    const statement = database.prepareSync(
      `INSERT OR REPLACE INTO enderecos (id, codigo, rua_codigo, predio_num, posicao_num, rua_num)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (const endereco of enderecos) {
      statement.executeSync([
        endereco.id,
        endereco.codigo,
        ruaCodigo,
        endereco.predio_num || 0,
        endereco.posicao_num || 0,
        endereco.rua_num || 0,
      ]);
    }

    statement.finalizeSync();
    console.log(`${enderecos.length} endereços da rua ${ruaCodigo} salvos offline.`);
  } catch (error) {
    console.error('Erro ao cachear endereços:', error);
  }
}

// Obtém ruas do cache local
export function getRuasOffline(): Promise<any[]> {
  const database = getDatabase();
  const rows = database.getAllSync('SELECT * FROM ruas ORDER BY codigo');
  return Promise.resolve(rows);
}

// Obtém endereços de uma rua do cache local
export function getEnderecosOffline(ruaCodigo: string): Promise<any[]> {
  const database = getDatabase();
  const rows = database.getAllSync(
    'SELECT * FROM enderecos WHERE rua_codigo = ? ORDER BY predio_num, posicao_num',
    [ruaCodigo]
  );
  return Promise.resolve(rows);
}