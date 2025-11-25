export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

export type ReminderItem = {
  id: string;
  chatId: number;
  text: string;
  when: string; // ISO
  createdAt: string;
  fired?: boolean;
};

export type DBSchema = {
  todos: TodoItem[];
  reminders: ReminderItem[];
};
