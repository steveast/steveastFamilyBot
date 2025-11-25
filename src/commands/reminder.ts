import { Context } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import { getDB, persist, Reminder } from '../services/storage';

function parseHumanDate(input: string): Date | null {
  const now = new Date();

  const lower = input.toLowerCase().trim();

  // --- 1. "через N минут/часов/дней" ---
  const relMatch = lower.match(
    /^через\s+(\d+)\s*(минут|минуты|минуту|час|часа|часов|день|дня|дней)/,
  );
  if (relMatch) {
    const amount = Number(relMatch[1]);
    const unit = relMatch[2];

    const d = new Date(now);

    if (unit.startsWith('минут')) d.setMinutes(d.getMinutes() + amount);
    else if (unit.startsWith('час')) d.setHours(d.getHours() + amount);
    else if (unit.startsWith('д')) d.setDate(d.getDate() + amount);

    return d;
  }

  // --- 2. "завтра" или "послезавтра" ---
  if (lower === 'завтра') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(7, 0, 0, 0);
    return d;
  }
  if (lower === 'послезавтра') {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    d.setHours(7, 0, 0, 0);
    return d;
  }

  // --- 3. "сегодня в HH:MM" ---
  const todayMatch = lower.match(/^сегодня\s+в\s+(\d{1,2}):(\d{2})/);
  if (todayMatch) {
    const d = new Date(now);
    d.setHours(Number(todayMatch[1]), Number(todayMatch[2]), 0, 0);
    return d;
  }

  // --- 4. "25-го" или "25-го в 18:00" ---
  const dateMatch = lower.match(/^(\d{1,2})-?го(?:\s+в\s+(\d{1,2}):(\d{2}))?/);
  if (dateMatch) {
    const day = Number(dateMatch[1]);
    const hours = dateMatch[2] ? Number(dateMatch[2]) : 7;
    const mins = dateMatch[3] ? Number(dateMatch[3]) : 0;

    const d = new Date(now);
    d.setDate(day);
    d.setHours(hours, mins, 0, 0);

    // если дата уже прошла — следующий месяц
    if (d.getTime() < now.getTime()) {
      d.setMonth(d.getMonth() + 1);
    }

    return d;
  }

  // --- 5. ISO-формат ---
  const iso = new Date(input);
  if (!isNaN(iso.getTime())) return iso;

  return null;
}

/// -----------------------------------------------------------
///  Основная функция
/// -----------------------------------------------------------
export async function handleRemind(ctx: Context, text?: string) {
  if (!text)
    return ctx.reply(
      'Формат: /remind <время> <текст>\n' +
        'Примеры:\n' +
        '  /remind через 2 часа Позвонить маме\n' +
        '  /remind завтра Купить хлеб\n' +
        '  /remind 25-го в 18:30 Встреча\n' +
        '  /remind 2025-12-01T20:00 Поехать домой\n',
    );

  const parts = text.trim().split(' ');
  const whenPart = parts[0] + (parts[1] === 'в' ? ' ' + parts[1] + ' ' + parts[2] : '');
  const msgStartIndex = whenPart.includes(' в ') ? 3 : 1;
  const msg = parts.slice(msgStartIndex).join(' ');

  const when = parseHumanDate(whenPart);

  if (!when) return ctx.reply('Не могу понять дату. Попробуй: "через 2 часа", "завтра", "25-го"');

  if (!msg) return ctx.reply('Нет текста напоминания');

  const db = getDB();

  const item: Reminder = {
    id: uuidv4(),
    chatId: ctx.chat!.id,
    text: msg,
    when: when.toISOString(),
    createdAt: new Date().toISOString(),
    fired: false,
  };

  db.data!.reminders.push(item);
  await persist();

  return ctx.reply(`Напоминание добавлено на ${item.when}\nid=${item.id}`);
}
