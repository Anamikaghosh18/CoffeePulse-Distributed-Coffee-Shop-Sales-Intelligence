import React from 'react';
import { Card } from '../components/common/Card';
import { ChartContainer } from '../components/common/ChartContainer';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, PieChart, Pie, Legend,
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

const CATEGORY_COLORS = ['#946e2d', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#eab308'];
const WEATHER_COLORS = { Sunny: '#f59e0b', Cloudy: '#94a3b8', Rainy: '#3b82f6', Snowy: '#60a5fa' };
const PROMO_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function AnalyticsPage() {
  const { data: categories, loading: catLoading } = useApi('/api/v1/analytics/categories');
  const { data: topProducts, loading: prodLoading } = useApi('/api/v1/analytics/top-products');
  const { data: dow, loading: dowLoading } = useApi('/api/v1/analytics/day-of-week');
  const { data: weather, loading: weatherLoading } = useApi('/api/v1/analytics/weather');
  const { data: promos, loading: promoLoading } = useApi('/api/v1/analytics/promotions');

  return (
    <div className="space-y-6">
      {/* Row 1: Product Categories & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share Donut */}
        <Card
          title="Revenue by Product Category"
          subtitle="Coffee & Tea account for over 66% of overall gross sales"
        >
          <ChartContainer height={260} loading={catLoading} empty={!catLoading && !categories?.length}>
            <PieChart>
              <Pie
                data={categories || []}
                dataKey="total_revenue"
                nameKey="category"
                cx="46%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {(categories || []).map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(val, entry) => (
                  <span className="text-xs text-slate-700">
                    {val}{' '}
                    <span className="text-slate-400 font-normal">
                      ({entry.payload.share_pct}%)
                    </span>
                  </span>
                )}
              />
              <Tooltip {...TooltipStyle} formatter={v => [fmt(v), 'Revenue']} />
            </PieChart>
          </ChartContainer>
        </Card>

        {/* Day of Week Trend */}
        <Card
          title="Revenue by Day of the Week"
          subtitle="Customer purchasing patterns across weekdays vs weekends"
        >
          <ChartContainer height={260} loading={dowLoading} empty={!dowLoading && !dow?.length}>
            <BarChart data={dow || []} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={d => d.slice(0, 3)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
                tickFormatter={v => `$${v.toFixed(0)}`}
                width={48}
              />
              <Tooltip {...TooltipStyle} formatter={v => [`$${Number(v).toFixed(2)}`, 'Daily Avg']} />
              <Bar dataKey="avg_revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {(dow || []).map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.day === 'Monday' || entry.day === 'Friday' ? '#f59e0b' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Row 2: Top Selling Products Leaderboard */}
      <Card
        title="Top Selling Products Leaderboard"
        subtitle="Ranked by total sales revenue across all branches"
        noPad
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-5">Rank</th>
                <th className="py-3 px-5">Product Name</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5 text-right">Units Sold</th>
                <th className="py-3 px-5 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(topProducts || []).map((prod, idx) => (
                <tr key={prod.product} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs text-slate-400 font-semibold">
                    #{idx + 1}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-slate-800">
                    {prod.product}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right text-slate-600 font-mono text-xs">
                    {Number(prod.units_sold).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 text-right font-semibold text-slate-900 font-mono text-xs">
                    {fmt(prod.total_revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Row 3: Environmental Factors (Weather & Promotions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Breakdown */}
        <Card
          title="Revenue Under Weather Conditions"
          subtitle="Categorical weather influence on foot traffic"
        >
          <ChartContainer height={220} loading={weatherLoading} empty={!weatherLoading && !weather?.length}>
            <BarChart data={weather || []} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="weather" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={48} />
              <Tooltip {...TooltipStyle} formatter={v => [fmt(v), 'Revenue']} />
              <Bar dataKey="total_revenue" radius={[4, 4, 0, 0]} maxBarSize={56}>
                {(weather || []).map(entry => (
                  <Cell key={entry.weather} fill={WEATHER_COLORS[entry.weather] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Promotions Breakdown */}
        <Card
          title="Revenue by Promotion Campaign"
          subtitle="Impact of BOGO, Happy Hour & Weekend Specials"
        >
          <ChartContainer height={220} loading={promoLoading} empty={!promoLoading && !promos?.length}>
            <BarChart
              data={promos || []}
              layout="vertical"
              margin={{ top: 8, right: 12, left: 100, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <YAxis
                type="category"
                dataKey="promotion"
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                width={95}
              />
              <Tooltip {...TooltipStyle} formatter={v => [fmt(v), 'Revenue']} />
              <Bar dataKey="total_revenue" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {(promos || []).map((_, idx) => (
                  <Cell key={idx} fill={PROMO_COLORS[idx % PROMO_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>
      </div>
    </div>
  );
}
