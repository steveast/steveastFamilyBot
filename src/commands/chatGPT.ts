import { Context } from 'telegraf';
import { askChatGPT } from '../services/openai';

export async function handleChatGPT(ctx: any) {
  const messageText = ctx.message?.text || '';
  const lowerCaseText = messageText.toLowerCase();

  if (lowerCaseText.startsWith('ai')) {
    const prompt = messageText.slice(2).trim();
    if (!prompt) {
      return ctx.reply('Напиши вопрос после «ai»');
    }

    try {
      // await ctx.reply('Думаю…')
      const answer = await askChatGPT(prompt);
      await ctx.reply(answer || 'Пустой ответ');
    } catch (e: unknown) {
      console.error(e);
      await ctx.reply('Ошибка при запросе к OpenAI');
    }
  }
}
