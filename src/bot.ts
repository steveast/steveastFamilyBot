import { Telegraf } from 'telegraf'
import { askChatGPT } from './services/openai.ts'

export function createBot() {
  if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN not set')
  const bot = new Telegraf(process.env.BOT_TOKEN)

  bot.start((ctx) => ctx.reply('Привет! Я Steve Family Bot.'))

  bot.command('chat', async (ctx) => {
    const prompt = ctx.message?.text.replace('/chat', '').trim()
    if (!prompt) return ctx.reply('Напиши вопрос после /chat')
    try {
      await ctx.reply('Думаю...')
      const answer = await askChatGPT(prompt)
      await ctx.reply(answer || 'Пустой ответ')
    } catch (e: unknown) {
      console.error(e)
      await ctx.reply('Ошибка при запросе к OpenAI')
    }
  })

  bot.launch()
  return bot
}
