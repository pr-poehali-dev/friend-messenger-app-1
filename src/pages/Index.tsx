import { useState } from 'react';
import { chats, Chat } from '@/data/mockData';
import Sidebar from '@/components/messenger/Sidebar';
import ChatArea from '@/components/messenger/ChatArea';

export default function Index() {
  const [selected, setSelected] = useState<Chat | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const handleSelectChat = (chat: Chat) => {
    setSelected(chat);
    setMobileView('chat');
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden font-golos">
      {/* Desktop layout */}
      <div className="hidden md:flex w-full">
        <Sidebar chats={chats} selectedChat={selected} onSelectChat={handleSelectChat} />
        <ChatArea chat={selected} />
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden w-full">
        {mobileView === 'list' ? (
          <div className="w-full">
            <Sidebar chats={chats} selectedChat={selected} onSelectChat={handleSelectChat} />
          </div>
        ) : (
          <div className="w-full flex flex-col">
            <ChatArea
              chat={selected}
              onBack={() => setMobileView('list')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
