import { Telegraf } from 'telegraf';
import { handleAi } from './commands/ai';
import {
  showTodoMenu,
  handleTodoAddRequest,
  handleTodoText,
  handleTodoList,
  handleTodoDone,
  handleTodoDelete,
} from './commands/todo';
import { session } from 'telegraf';
import { message } from 'telegraf/filters';

export function createBot() {
  if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN not set');
  const bot = new Telegraf(process.env.BOT_TOKEN);
  bot.use(session());

  bot.start((ctx) =>
    ctx.reply(`
    Привет! Я Steve Family Bot.

/todo - список дел!
    `),
  );

  // Главное меню TODO
  bot.command('todo', showTodoMenu);

  // Кнопки
  bot.action('todo_add', handleTodoAddRequest);
  bot.action('todo_list', handleTodoList);
  bot.action(/^todo_done_(.+)$/, handleTodoDone);
  bot.action(/^todo_del_(.+)$/, handleTodoDelete);

  // Обработка текста (добавление TODO)
  bot.on(message('text'), handleTodoText);

  bot.hears(/^ии\s+/i, async (ctx) => {
    await handleAi(ctx);
  });

  bot.launch();
  return bot;
}
