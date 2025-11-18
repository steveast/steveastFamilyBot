import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'
import { handleTodo } from './commands/todo'
import { handleRemind } from './commands/reminder'
import { handleChat } from './commands/chat'

dotenv.config()
const token = process.env.BOT_TOKEN
if (!token) throw new Error('BOT_TOKEN not set')

export function createBot() {
  const bot = new Telegraf(token)

  bot.start((ctx) => ctx.reply('Привет! Я Steve Family Bot. /help для списка команд'))

  bot.command('help', (ctx) =>
    ctx.reply(
      '/todo <cmd> — управление TODO\n/remind <ISO_TIME> <text> — добавить напоминание\n/chat <text> — спросить ChatGPT',
    ),
  )

  bot.command('todo', async (ctx) => {
    const text = ctx.message?.text?.split(' ').slice(1).join(' ')
    await handleTodo(ctx, text)
  })

  bot.command('remind', async (ctx) => {
    const text = ctx.message?.text?.split(' ').slice(1).join(' ')
    await handleRemind(ctx, text)
  })

  bot.command('chat', async (ctx) => {
    const text = ctx.message?.text?.split(' ').slice(1).join(' ')
    await handleChat(ctx, text)
  })

  // simple echo for unknown messages
  bot.on('text', (ctx) => ctx.reply('Неизвестная команда. /help'))

  return bot
}
