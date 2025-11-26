import { Context } from 'telegraf';
import fetch from 'node-fetch';

// Функция запроса к YandexGPT
async function askYandexGPT(prompt: string) {
  try {
    const response = await fetch(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Api-Key ${process.env.YA_API_KEY}`,
          'x-folder-id': process.env.YA_FOLDER_ID!,
        },
        body: JSON.stringify({
          modelUri: `gpt://${process.env.YA_FOLDER_ID}/yandexgpt-lite`, // <= ТУТ ошибка была
          completionOptions: {
            stream: false,
            maxTokens: 2000,
            temperature: 0.6,
          },
          messages: [{ role: 'user', text: prompt }],
        }),
      },
    );

    const text = await response.text();
    console.log('Raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
      console.log('JSON:', data.result.alternatives[0].message.text);
      return data.result.alternatives[0].message.text;
    } catch {
      console.error('JSON parse error');
    }
  } catch (err) {
    console.error('Ошибка YandexGPT:', err);
    return 'Ошибка при запросе к YandexGPT';
  }
}

// Хендлер для Telegram
export async function handleYandexGPT(ctx: any) {
  const messageText = ctx.message?.text || '';
  const lowerCaseText = messageText.toLowerCase();

  if (lowerCaseText.startsWith('алиса')) {
    const prompt = messageText.slice(2).trim();
    if (!prompt) {
      return ctx.reply('Напиши вопрос после «алиса»');
    }

    try {
      // await ctx.reply('Думаю…');
      const answer = await askYandexGPT(prompt);
      await ctx.reply(answer);
    } catch (e: unknown) {
      console.error(e);
      await ctx.reply('Ошибка при запросе к YandexGPT');
    }
  }
}
