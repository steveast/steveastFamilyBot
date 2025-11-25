import { Context, Markup } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import { getDB, persist } from '../services/storage';

export async function showTodoMenu(ctx: Context) {
  return ctx.reply(
    'Меню TODO:',
    Markup.keyboard([
      ['➕ Добавить', '📋 Список'],
      ['✔️ Выполнить', '🗑 Удалить'],
    ])
      .resize()
      .oneTime(),
  );
}

export async function handleTodoMessage(ctx: any) {
  const text = ctx.message?.text;

  if (!text) return;

  // --------------------------
  // 1. Д O Б А В И Т Ь
  // --------------------------
  if (text === '➕ Добавить') {
    ctx.session = { mode: 'todo_add' };
    return ctx.reply('Напиши текст задачи:');
  }

  if (ctx.session?.mode === 'todo_add') {
    ctx.session = null;

    const item = {
      id: uuidv4(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    };

    const db = getDB();
    db.data!.todos.push(item);
    await persist();

    return ctx.reply(`Добавлено:\n${item.text} (${item.id})`);
  }

  // --------------------------
  // 2. С П И С О К
  // --------------------------
  if (text === '📋 Список') {
    const db = getDB();
    const list = db.data!.todos;

    if (list.length === 0) return ctx.reply('Список пуст.');

    const lines = list.map((t) => `${t.done ? '✅' : '⬜'} ${t.id}\n${t.text}`);

    return ctx.reply(lines.join('\n\n'));
  }

  // --------------------------
  // 3. О Т М Е Т И Т Ь
  // --------------------------
  if (text === '✔️ Выполнить') {
    ctx.session = { mode: 'todo_done' };
    return ctx.reply('Введи ID задачи:');
  }

  if (ctx.session?.mode === 'todo_done') {
    ctx.session = null;
    const id = text.trim();

    const db = getDB();
    const it = db.data!.todos.find((t) => t.id === id);

    if (!it) return ctx.reply('Не найден ID.');

    it.done = true;
    await persist();

    return ctx.reply('Отмечено как выполнено.');
  }

  // --------------------------
  // 4. У Д А Л И Т Ь
  // --------------------------
  if (text === '🗑 Удалить') {
    ctx.session = { mode: 'todo_remove' };
    return ctx.reply('Введи ID для удаления:');
  }

  if (ctx.session?.mode === 'todo_remove') {
    ctx.session = null;
    const id = text.trim();

    const db = getDB();
    const before = db.data!.todos.length;

    db.data!.todos = db.data!.todos.filter((t) => t.id !== id);

    if (before === db.data!.todos.length) return ctx.reply('ID не найден.');

    await persist();
    return ctx.reply('Удалено.');
  }
}
