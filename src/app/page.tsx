import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/DashboardCharts";
import { FolderKanban, Layers, Wallet, TrendingUp, CheckCircle, Clock } from "lucide-react";

export default async function Home() {
  // Fetch data
  const [categories, tasks] = await Promise.all([
    prisma.category.findMany({
      include: {
        tasks: true,
      },
    }),
    prisma.task.findMany({
      include: {
        subTasks: true,
      },
    }),
  ]);

  const taskCount = tasks.length;
  const completedTaskCount = tasks.filter(t => t.isCompleted).length;
  const pendingTaskCount = taskCount - completedTaskCount;

  const categoryCount = categories.length;

  // Calculations
  const totalBudget = categories.reduce((sum, c) => sum + c.budgetLimit, 0);
  const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedAmount || 0), 0);
  const totalActual = tasks.reduce((sum, t) => sum + (t.actualAmount || 0), 0);

  // Pie Chart Data: Spent per Category
  const pieData = categories.map((c) => ({
    name: c.name,
    value: c.tasks.reduce((sum, t) => sum + (t.actualAmount || 0), 0),
    estimated: c.tasks.reduce((sum, t) => sum + (t.estimatedAmount || 0), 0),
    color: c.color,
  }));

  // Bar Chart Data: Monthly Spending (last 6 months)
  const monthNames = [
    "Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6",
    "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"
  ];

  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.getMonth(),
      year: d.getFullYear(),
      name: `${monthNames[d.getMonth()]}`,
      spent: 0,
      estimated: 0,
    };
  });

  tasks.forEach((task) => {
    const date = task.deadline || task.createdAt;
    const taskMonth = date.getMonth();
    const taskYear = date.getFullYear();

    const bucket = last6Months.find(m => m.month === taskMonth && m.year === taskYear);
    if (bucket) {
      bucket.spent += (task.actualAmount || 0);
      bucket.estimated += (task.estimatedAmount || 0);
    }
  });

  const barData = last6Months.map((m) => ({
    name: m.name,
    spent: m.spent,
    estimated: m.estimated,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold">Tổng quan dự án</h1>
        <p className="text-text-muted mt-2">Theo dõi tiến độ công việc, quản lý danh mục và điều phối ngân sách trực quan.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-border relative overflow-hidden group">
          <div className="p-4 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-muted">Tổng công việc</h3>
            <p className="text-3xl font-bold mt-1 text-text-main">{taskCount}</p>
            <div className="flex gap-3 text-xs text-text-muted mt-2">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {completedTaskCount} Xong
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-yellow-500" /> {pendingTaskCount} Chờ
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-border relative overflow-hidden group">
          <div className="p-4 bg-secondary/10 rounded-xl text-secondary group-hover:scale-110 transition-transform duration-300">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-muted">Hạng mục dự án</h3>
            <p className="text-3xl font-bold mt-1 text-text-main">{categoryCount}</p>
            <p className="text-xs text-text-muted mt-2">Phân bổ ngân sách theo chuyên môn</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-border relative overflow-hidden group">
          <div className="p-4 bg-accent/10 rounded-xl text-accent group-hover:scale-110 transition-transform duration-300">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-muted">Ngân sách</h3>
            <p className="text-3xl font-bold mt-1 text-accent">{totalActual.toLocaleString("vi-VN")} ₫</p>
            <div className="text-xs text-text-muted mt-2 space-y-0.5">
              <p>Dự kiến: {totalEstimated.toLocaleString("vi-VN")} ₫</p>
              <p>Hạn mức: {totalBudget > 0 ? `${totalBudget.toLocaleString("vi-VN")} ₫` : "Không giới hạn"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Chart Integration */}
      <DashboardCharts pieData={pieData} barData={barData} />
    </div>
  );
}
