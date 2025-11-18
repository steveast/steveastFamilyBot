import { Context } from 'telegraf'
import { v4 as uuidv4 } from 'uuid'
import { getDB, persist, Reminder } from '../services/storage'

// Формат: /remind 2025-11-20T20:00 Пойти купить хлеб
export async function handleRemind(ctx: Context, text?: string) {
  if (!text)
    return ctx.reply(
      'Формат: /remind <ISO_DATETIME> <текст>\nПример: /remind 2025-11-20T20:00 Пойти купить хлеб',
    )

  const parts = text.trim().split(' ')
  const when = parts[0]
  const msg = parts.slice(1).join(' ')

  if (!when || !msg) return ctx.reply('Неправильный формат')

  const date = new Date(when)
  if (isNaN(date.getTime())) return ctx.reply('Не могу распознать дату (используй ISO формат)')

  const db = getDB()

  const item: Reminder = {
    id: uuidv4(),
    chatId: ctx.chat!.id,
    text: msg,
    when: date.toISOString(),
    createdAt: new Date().toISOString(),
    fired: false,
  }

  db.data!.reminders.push(item)
  await persist()

  return ctx.reply(`Напоминание добавлено на ${item.when} id=${item.id}`)
}
