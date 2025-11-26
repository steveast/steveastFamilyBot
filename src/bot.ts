import { Telegraf } from 'telegraf';
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
import { handleChatGPT } from './commands/chatGPT';
import { handleYandexGPT } from './commands/yandexGPT';

export function createBot() {
  if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN not set');
  const bot = new Telegraf(process.env.BOT_TOKEN);
  bot.use(session());

  bot.start((ctx) =>
    ctx.reply(`
    Привет! Я Steve Family Bot.

/todo - список дел!
ии расскажи сказку - спроси Алису!
    `),
  );

  // Главное меню TODO
  bot.command('todo', showTodoMenu);

  // Кнопки
  bot.action('todo_add', handleTodoAddRequest);
  bot.action('todo_list', handleTodoList);
  bot.action(/^todo_done_(.+)$/, handleTodoDone);
  bot.action(/^todo_del_(.+)$/, handleTodoDelete);

  bot.hears(/^ai\s+/i, async (ctx) => {
    await handleChatGPT(ctx);
  });

  bot.hears(/^алиса\s+/i, async (ctx) => {
    await handleYandexGPT(ctx);
  });

  // Обработка текста (добавление TODO)
  bot.on(message('text'), handleTodoText);
  bot.launch();
  return bot;
}
