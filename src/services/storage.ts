import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  chatId: number;
};

export type Reminder = {
  id: string;
  chatId: number;
  text: string;
  when: string; // ISO string
  createdAt: string;
  fired: boolean;
};

export type Data = {
  todos: Todo[];
  reminders: Reminder[];
};

let db: Low<Data>;

export async function initDB() {
  const file = path.join(process.cwd(), process.env.DB_PATH!);
  const adapter = new JSONFile<Data>(file);
  db = new Low(adapter, {
    todos: [],
    reminders: [],
  });
  await db.read();
  db.data ||= { todos: [], reminders: [] };
}

export function getDB(): Low<Data> {
  if (!db) throw new Error('DB not initialized');
  return db;
}

export async function persist() {
  if (!db) throw new Error('DB not initialized');
  await db.write();
}
