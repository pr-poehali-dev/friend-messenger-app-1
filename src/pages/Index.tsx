import { useState, useEffect, useCallback } from 'react';
import { User, ChatItem, api } from '@/api/api';
import AuthScreen from '@/components/messenger/AuthScreen';
import Sidebar from '@/components/messenger/Sidebar';
import ChatArea from '@/components/messenger/ChatArea';

const USER_KEY = 'messenger_user';

export default function Index() {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  });
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const loadChats = useCallback(async () => {
    if (!user) return;
    const data = await api.getChats(user.id);
    setChats(data);
  }, [user]);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [loadChats]);

  const handleAuth = (u: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setChats([]);
    setSelectedChat(null);
  };

  const handleSelectChat = (chat: ChatItem) => {
    setSelectedChat(chat);
    setMobileView('chat');
  };

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  return (
    <div className="h-screen flex bg-white overflow-hidden font-golos">
      {/* Desktop */}
      <div className="hidden md:flex w-full">
        <Sidebar
          user={user}
          chats={chats}
          selectedChatId={selectedChat?.id ?? null}
          onSelectChat={handleSelectChat}
          onChatsUpdate={loadChats}
          onLogout={handleLogout}
        />
        <ChatArea chat={selectedChat} user={user} onChatsUpdate={loadChats} />
      </div>

      {/* Mobile */}
      <div className="flex md:hidden w-full">
        {mobileView === 'list' ? (
          <Sidebar
            user={user}
            chats={chats}
            selectedChatId={selectedChat?.id ?? null}
            onSelectChat={handleSelectChat}
            onChatsUpdate={loadChats}
            onLogout={handleLogout}
          />
        ) : (
          <ChatArea
            chat={selectedChat}
            user={user}
            onChatsUpdate={loadChats}
            onBack={() => setMobileView('list')}
          />
        )}
      </div>
    </div>
  );
}
