import { Context } from 'telegraf'
import { askChatGPT } from '../services/openai'

export async function handleChat(ctx: Context, text?: string) {
  const prompt = (text || '').trim()
  if (!prompt) return ctx.reply('Напиши вопрос после /chat')
  try {
    await ctx.reply('Думаю...')
    const answer = await askChatGPT(prompt)
    await ctx.reply(answer || 'Пустой ответ от ChatGPT')
  } catch (e: any) {
    console.error(e)
    await ctx.reply('Ошибка при запросе к OpenAI: ' + (e.message || e.toString()))
  }
}
