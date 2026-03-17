const URLS = {
  auth: 'https://functions.poehali.dev/e8b7d7b2-bfe3-491f-9401-69ecd446982a',
  chats: 'https://functions.poehali.dev/1d0339e3-e190-48c9-aa60-9c25b73f9cc1',
  messages: 'https://functions.poehali.dev/336368a6-8cc2-491f-bc9b-ca7726590d14',
};

export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
}

export interface ChatItem {
  id: number;
  name: string;
  avatar: string;
  last_message: string;
  last_time: string;
  unread: number;
  online: boolean;
  other_user_id?: number;
}

export interface MessageItem {
  id: number;
  text: string;
  time: string;
  sender: 'me' | 'other';
  sender_id: number;
  status: 'sent' | 'delivered' | 'read';
  type: 'text';
  sender_name?: string;
  sender_avatar?: string;
}

export const api = {
  async register(username: string, password: string, display_name: string): Promise<User> {
    const res = await fetch(URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password, display_name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');
    return data;
  },

  async login(username: string, password: string): Promise<User> {
    const res = await fetch(URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка входа');
    return data;
  },

  async getChats(userId: number): Promise<ChatItem[]> {
    const res = await fetch(`${URLS.chats}?user_id=${userId}&action=list`);
    return res.json();
  },

  async searchUsers(userId: number, q: string): Promise<User[]> {
    const res = await fetch(`${URLS.chats}?user_id=${userId}&action=search&q=${encodeURIComponent(q)}`);
    return res.json();
  },

  async createOrGetChat(userId: number, otherUserId: number): Promise<{ chat_id: number }> {
    const res = await fetch(URLS.chats, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_or_get', other_user_id: otherUserId, user_id: userId }),
    });
    return res.json();
  },

  async getMessages(userId: number, chatId: number): Promise<MessageItem[]> {
    const res = await fetch(`${URLS.messages}?user_id=${userId}&chat_id=${chatId}`);
    const data = await res.json();
    if (!res.ok || !Array.isArray(data)) return [];
    return data;
  },

  async sendMessage(userId: number, chatId: number, text: string): Promise<MessageItem> {
    const res = await fetch(URLS.messages, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, chat_id: chatId, text }),
    });
    return res.json();
  },
};