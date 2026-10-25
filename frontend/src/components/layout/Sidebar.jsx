import React from 'react';
import { LayoutDashboard, BarChart3, TrendingUp, Coffee } from 'lucide-react';

const NAV = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'analytics',   label: 'Analytics',   icon: BarChart3 },
  { id: 'predictions', label: 'Predictions', icon: TrendingUp },
];

export function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-56 shrink-0 h-screen flex flex-col border-r border-slate-200/90 bg-white shadow-[4px_0_24px_-4px_rgba(15,23,42,0.06)] z-10">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/25">
          <Coffee className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900 leading-none tracking-tight">Coffiko</p>
          <p className="text-[10px] text-amber-600 font-medium tracking-wide mt-0.5">Sales Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3.5 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2.5 py-2">Menu</p>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/25'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs font-semibold text-slate-700">Coffiko Analytics</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Jan – Jun 2023 · 3 Stores</p>
      </div>
    </aside>
  );
}
