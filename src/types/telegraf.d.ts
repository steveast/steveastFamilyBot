import 'telegraf';

declare module 'telegraf' {
  interface Context {
    session?: {
      mode?: string;
      [key: string]: any;
    } | null;
  }
}
