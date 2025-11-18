import cron from 'node-cron'
import { getDB, persist } from './storage'

let task: cron.ScheduledTask | null = null

export function startScheduler(sendFn: (chatId: number, text: string) => Promise<void>) {
  if (task) task.stop()

  // Проверяем напоминания каждую минуту
  task = cron.schedule('* * * * *', async () => {
    const db = getDB()
    const now = new Date()
    const due = db.data!.reminders.filter((r) => !r.fired && new Date(r.when) <= now)
    for (const r of due) {
      try {
        await sendFn(r.chatId, `Напоминание: ${r.text} (запланировано на ${r.when})`)
        r.fired = true
      } catch (e) {
        console.error('Failed to send reminder', e)
      }
    }
    await persist()
  })
}

export function stopScheduler() {
  task?.stop()
}
