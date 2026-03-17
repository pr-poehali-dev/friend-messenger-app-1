export interface Message {
  id: string;
  text: string;
  time: string;
  sender: 'me' | 'other';
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'voice';
  fileName?: string;
  fileSize?: string;
  duration?: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  typing?: boolean;
  messages: Message[];
}

export const chats: Chat[] = [
  {
    id: '1',
    name: 'Алиса Морозова',
    avatar: 'АМ',
    lastMessage: 'Встретимся в 7?',
    time: '14:32',
    unread: 2,
    online: true,
    messages: [
      { id: '1', text: 'Привет! Как дела?', time: '14:20', sender: 'other', status: 'read', type: 'text' },
      { id: '2', text: 'Всё отлично, спасибо! А у тебя?', time: '14:21', sender: 'me', status: 'read', type: 'text' },
      { id: '3', text: 'Тоже хорошо 😊 Планы на вечер есть?', time: '14:25', sender: 'other', status: 'read', type: 'text' },
      { id: '4', text: 'Пока не думал. Что предлагаешь?', time: '14:27', sender: 'me', status: 'read', type: 'text' },
      { id: '5', text: 'Встретимся в 7?', time: '14:32', sender: 'other', status: 'delivered', type: 'text' },
    ]
  },
  {
    id: '2',
    name: 'Команда проекта',
    avatar: '👥',
    lastMessage: 'Денис: Макет готов!',
    time: '13:15',
    unread: 5,
    online: false,
    messages: [
      { id: '1', text: 'Всем привет! Как прогресс?', time: '10:00', sender: 'other', status: 'read', type: 'text' },
      { id: '2', text: 'Работаю над базой данных', time: '10:05', sender: 'me', status: 'read', type: 'text' },
      { id: '3', text: 'Макет готов!', time: '13:15', sender: 'other', status: 'delivered', type: 'text' },
    ]
  },
  {
    id: '3',
    name: 'Максим Петров',
    avatar: 'МП',
    lastMessage: 'Отправил файл',
    time: 'вчера',
    unread: 0,
    online: false,
    messages: [
      { id: '1', text: 'Привет, можешь посмотреть документ?', time: '19:00', sender: 'other', status: 'read', type: 'text' },
      { id: '2', text: 'Конечно, присылай', time: '19:10', sender: 'me', status: 'read', type: 'text' },
      { id: '3', text: 'Отправил файл', time: '19:15', sender: 'other', status: 'read', type: 'file', fileName: 'Отчёт_2025.pdf', fileSize: '2.4 МБ' },
    ]
  },
  {
    id: '4',
    name: 'Мама',
    avatar: '💛',
    lastMessage: 'Позвони когда освободишься',
    time: 'вчера',
    unread: 1,
    online: true,
    messages: [
      { id: '1', text: 'Сынок, как ты?', time: '18:00', sender: 'other', status: 'read', type: 'text' },
      { id: '2', text: 'Всё хорошо, мам!', time: '18:30', sender: 'me', status: 'read', type: 'text' },
      { id: '3', text: 'Позвони когда освободишься', time: '20:00', sender: 'other', status: 'delivered', type: 'text' },
    ]
  },
  {
    id: '5',
    name: 'Дмитрий Соколов',
    avatar: 'ДС',
    lastMessage: 'Договорились!',
    time: 'пн',
    unread: 0,
    online: false,
    messages: [
      { id: '1', text: 'Привет! Встреча в понедельник?', time: '09:00', sender: 'other', status: 'read', type: 'text' },
      { id: '2', text: 'Да, в 11 подойдёт', time: '09:15', sender: 'me', status: 'read', type: 'text' },
      { id: '3', text: 'Договорились!', time: '09:20', sender: 'other', status: 'read', type: 'text' },
    ]
  },
];
