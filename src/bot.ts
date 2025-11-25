import { Telegraf } from 'telegraf';
import { handleAi } from './commands/ai';
import { handleTodo } from './commands/todo';

export function createBot() {
  if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN not set');
  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start((ctx) => ctx.reply('Привет! Я Steve Family Bot.'));

  bot.command('todo', async (ctx) => {
    const text = ctx.message?.text;
    await handleTodo(ctx, text);
  });

  bot.hears(/^ии\s+/i, async (ctx) => {
    await handleAi(ctx);
  });

  bot.launch();
  return bot;
}
