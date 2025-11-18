import { initDB } from './services/storage.ts'
import { createBot } from './bot.ts'
import { startScheduler } from './services/scheduler.ts'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  await initDB()
  const bot = createBot()

  startScheduler(async (chatId: number, text: string) => {
    try {
      await bot.telegram.sendMessage(chatId, text)
    } catch (e: unknown) {
      console.error('Error sending scheduled message:', e)
    }
  })
}

main().catch((err) => console.error('Fatal error:', err))
