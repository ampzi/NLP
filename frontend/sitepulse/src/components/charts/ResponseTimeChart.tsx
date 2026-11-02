import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ResponseTimePoint, ResponseTimeRange } from '../../types/monitor';
import { formatMs } from '../../utils/format';

interface ResponseTimeChartProps {
  data: ResponseTimePoint[];
  range: ResponseTimeRange;
  height?: number;
}

function formatTick(iso: string, range: ResponseTimeRange): string {
  const date = new Date(iso);
  if (range === '24h') {
    return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(date);
  }
  return new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(date);
}

export function ResponseTimeChart({ data, range, height = 280 }: ResponseTimeChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    tick: formatTick(d.timestamp, range),
  }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#CCC5B9" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="tick"
            tick={{ fill: '#403D39', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#CCC5B9' }}
            minTickGap={32}
          />
          <YAxis
            tick={{ fill: '#403D39', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFCF2',
              border: '1px solid #CCC5B9',
              borderRadius: 8,
              fontSize: 12,
              direction: 'rtl',
            }}
            labelStyle={{ color: '#252422', fontWeight: 600, marginBottom: 4 }}
            formatter={(value) => [formatMs(value as number), 'زمان پاسخ']}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.timestamp
                ? new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(
                    new Date(payload[0].payload.timestamp),
                  )
                : ''
            }
          />
          <Line
            type="monotone"
            dataKey="responseTimeMs"
            stroke="#EB5E28"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#EB5E28' }}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
