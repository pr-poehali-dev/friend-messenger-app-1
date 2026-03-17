import { useState } from 'react';
import { api, User } from '@/api/api';
import Icon from '@/components/ui/icon';

interface AuthScreenProps {
  onAuth: (user: User) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user: User;
      if (mode === 'login') {
        user = await api.login(username.trim(), password);
      } else {
        user = await api.register(username.trim(), password, displayName.trim() || username.trim());
      }
      onAuth(user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageCircle" size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Мессенджер</h1>
          <p className="text-gray-400 text-sm mt-1">Общайся с друзьями</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {(['login', 'register'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setMode(tab); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'login' ? 'Войти' : 'Регистрация'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Ваше имя</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Иван Иванов"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Логин</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="ivan"
              autoComplete="username"
              required
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">
              <Icon name="AlertCircle" size={15} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors mt-2"
          >
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Регистрируясь, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
}
