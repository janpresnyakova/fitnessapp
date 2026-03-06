export type SQLPrimitive = string | number | null;

export interface DatabaseClient {
  execute(sql: string, params?: SQLPrimitive[]): Promise<void>;
  query<T>(sql: string, params?: SQLPrimitive[]): Promise<T[]>;
  close(): Promise<void>;
}
