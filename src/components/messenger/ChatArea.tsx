import { useState, useRef, useEffect } from 'react';
import { ChatItem, MessageItem, User, api } from '@/api/api';
import Icon from '@/components/ui/icon';

interface ChatAreaProps {
  chat: ChatItem | null;
  user: User;
  onBack?: () => void;
  onChatsUpdate: () => void;
}

export default function ChatArea({ chat, user, onBack, onChatsUpdate }: ChatAreaProps) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chat) return;
    setLoading(true);
    api.getMessages(user.id, chat.id).then(msgs => {
      setMessages(msgs);
      setLoading(false);
    });
    const interval = setInterval(() => {
      api.getMessages(user.id, chat.id).then(msgs => setMessages(msgs));
    }, 3000);
    return () => clearInterval(interval);
  }, [chat, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !chat) return;
    const t = text.trim();
    setText('');
    setShowEmoji(false);
    const msg = await api.sendMessage(user.id, chat.id, t);
    setMessages(prev => [...prev, msg]);
    onChatsUpdate();
  };

  const emojis = ['😀','😂','❤️','👍','🎉','🔥','😊','🙏','💪','✨','😍','🤔','👋','💯','🥳'];

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
          <Icon name="MessageCircle" size={36} className="text-blue-300" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Ваши сообщения</h2>
        <p className="text-gray-400 text-sm max-w-xs">Выберите чат слева или найдите друга через иконку добавления</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        {onBack && (
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors mr-1">
            <Icon name="ChevronLeft" size={20} className="text-gray-500" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
          {chat.avatar}
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900 leading-tight">{chat.name}</h2>
          <p className="text-xs text-gray-400">в сети</p>
        </div>
        <div className="flex gap-1">
          <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <Icon name="Phone" size={18} />
          </button>
          <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <Icon name="Video" size={18} />
          </button>
          <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <Icon name="Info" size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {loading && (
          <div className="flex justify-center mt-8">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-400 text-sm">Напишите первое сообщение!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender === 'me';
          const showDate = i === 0;
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Сегодня</span>
                </div>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[11px] text-gray-400">{msg.time}</span>
                    {isMe && (
                      <Icon
                        name={msg.status === 'read' ? 'CheckCheck' : 'Check'}
                        size={12}
                        className={msg.status === 'read' ? 'text-blue-400' : 'text-gray-400'}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji panel */}
      {showEmoji && (
        <div className="px-5 py-3 border-t border-gray-100 bg-white">
          <div className="flex flex-wrap gap-2">
            {emojis.map(emoji => (
              <button key={emoji} onClick={() => setText(t => t + emoji)} className="text-xl hover:scale-125 transition-transform">
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attach panel */}
      {showAttach && (
        <div className="px-5 py-3 border-t border-gray-100 bg-white">
          <div className="flex gap-3">
            {[
              { icon: 'Image', label: 'Фото', color: 'bg-pink-50 text-pink-500' },
              { icon: 'FileText', label: 'Файл', color: 'bg-blue-50 text-blue-500' },
              { icon: 'MapPin', label: 'Место', color: 'bg-green-50 text-green-500' },
              { icon: 'Contact', label: 'Контакт', color: 'bg-orange-50 text-orange-500' },
            ].map(item => (
              <button key={item.icon} className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <Icon name={item.icon} size={22} />
                </div>
                <span className="text-xs text-gray-500">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <button
            onClick={() => { setShowAttach(v => !v); setShowEmoji(false); }}
            className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${showAttach ? 'bg-blue-50 text-blue-500' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <Icon name="Paperclip" size={20} />
          </button>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Написать сообщение..."
              rows={1}
              className="w-full resize-none px-4 py-2.5 bg-gray-50 rounded-2xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors max-h-32 overflow-y-auto"
              style={{ lineHeight: '1.5' }}
            />
          </div>
          <button
            onClick={() => { setShowEmoji(v => !v); setShowAttach(false); }}
            className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${showEmoji ? 'bg-blue-50 text-blue-500' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <Icon name="Smile" size={20} />
          </button>
          <button
            onClick={sendMessage}
            className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
              text.trim() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {text.trim() ? <Icon name="Send" size={18} /> : <Icon name="Mic" size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
