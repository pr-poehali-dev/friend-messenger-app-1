import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface CallModalProps {
  name: string;
  avatar: string;
  type: 'audio' | 'video';
  onClose: () => void;
}

export default function CallModal({ name, avatar, type, onClose }: CallModalProps) {
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-80 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-b from-blue-50 to-white px-8 pt-10 pb-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-600 mx-auto mb-4">
            {avatar}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{name}</h2>
          <p className="text-sm text-gray-400">
            {type === 'video' ? 'Видеозвонок' : 'Голосовой вызов'} · {fmt(duration)}
          </p>
        </div>

        <div className="px-8 pb-8">
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setMuted(v => !v)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                muted ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon name={muted ? 'MicOff' : 'Mic'} size={20} />
            </button>
            {type === 'video' && (
              <button className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <Icon name="Camera" size={20} />
              </button>
            )}
            <button
              onClick={() => setSpeakerOff(v => !v)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                speakerOff ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon name={speakerOff ? 'VolumeX' : 'Volume2'} size={20} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="PhoneOff" size={18} />
            Завершить
          </button>
        </div>
      </div>
    </div>
  );
}
