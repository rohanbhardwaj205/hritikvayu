"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface OrdersDataPoint {
  date: string;
  orders: number;
}

interface OrdersChartProps {
  data: OrdersDataPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-admin-border bg-admin-bg px-4 py-3 shadow-xl">
      <p className="text-xs text-admin-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-admin-text">
        {payload[0].value} orders
      </p>
    </div>
  );
}

export function OrdersChart({ data }: OrdersChartProps) {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-admin-text">
          Daily Orders
        </h3>
        <p className="text-sm text-admin-muted">
          Order count for last 30 days
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#44403C"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A8A29E", fontSize: 12 }}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A8A29E", fontSize: 12 }}
              tickMargin={8}
              width={40}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="orders"
              fill="#8B4513"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
