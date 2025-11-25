import { Context, Markup } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import { getDB, persist } from '../services/storage';

// ---------- Рендер одного TODO с кнопками ----------
function renderTodoItem(todo: any) {
  return {
    text: `${todo.done ? '✅' : '⬜'} ${todo.text}`,
    keyboard: Markup.inlineKeyboard([
      !todo.done ? [Markup.button.callback('✅ Готово', `todo_done_${todo.id}`)] : [],
      [Markup.button.callback('❌ Удалить', `todo_del_${todo.id}`)],
    ]),
  };
}

// ---------- Главное меню ----------
export async function showTodoMenu(ctx: Context) {
  return ctx.reply(
    'Управление TODO:',
    Markup.inlineKeyboard([
      [Markup.button.callback('➕ Добавить', 'todo_add')],
      [Markup.button.callback('📋 Показать список', 'todo_list')],
    ]),
  );
}

// ---------- Показать список ----------
export async function handleTodoList(ctx: any) {
  const db = getDB();
  const todos = db.data!.todos.filter((t) => t.chatId === ctx.chat!.id);

  if (todos.length === 0) return ctx.reply('Список TODO пуст');

  for (const t of todos) {
    const { text, keyboard } = renderTodoItem(t);
    await ctx.reply(text, keyboard);
  }

  await ctx.answerCbQuery();
}

// ---------- Начало добавления ----------
export async function handleTodoAddRequest(ctx: any) {
  ctx.session = { mode: 'todo_add' };
  await ctx.answerCbQuery();
  return ctx.reply('Введите текст задачи:');
}

// ---------- Получение текста нового TODO ----------
export async function handleTodoText(ctx: any) {
  if (!ctx.session || ctx.session.mode !== 'todo_add') return;

  const text = 'text' in (ctx.message ?? {}) ? ctx.message.text : undefined;
  if (!text || !ctx.chat) return;

  const db = getDB();
  const item = {
    id: uuidv4(),
    chatId: ctx.chat.id,
    text,
    done: false,
    createdAt: new Date().toISOString(),
  };

  db.data!.todos.push(item);
  await persist();

  ctx.session = null;

  const { text: msg, keyboard } = renderTodoItem(item);
  return ctx.reply(`Добавлено:\n\n${msg}`, keyboard);
}

// ---------- Отметка TODO ----------
export async function handleTodoDone(ctx: any) {
  const id = ctx.match![1];
  const db = getDB();

  const item = db.data!.todos.find((t) => t.id === id && t.chatId === ctx.chat!.id);
  if (!item) return ctx.answerCbQuery('Не найдено');

  item.done = true;
  await persist();

  const { text, keyboard } = renderTodoItem(item);
  await ctx.editMessageText(text, keyboard);
  return ctx.answerCbQuery('Отмечено ✅');
}

// ---------- Удаление TODO ----------
export async function handleTodoDelete(ctx: any) {
  const id = ctx.match![1];
  const db = getDB();

  const before = db.data!.todos.length;
  db.data!.todos = db.data!.todos.filter((t) => t.id !== id || t.chatId !== ctx.chat!.id);
  if (db.data!.todos.length === before) return ctx.answerCbQuery('Не найдено');

  await persist();
  await ctx.deleteMessage();
  return ctx.answerCbQuery('Удалено ❌');
}
