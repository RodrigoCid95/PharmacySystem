import { Database } from "sqlite3";
export type RunDB = <T = void>(callback: (db: Database) => Promise<T>) => Promise<T>