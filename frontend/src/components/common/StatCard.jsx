import React from 'react';

export function StatCard({ label, value, sub, icon, trend, trendUp }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.08),0_2px_4px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.12)] transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600 shadow-sm">
            {icon}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
      {(sub || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {sub && <span className="text-xs text-slate-500 font-normal">{sub}</span>}
          {trend && (
            <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
