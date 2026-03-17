import { useState, useEffect } from 'react';
import { ChatItem, User, api } from '@/api/api';
import Icon from '@/components/ui/icon';

interface SidebarProps {
  user: User;
  chats: ChatItem[];
  selectedChatId: number | null;
  onSelectChat: (chat: ChatItem) => void;
  onChatsUpdate: () => void;
  onLogout: () => void;
}

export default function Sidebar({ user, chats, selectedChatId, onSelectChat, onChatsUpdate, onLogout }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'search'>('chats');

  useEffect(() => {
    if (search.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await api.searchUsers(user.id, search);
      setSearchResults(res);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [search, user.id]);

  const startChat = async (other: User) => {
    const { chat_id } = await api.createOrGetChat(user.id, other.id);
    await onChatsUpdate();
    const chat: ChatItem = {
      id: chat_id,
      name: other.display_name,
      avatar: other.avatar,
      last_message: '',
      last_time: '',
      unread: 0,
      online: false,
      other_user_id: other.id,
    };
    onSelectChat(chat);
    setSearch('');
    setSearchResults([]);
    setActiveTab('chats');
  };

  const filtered = chats.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 border-r border-gray-100 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
              {user.avatar}
            </div>
            <span className="text-base font-semibold text-gray-900">{user.display_name}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab(activeTab === 'search' ? 'chats' : 'search')}
              className={`p-2 rounded-full transition-colors ${activeTab === 'search' ? 'bg-blue-50 text-blue-500' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <Icon name="UserPlus" size={17} />
            </button>
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
              <Icon name="LogOut" size={17} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              if (e.target.value.length >= 2) setActiveTab('search');
              else setActiveTab('chats');
            }}
            placeholder={activeTab === 'search' ? 'Найти пользователя...' : 'Поиск чатов'}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'search' ? (
          <div>
            {search.length < 2 && (
              <p className="text-sm text-gray-400 text-center mt-8 px-5">Введите имя или логин друга</p>
            )}
            {searching && (
              <div className="flex justify-center mt-8">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {searchResults.map(u => (
              <button
                key={u.id}
                onClick={() => startChat(u)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {u.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{u.display_name}</p>
                  <p className="text-xs text-gray-400">@{u.username}</p>
                </div>
              </button>
            ))}
            {search.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-gray-400 text-center mt-8">Пользователи не найдены</p>
            )}
          </div>
        ) : (
          <div>
            {filtered.length === 0 && (
              <div className="text-center mt-12 px-5">
                <p className="text-sm text-gray-400">Чатов пока нет</p>
                <p className="text-xs text-gray-300 mt-1">Нажмите на иконку выше, чтобы найти друзей</p>
              </div>
            )}
            {filtered.map(chat => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left ${
                  selectedChatId === chat.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${
                    selectedChatId === chat.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {chat.avatar}
                  </div>
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">{chat.name}</span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{chat.last_time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate text-gray-500">{chat.last_message || 'Нет сообщений'}</span>
                    {chat.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-gray-100 px-5 py-3 flex justify-around">
        {[
          { icon: 'MessageCircle', label: 'Чаты' },
          { icon: 'Phone', label: 'Звонки' },
          { icon: 'Users', label: 'Группы' },
          { icon: 'Settings', label: 'Настройки' },
        ].map((item, i) => (
          <button key={item.icon} className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
            i === 0 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
          }`}>
            <Icon name={item.icon} size={20} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
