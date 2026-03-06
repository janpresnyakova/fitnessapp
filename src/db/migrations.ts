import { LATEST_SCHEMA_VERSION, migrations } from './schema';
import { DatabaseClient } from './types';

export const initializeDatabase = async (client: DatabaseClient): Promise<void> => {
  await client.execute('PRAGMA foreign_keys = ON;');

  try {
    const versionRow = await client.query<{ user_version: number }>('PRAGMA user_version;');
    const currentVersion = versionRow[0]?.user_version ?? 0;

    const orderedMigrations = migrations
      .filter((migration) => migration.version > currentVersion)
      .sort((a, b) => a.version - b.version);

    for (const migration of orderedMigrations) {
      for (const statement of migration.statements) {
        await client.execute(statement);
      }

      await client.execute(`PRAGMA user_version = ${migration.version};`);
    }

    if ((await client.query<{ user_version: number }>('PRAGMA user_version;'))[0]?.user_version !== LATEST_SCHEMA_VERSION) {
      throw new Error('Unexpected DB schema version after migrations');
    }
  } catch (error) {
    throw new Error(`Database initialization failed: ${String(error)}`);
  }
};
