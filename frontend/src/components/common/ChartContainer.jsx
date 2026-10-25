import React from 'react';
import { ResponsiveContainer } from 'recharts';

export function ChartContainer({ height = 260, loading = false, empty = false, children }) {
  if (loading) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }
  if (empty) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-400">
        No data available
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  );
}
