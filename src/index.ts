import { initDB, getDB } from './services/storage';
import { createBot } from './bot';
import { startScheduler } from './services/scheduler';
import dotenv from 'dotenv';


dotenv.config();


async function main() {
await initDB();
const bot = createBot();


// start scheduler and provide send function
startScheduler(async (chatId: number, text: string) => {
try {
await bot.telegram.sendMessage(chatId, text);
} catch (e) {
console.error('Error sending scheduled message:', e);
}
}