import React from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function Navbar({ title, subtitle, health, loading, onRefresh }) {
  const connected = health?.status === 'healthy';
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200 bg-white">
      <div>
        <h1 className="text-base font-semibold text-slate-900 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-emerald-600' : 'text-slate-400'}`}>
          {connected
            ? <><Wifi className="w-3.5 h-3.5" /> API Connected</>
            : <><WifiOff className="w-3.5 h-3.5" /> {loading ? 'Checking…' : 'Disconnected'}</>
          }
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
