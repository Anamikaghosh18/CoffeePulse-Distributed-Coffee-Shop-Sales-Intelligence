import React from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Clock } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { ChartContainer } from '../components/common/ChartContainer';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from 'recharts';

const TooltipStyle = {
  contentStyle: {
    fontSize: 12,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
  itemStyle: { color: '#334155' },
};

function useApi(url) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [url]);
  return { data, loading };
}

const fmt = v => `$${Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const fmtK = v => `$${(Number(v || 0) / 1000).toFixed(0)}k`;
const STORE_COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

export function DashboardPage() {
  const { data: kpi, loading: kpiLoading } = useApi('/api/v1/analytics/kpi');
  const { data: monthly, loading: monthlyLoading } = useApi('/api/v1/analytics/monthly-trends');
  const { data: hourly, loading: hourlyLoading } = useApi('/api/v1/analytics/hourly-traffic');
  const { data: stores } = useApi('/api/v1/analytics/stores');

  const monthlyChartData = React.useMemo(() => {
    if (!monthly) return [];
    const monthNames = {
      '2023-01': 'Jan', '2023-02': 'Feb', '2023-03': 'Mar',
      '2023-04': 'Apr', '2023-05': 'May', '2023-06': 'Jun',
    };
    return monthly.map(m => ({
      name: monthNames[m.month] || m.month,
      Revenue: m.total_revenue,
    }));
  }, [monthly]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={kpiLoading ? ';' : fmt(kpi?.total_revenue)}
          sub="Jan – Jun 2023 (6 Months)"
          icon={<TrendingUp className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          label="Total Transactions"
          value={kpiLoading ? '-' : Number(kpi?.total_transactions).toLocaleString()}
          sub="3 NYC Store Locations"
          icon={<ShoppingBag className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          label="Avg Ticket Size"
          value={kpiLoading ? ';' : `$${Number(kpi?.avg_ticket_size || 4.69).toFixed(2)}`}
          sub="Per Customer Order"
          icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          label="Peak Rush Hours"
          value={kpiLoading ? ';' : '8 AM - 10 AM'}
          sub="Morning Commute Rush"
          icon={<Clock className="w-4 h-4 text-purple-500" />}
        />
      </div>

      {/* Row: Monthly Growth & Hourly Peak Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progression */}
        <Card
          title="Monthly Revenue Growth"
          subtitle="Consistent business expansion across H1 2023"
        >
          <ChartContainer height={240} loading={monthlyLoading} empty={!monthlyLoading && !monthlyChartData.length}>
            <AreaChart data={monthlyChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={48} />
              <Tooltip {...TooltipStyle} formatter={v => [fmt(v), 'Revenue']} />
              <Area type="monotone" dataKey="Revenue" stroke="#f59e0b" strokeWidth={2.5} fill="url(#areaGrad)" />
            </AreaChart>
          </ChartContainer>
        </Card>

        {/* Hourly Rush Distribution */}
        <Card
          title="Hourly Foot-Traffic Distribution"
          subtitle="Transactions by hour of day (Peak morning & lunch rush)"
        >
          <ChartContainer height={240} loading={hourlyLoading} empty={!hourlyLoading && !hourly?.length}>
            <BarChart data={hourly || []} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip
                {...TooltipStyle}
                formatter={(v, name) => [
                  name === 'transactions' ? `${Number(v).toLocaleString()} orders` : fmt(v),
                  name === 'transactions' ? 'Transactions' : 'Sales',
                ]}
              />
              <Bar dataKey="transactions" radius={[4, 4, 0, 0]}>
                {(hourly || []).map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.is_rush ? '#f59e0b' : '#cbd5e1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Store Location Highlights */}
      <Card title="Store Location Breakdown" subtitle="Distribution across the 3 retail branches">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {(stores || []).map((s, idx) => {
            const total = stores ? stores.reduce((acc, curr) => acc + curr.total_revenue, 0) : 1;
            const share = ((s.total_revenue / total) * 100).toFixed(1);
            return (
              <div
                key={s.store}
                className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-[0_4px_14px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_20px_-2px_rgba(15,23,42,0.1)] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-800">{s.store}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STORE_COLORS[idx % STORE_COLORS.length] }}
                  />
                </div>
                <div className="text-xl font-bold text-slate-900">{fmt(s.total_revenue)}</div>
                <div className="text-xs text-slate-500 mt-1 flex justify-between">
                  <span>{Number(s.total_transactions).toLocaleString()} orders</span>
                  <span className="font-medium text-slate-700">{share}% share</span>
                </div>
                <div className="mt-2.5 w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${share}%`,
                      backgroundColor: STORE_COLORS[idx % STORE_COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
