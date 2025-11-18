import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'path'
import { DBSchema } from '../types'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const DB_PATH = process.env.DB_PATH || './data/db.json'

// ensure data folder
const dir = join(DB_PATH, '..')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const adapter = new JSONFile<DBSchema>(DB_PATH)
const db = new Low<DBSchema>(adapter)

export async function initDB() {
  await db.read()
  db.data ||= { todos: [], reminders: [] }
  await db.write()
}

export function getDB() {
  if (!db.data) throw new Error('Database not initialized')
  return db
}

export async function persist() {
  await db.write()
}
