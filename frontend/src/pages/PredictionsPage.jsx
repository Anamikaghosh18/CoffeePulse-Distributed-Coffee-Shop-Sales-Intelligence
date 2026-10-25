import React from 'react';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { ChartContainer } from '../components/common/ChartContainer';
import { Select } from '../components/common/Select';
import { Target, CheckCircle, Activity, Hash, Sparkles } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, ReferenceLine,
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

const STORE_COLORS = {
  'Astoria': '#f59e0b',
  "Hell's Kitchen": '#3b82f6',
  'Lower Manhattan': '#10b981',
};

export function PredictionsPage() {
  const { data: metrics, loading: mLoading } = useApi('/api/v1/analytics/model-metrics');
  const { data: preds, loading: pLoading } = useApi('/api/v1/analytics/predictions');
  const [selectedStore, setSelectedStore] = React.useState('all');

  // Simulator state
  const [simStore, setSimStore] = React.useState("Hell's Kitchen");
  const [simWeather, setSimWeather] = React.useState('Sunny');
  const [simPromo, setSimPromo] = React.useState('Weekend Special');
  const [simOrders, setSimOrders] = React.useState(280);
  const [simResult, setSimResult] = React.useState(null);
  const [simLoading, setSimLoading] = React.useState(false);

  // Trigger simulation query
  React.useEffect(() => {
    setSimLoading(true);
    const query = new URLSearchParams({
      store: simStore,
      weather: simWeather,
      promotion: simPromo,
      transactions: simOrders.toString(),
    });
    fetch(`/api/v1/analytics/simulate?${query}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setSimResult(d); setSimLoading(false); })
      .catch(() => setSimLoading(false));
  }, [simStore, simWeather, simPromo, simOrders]);

  const storeOptions = [
    { label: 'All Stores', value: 'all' },
    { label: 'Astoria', value: 'Astoria' },
    { label: "Hell's Kitchen", value: "Hell's Kitchen" },
    { label: 'Lower Manhattan', value: 'Lower Manhattan' },
  ];

  const filtered = React.useMemo(() => {
    if (!preds) return [];
    return (selectedStore === 'all' ? preds : preds.filter(p => p.store === selectedStore))
      .map(p => ({
        date: p.date.slice(5),
        Actual: p.actual,
        Predicted: Number(p.predicted.toFixed(2)),
        store: p.store,
      }));
  }, [preds, selectedStore]);

  const scatterData = React.useMemo(() => {
    if (!preds) return {};
    const src = selectedStore === 'all' ? preds : preds.filter(p => p.store === selectedStore);
    const groups = {};
    src.forEach(p => {
      const k = p.store;
      if (!groups[k]) groups[k] = [];
      groups[k].push({ x: p.actual, y: Number(p.predicted.toFixed(2)) });
    });
    return groups;
  }, [preds, selectedStore]);

  const maxVal = React.useMemo(() => {
    if (!preds) return 2500;
    const all = (selectedStore === 'all' ? preds : preds.filter(p => p.store === selectedStore));
    return Math.ceil(Math.max(...all.map(p => Math.max(p.actual, p.predicted))) / 100) * 100;
  }, [preds, selectedStore]);

  return (
    <div className="space-y-6">
      {/* Model Performance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Model RMSE"
          value={mLoading ? '—' : `$${metrics?.rmse}`}
          sub="Root Mean Squared Error"
          icon={<Target className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          label="R² Score"
          value={mLoading ? '—' : <span className="text-emerald-600 font-bold">{metrics?.r2}</span>}
          sub="85.9% Variance Explained"
          icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          label="Mean Absolute Error"
          value={mLoading ? '—' : `$${metrics?.mae}`}
          sub="Average Prediction Deviation"
          icon={<Activity className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          label="Holdout Test Set"
          value={mLoading ? '—' : `${metrics?.test_records} Days`}
          sub="20% Random Split Sample"
          icon={<Hash className="w-4 h-4 text-purple-500" />}
        />
      </div>

      {/* Actual vs Predicted Time-Series Chart */}
      <Card
        title="Actual vs Predicted Daily Revenue"
        subtitle="Linear Regression predictions vs ground truth on test dataset"
        action={
          <Select
            value={selectedStore}
            options={storeOptions}
            onChange={setSelectedStore}
          />
        }
      >
        <ChartContainer height={260} loading={pLoading} empty={!pLoading && !filtered.length}>
          <LineChart data={filtered} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              interval={Math.ceil(filtered.length / 10)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${v.toFixed(0)}`}
              width={52}
            />
            <Tooltip {...TooltipStyle} formatter={v => [`$${Number(v).toLocaleString()}`, '']} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={v => <span className="text-xs font-medium text-slate-700">{v}</span>}
            />
            <Line
              type="monotone"
              dataKey="Actual"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Actual Sales"
            />
            <Line
              type="monotone"
              dataKey="Predicted"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
              name="Predicted Sales"
            />
          </LineChart>
        </ChartContainer>
      </Card>

      {/* Row: Scatter Plot & Interactive What-If Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot with Diagonal Reference Line */}
        <Card
          title="Residuals & Goodness-of-Fit"
          subtitle="Points aligning along diagonal indicate accurate predictions"
        >
          <ChartContainer height={270} loading={pLoading} empty={!pLoading && !Object.keys(scatterData).length}>
            <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="x"
                name="Actual"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v}`}
                domain={[0, maxVal]}
                label={{ value: 'Actual Revenue ($)', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#94a3b8' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Predicted"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v}`}
                domain={[0, maxVal]}
                label={{ value: 'Predicted ($)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#94a3b8' }}
                width={52}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs shadow-md">
                      <p className="font-semibold text-slate-800 mb-1">{d.store}</p>
                      <p className="text-slate-600">Actual: <span className="font-mono font-semibold text-amber-600">${Number(d.x).toLocaleString()}</span></p>
                      <p className="text-slate-600">Predicted: <span className="font-mono font-semibold text-blue-600">${Number(d.y).toLocaleString()}</span></p>
                      <p className="text-slate-400 text-[10px] mt-0.5">Error: ±${Math.abs(d.x - d.y).toFixed(2)}</p>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                segment={[{ x: 0, y: 0 }, { x: maxVal, y: maxVal }]}
                stroke="#cbd5e1"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'Ideal (x=y)', position: 'insideTopLeft', fontSize: 10, fill: '#94a3b8' }}
              />
              {Object.entries(scatterData).map(([sName, pts]) => (
                <Scatter
                  key={sName}
                  name={sName}
                  data={pts.map(p => ({ ...p, store: sName }))}
                  fill={STORE_COLORS[sName] || '#94a3b8'}
                  fillOpacity={0.75}
                  r={4.5}
                />
              ))}
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={v => <span className="text-xs text-slate-700">{v}</span>}
              />
            </ScatterChart>
          </ChartContainer>
        </Card>

        {/* Interactive Scenario Estimator */}
        <Card
          title="Interactive Revenue Simulator"
          subtitle="Test what-if scenarios using the trained Linear Regression model"
        >
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Location</label>
                <select
                  value={simStore}
                  onChange={e => setSimStore(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800"
                >
                  <option value="Hell's Kitchen">Hell's Kitchen</option>
                  <option value="Astoria">Astoria</option>
                  <option value="Lower Manhattan">Lower Manhattan</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Weather Forecast</label>
                <select
                  value={simWeather}
                  onChange={e => setSimWeather(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800"
                >
                  <option value="Sunny">Sunny (High Footfall)</option>
                  <option value="Cloudy">Cloudy (Average)</option>
                  <option value="Rainy">Rainy (-6% Footfall)</option>
                  <option value="Snowy">Snowy (-12% Footfall)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Promotional Campaign</label>
                <select
                  value={simPromo}
                  onChange={e => setSimPromo(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800"
                >
                  <option value="Weekend Special">Weekend Special (+10%)</option>
                  <option value="Happy Hour">Happy Hour (+6%)</option>
                  <option value="BOGO">BOGO Deal (+4%)</option>
                  <option value="None">Standard Pricing</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-500 font-medium">Estimated Orders</label>
                  <span className="font-mono font-semibold text-amber-600">{simOrders}</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="450"
                  step="5"
                  value={simOrders}
                  onChange={e => setSimOrders(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Estimated Output Banner */}
            <div className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/70 shadow-[0_4px_16px_-2px_rgba(245,158,11,0.15)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Estimated Daily Revenue
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {simLoading ? 'Calculating…' : `$${Number(simResult?.predicted_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Expected 95% interval: ${simResult?.confidence_interval?.[0] || '—'} – ${simResult?.confidence_interval?.[1] || '—'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Model Margin</span>
                <span className="text-xs font-semibold text-slate-700 font-mono">±$149.13 RMSE</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ML Pipeline Stages */}
      <Card title="Spark MLlib Pipeline Architecture" subtitle="Four distributed transformation stages used in training">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            { step: 'Stage 01', name: 'StringIndexer', desc: 'Encodes categorical store, weather, promotion & day variables into numeric indices' },
            { step: 'Stage 02', name: 'OneHotEncoder', desc: 'Transforms indexed values to binary sparse vectors suitable for linear regression' },
            { step: 'Stage 03', name: 'VectorAssembler', desc: 'Concatenates categorical feature vectors with transaction counts and weekend flag' },
            { step: 'Stage 04', name: 'LinearRegression', desc: 'Trains on 80% daily sales split with 100 iterations (regParam=0.05, elasticNet=0.0)' },
          ].map(stage => (
            <div key={stage.step} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70">
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block mb-1">
                {stage.step}
              </span>
              <h4 className="font-semibold text-slate-800 mb-1">{stage.name}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">{stage.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
