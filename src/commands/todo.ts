import { Context } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import { getDB, persist } from '../services/storage';

export async function handleTodo(ctx: Context, text?: string) {
  const args = (text || '').trim().split(' ');
  const cmd = args[0];

  const db = getDB();

  if (!cmd || cmd === 'help') {
    return ctx.reply(
      'TODO команды:\n' +
        '/todo add <text> - добавить\n' +
        '/todo list - список\n' +
        '/todo done <id> - отметить\n' +
        '/todo remove <id> - удалить',
    );
  }

  if (cmd === 'add') {
    const itemText = args.slice(1).join(' ');
    if (!itemText) return ctx.reply('Текст пустой');

    const item = {
      id: uuidv4(),
      text: itemText,
      done: false,
      createdAt: new Date().toISOString(),
    };

    db.data!.todos.push(item);
    await persist();
    return ctx.reply(`Добавлено: ${item.id}`);
  }

  if (cmd === 'list') {
    const list = db.data!.todos;
    if (list.length === 0) return ctx.reply('Список TODO пуст');

    const lines = list.map((t) => `${t.done ? '✅' : '⬜'} ${t.id} — ${t.text}`);
    return ctx.reply(lines.join('\n'));
  }

  if (cmd === 'done') {
    const id = args[1];
    const it = db.data!.todos.find((t) => t.id === id);
    if (!it) return ctx.reply('Не найден id');

    it.done = true;
    await persist();
    return ctx.reply('Отмечено как выполненное');
  }

  if (cmd === 'remove') {
    const id = args[1];
    const before = db.data!.todos.length;
    db.data!.todos = db.data!.todos.filter((t) => t.id !== id);

    if (db.data!.todos.length === before) return ctx.reply('Не найден id');

    await persist();
    return ctx.reply('Удалено');
  }

  return ctx.reply('Неизвестная команда. Используй /todo help');
}
