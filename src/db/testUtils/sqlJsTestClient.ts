import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { DatabaseClient, SQLPrimitive } from '../types';

const sqlJsPromise: Promise<SqlJsStatic> = initSqlJs({
  locateFile: (file: string) => `node_modules/sql.js/dist/${file}`
});

export class SqlJsTestClient implements DatabaseClient {
  private constructor(private readonly db: Database) {}

  static async create(): Promise<SqlJsTestClient> {
    const SQL = await sqlJsPromise;
    const db = new SQL.Database();

    return new SqlJsTestClient(db);
  }

  async execute(sql: string, params: SQLPrimitive[] = []): Promise<void> {
    this.db.run(sql, params as (number | string | null)[]);
  }

  async query<T>(sql: string, params: SQLPrimitive[] = []): Promise<T[]> {
    const statement = this.db.prepare(sql, params as (number | string | null)[]);
    const rows: T[] = [];

    while (statement.step()) {
      rows.push(statement.getAsObject() as T);
    }

    statement.free();

    return rows;
  }

  async close(): Promise<void> {
    this.db.close();
  }
}
