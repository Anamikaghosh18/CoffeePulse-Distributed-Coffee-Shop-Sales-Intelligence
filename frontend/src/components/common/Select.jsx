import React from 'react';

export function Select({ label, value, options = [], onChange, disabled }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-slate-500">{label}</span>}
      <select
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        disabled={disabled}
        className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 disabled:opacity-50"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
