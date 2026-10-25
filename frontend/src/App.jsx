import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PredictionsPage } from './pages/PredictionsPage';

async function fetchHealth() {
  try {
    const r = await fetch('/health');
    return r.ok ? r.json() : null;
  } catch { return null; }
}

export default function App() {
  const [tab, setTab] = useState('overview');
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setHealth(await fetchHealth());
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const page = { overview: <DashboardPage />, analytics: <AnalyticsPage />, predictions: <PredictionsPage /> };

  return (
    <AppLayout activeTab={tab} onTabChange={setTab} health={health} loading={loading} onRefreshHealth={refresh}>
      {page[tab] ?? <DashboardPage />}
    </AppLayout>
  );
}
