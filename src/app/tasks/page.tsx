import { getTasks, getCategories, getMembers } from "@/lib/actions";
import TaskList from "@/components/TaskList";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function TasksPage() {
  const [tasks, categories, members] = await Promise.all([
    getTasks(),
    getCategories(),
    getMembers(),
  ]);

  // Map category object shape for type safety
  const formattedCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
    color: c.color,
  }));

  const formattedMembers = members.map(m => ({
    id: m.id,
    name: m.name,
    color: m.color,
  }));

  const formattedTasks = tasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    estimatedAmount: t.estimatedAmount,
    actualAmount: t.actualAmount,
    deadline: t.deadline,
    isCompleted: t.isCompleted,
    categoryId: t.categoryId,
    category: {
      id: t.category.id,
      name: t.category.name,
      color: t.category.color,
    },
    assignees: t.assignees.map(a => ({ id: a.id, name: a.name, color: a.color })),
    relatedMembers: t.relatedMembers.map(m => ({ id: m.id, name: m.name, color: m.color })),
    subTasks: t.subTasks.map(st => ({
      id: st.id,
      title: st.title,
      isCompleted: st.isCompleted,
    })),
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Danh sách công việc</h1>
          <p className="text-text-muted mt-2">Theo dõi các tác vụ chính, công việc con và phân bổ tài chính tương ứng.</p>
        </div>
        <Link
          href="/tasks/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-primary/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm công việc mới</span>
        </Link>
      </div>

      <TaskList initialTasks={formattedTasks} categories={formattedCategories} members={formattedMembers} />
    </div>
  );
}
