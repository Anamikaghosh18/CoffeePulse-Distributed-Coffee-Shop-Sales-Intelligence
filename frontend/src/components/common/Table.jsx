import React from 'react';

export function Table({ columns = [], data = [], keyExtractor = (_, i) => i, emptyMessage = 'No data' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map(col => (
              <th
                key={col.key}
                className={`py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 first:rounded-tl-lg last:rounded-tr-lg ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.length === 0
            ? <tr><td colSpan={columns.length} className="py-8 text-center text-xs text-slate-400">{emptyMessage}</td></tr>
            : data.map((row, idx) => (
                <tr key={keyExtractor(row, idx)} className="hover:bg-slate-50 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className={`py-3 px-4 text-sm text-slate-700 ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}
