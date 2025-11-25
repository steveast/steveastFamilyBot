import cron from 'node-cron';

export function startScheduler(sendFn: (chatId: number, text: string) => Promise<void>) {
  // Пример: каждый день в 9:00
  cron.schedule('0 9 * * *', async () => {
    try {
      await sendFn(123456789, 'Доброе утро! Это напоминание.');
    } catch (e: unknown) {
      console.error('Scheduler error:', e);
    }
  });
}
