import { Telegraf } from 'telegraf';
import { askChatGPT } from './services/openai';

export function createBot() {
  if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN not set');
  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start((ctx) => ctx.reply('Привет! Я Steve Family Bot.'));

  bot.hears(/^ии\s+/i, async (ctx) => {
    const messageText = ctx.message?.text || '';
    const lowerCaseText = messageText.toLowerCase();

    if (lowerCaseText.startsWith('ии')) {
      const prompt = messageText.slice(2).trim();
      if (!prompt) {
        return ctx.reply('Напиши вопрос после «ИИ»');
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
  });

  bot.launch();
  return bot;
}
