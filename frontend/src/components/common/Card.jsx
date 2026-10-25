import React from 'react';

export function Card({ title, subtitle, action, children, className = '', noPad = false }) {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_25px_-4px_rgba(15,23,42,0.12)] transition-all duration-200 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={noPad ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
