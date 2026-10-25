import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const PAGE_META = {
  overview:    { title: 'Overview',    subtitle: 'Sales summary across all locations' },
  analytics:   { title: 'Analytics',   subtitle: 'Revenue breakdown by store, time, and conditions' },
  predictions: { title: 'Predictions', subtitle: 'Spark MLlib Linear Regression — actual vs predicted revenue' },
};

export function AppLayout({ activeTab, onTabChange, health, loading, onRefreshHealth, children }) {
  const meta = PAGE_META[activeTab] || PAGE_META.overview;
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          title={meta.title}
          subtitle={meta.subtitle}
          health={health}
          loading={loading}
          onRefresh={onRefreshHealth}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
