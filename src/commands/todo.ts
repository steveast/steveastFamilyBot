import { Context, Markup } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import { getDB, persist } from '../services/storage';

export async function showTodoMenu(ctx: Context) {
  return ctx.reply(
    'Управление TODO:',
    Markup.inlineKeyboard([
      [Markup.button.callback('➕ Добавить', 'todo_add')],
      [Markup.button.callback('📋 Показать список', 'todo_list')],
    ]),
  );
}

// -------------------------
// РЕНДЕР ОДНОГО TODO
// -------------------------
function renderTodoItem(todo: any) {
  return {
    text: `${todo.done ? '✅' : '⬜'} ${todo.text}\n`,
    keyboard: Markup.inlineKeyboard([
      !todo.done ? [Markup.button.callback('✔ Готово', `todo_done_${todo.id}`)] : [],
      [Markup.button.callback('❌ Удалить', `todo_del_${todo.id}`)],
    ]),
  };
}

// -------------------------
// ПОКАЗАТЬ СПИСОК
// -------------------------
export async function handleTodoList(ctx: Context) {
  const db = getDB();
  const todos = db.data!.todos;

  if (todos.length === 0) return ctx.reply('Список TODO пуст');

  for (const t of todos) {
    const { text, keyboard } = renderTodoItem(t);
    await ctx.reply(text, keyboard);
  }

  await ctx.answerCbQuery();
}

// -------------------------
// НАЧАТЬ ДОБАВЛЕНИЕ
// -------------------------
export async function handleTodoAddRequest(ctx: any) {
  ctx.session = { mode: 'todo_add' };
  await ctx.answerCbQuery();
  return ctx.reply('Введите текст TODO:');
}

// -------------------------
// ПОЛУЧИТЬ ТЕКСТ ДЛЯ ДОБАВЛЕНИЯ
// -------------------------
export async function handleTodoText(ctx: any) {
  if (!ctx.session || ctx.session.mode !== 'todo_add') return;

  const text = ctx.message?.text;
  if (!text) return;

  const db = getDB();

  const item = {
    id: uuidv4(),
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

// -------------------------
// КНОПКА: ГОТОВО
// -------------------------
export async function handleTodoDone(ctx: any) {
  const id = ctx.match![1];
  const db = getDB();

  const it = db.data!.todos.find((t) => t.id === id);
  if (!it) return ctx.answerCbQuery('Не найдено');

  it.done = true;
  await persist();

  const { text, keyboard } = renderTodoItem(it);

  await ctx.editMessageText(text, keyboard);
  await ctx.answerCbQuery('Отмечено ✔');
}

// -------------------------
// КНОПКА: УДАЛИТЬ
// -------------------------
export async function handleTodoDelete(ctx: any) {
  const id = ctx.match![1];
  const db = getDB();

  db.data!.todos = db.data!.todos.filter((t) => t.id !== id);
  await persist();

  await ctx.deleteMessage();
  await ctx.answerCbQuery('Удалено ❌');
}
