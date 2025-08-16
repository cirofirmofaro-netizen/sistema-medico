import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { openDatabaseSync } from 'expo-sqlite/next';

// Abre o banco de dados SQLite
const sqlite = openDatabaseSync('prontuario.db');

// Cria a instância do Drizzle
export const db = drizzle(sqlite);
