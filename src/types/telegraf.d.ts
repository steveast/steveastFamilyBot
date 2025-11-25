import 'telegraf';

declare module 'telegraf' {
  interface SessionData {
    mode?: string | null;
    [key: string]: any;
  }

  interface Context {
    session?: SessionData;
  }
}
