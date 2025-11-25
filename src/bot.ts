import { Telegraf } from 'telegraf';
import { handleAi } from './commands/ai';
import { showTodoMenu, handleTodoMessage } from './commands/todo';
import { session } from 'telegraf';

export function createBot() {
  if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN not set');
  const bot = new Telegraf(process.env.BOT_TOKEN);
  bot.use(session());

  bot.start((ctx) => ctx.reply('Привет! Я Steve Family Bot.'));

  bot.command('todo', showTodoMenu);
  bot.on('text', handleTodoMessage);

  bot.hears(/^ии\s+/i, async (ctx) => {
    await handleAi(ctx);
  });

  bot.launch();
  return bot;
}
