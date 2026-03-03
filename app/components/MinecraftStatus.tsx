// app/components/MinecraftStatus.tsx
'use client';

import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
  };
}

const SERVER_IP = 'lr1.the-ae.ovh';
const SERVER_PORT = 25516;

export function MinecraftStatus() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Пробуем основной API
        const response = await fetch(`https://api.mcstatus.io/v2/status/java/${SERVER_IP}:${SERVER_PORT}`);
        const data = await response.json();
        
        if (data.online !== undefined) {
          setStatus({
            online: data.online,
            players: {
              online: data.players?.online || 0,
              max: data.players?.max || 0,
            },
          });
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Primary API failed, trying backup...');
      }

      try {
        // Запасной API
        const response = await fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`);
        const data = await response.json();
        
        setStatus({
          online: data.online || false,
          players: {
            online: data.players?.online || 0,
            max: data.players?.max || 0,
          },
        });
      } catch (error) {
        console.error('All APIs failed:', error);
        setStatus({
          online: false,
          players: { online: 0, max: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    
    // Обновляем каждые 60 секунд
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_IP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      {/* Статус онлайна */}
      <div className="flex items-center gap-2">
        {/* Пульсирующий кружок */}
        <span className="relative flex h-3 w-3">
          {status?.online ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          )}
        </span>
        
        {/* Текст статуса */}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {status?.online ? (
            <>
              Онлайн{' '}
              <span className="text-green-600 dark:text-green-400 font-bold">
                {status.players.online}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                /{status.players.max}
              </span>
            </>
          ) : (
            <span className="text-red-600 dark:text-red-400">Оффлайн</span>
          )}
        </span>
      </div>
      
      {/* IP адрес с кнопкой копирования */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
        title="Нажми чтобы скопировать"
      >
        <span className="font-mono">{SERVER_IP}</span>
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    </div>
  );
}
