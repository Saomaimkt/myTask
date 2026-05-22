"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface BarData {
  name: string;
  spent: number;
}

interface DashboardChartsProps {
  pieData: PieData[];
  barData: BarData[];
}

export default function DashboardCharts({ pieData, barData }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl h-80 flex items-center justify-center border border-border animate-pulse">
          <p className="text-text-muted">Đang tải biểu đồ...</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl h-80 flex items-center justify-center border border-border animate-pulse">
          <p className="text-text-muted">Đang tải biểu đồ...</p>
        </div>
      </div>
    );
  }

  const hasPieData = pieData.some(d => d.value > 0);
  const hasBarData = barData.some(d => d.spent > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Pie Chart: Budget spent by category */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col border border-border h-[400px]">
        <h3 className="text-lg font-bold mb-4">Chi tiêu theo Hạng mục</h3>
        <div className="flex-1 min-h-0 relative">
          {!hasPieData ? (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
              Chưa có dữ liệu chi tiêu để hiển thị.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString("vi-VN")} ₫`, "Đã chi"]}
                  contentStyle={{ backgroundColor: "#1e2130", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar Chart: Monthly budget spending */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col border border-border h-[400px]">
        <h3 className="text-lg font-bold mb-4">Ngân sách tiêu dùng hàng tháng</h3>
        <div className="flex-1 min-h-0 relative">
          {!hasBarData ? (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
              Chưa có dữ liệu chi tiêu hàng tháng.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000).toLocaleString("vi-VN")}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString("vi-VN")} ₫`, "Chi tiêu"]}
                  contentStyle={{ backgroundColor: "#1e2130", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                />
                <Bar dataKey="spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
