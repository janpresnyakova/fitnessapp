import SQLite, { DatabaseParams, Location, SQLiteDatabase } from 'react-native-sqlite-storage';
import { initializeDatabase } from './migrations';
import { DatabaseClient, SQLPrimitive } from './types';

SQLite.enablePromise(true);

class SQLiteClient implements DatabaseClient {
  constructor(private readonly db: SQLiteDatabase) {}

  async execute(sql: string, params: SQLPrimitive[] = []): Promise<void> {
    await this.db.executeSql(sql, params);
  }

  async query<T>(sql: string, params: SQLPrimitive[] = []): Promise<T[]> {
    const [result] = await this.db.executeSql(sql, params);
    const rows: T[] = [];

    for (let i = 0; i < result.rows.length; i += 1) {
      rows.push(result.rows.item(i) as T);
    }

    return rows;
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}

export interface InitializeDatabaseOptions {
  name?: string;
  location?: Location;
}

export const createSQLiteClient = async (
  options: InitializeDatabaseOptions = {}
): Promise<DatabaseClient> => {
  const params: DatabaseParams = options.location
    ? { name: options.name ?? 'fitnessapp.db', location: options.location }
    : { name: options.name ?? 'fitnessapp.db' };
  const db = await SQLite.openDatabase(params);

  const client = new SQLiteClient(db);
  await initializeDatabase(client);

  return client;
};
