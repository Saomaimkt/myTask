import { getTask, getCategories } from "@/lib/actions";
import EditTaskForm from "@/components/EditTaskForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTaskPage({ params }: PageProps) {
  const { id } = await params;
  const [task, categories] = await Promise.all([
    getTask(id),
    getCategories(),
  ]);

  if (!task) {
    notFound();
  }

  const formattedCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
  }));

  const formattedTask = {
    id: task.id,
    title: task.title,
    description: task.description,
    amount: task.amount,
    deadline: task.deadline,
    categoryId: task.categoryId,
    subTasks: task.subTasks.map(st => ({
      id: st.id,
      title: st.title,
      isCompleted: st.isCompleted,
    })),
  };

  return <EditTaskForm task={formattedTask} categories={formattedCategories} />;
}
