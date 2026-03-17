import { useState } from 'react';
import { Chat } from '@/data/mockData';
import Icon from '@/components/ui/icon';

interface SidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}

export default function Sidebar({ chats, selectedChat, onSelectChat }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');

  const filtered = chats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 border-r border-gray-100 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Сообщения</h1>
          <div className="flex gap-1">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
              <Icon name="Edit" size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
              <Icon name="MoreHorizontal" size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-5 mb-3 gap-1">
        {(['chats', 'contacts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'chats' ? 'Чаты' : 'Контакты'}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((chat, i) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left group ${
              selectedChat?.id === chat.id
                ? 'bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${
                selectedChat?.id === chat.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {chat.avatar}
              </div>
              {chat.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-semibold text-gray-900 truncate">{chat.name}</span>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm truncate ${chat.typing ? 'text-blue-500' : 'text-gray-500'}`}>
                  {chat.typing ? 'печатает...' : chat.lastMessage}
                </span>
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

      {/* Bottom nav */}
      <div className="border-t border-gray-100 px-5 py-3 flex justify-around">
        {[
          { icon: 'MessageCircle', label: 'Чаты', active: true },
          { icon: 'Phone', label: 'Звонки', active: false },
          { icon: 'Users', label: 'Группы', active: false },
          { icon: 'Settings', label: 'Настройки', active: false },
        ].map(item => (
          <button key={item.icon} className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
            item.active ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
          }`}>
            <Icon name={item.icon} size={20} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
