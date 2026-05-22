import { getTask, getCategories, getMembers } from "@/lib/actions";
import EditTaskForm from "@/components/EditTaskForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTaskPage({ params }: PageProps) {
  const { id } = await params;
  const [task, categories, members] = await Promise.all([
    getTask(id),
    getCategories(),
    getMembers(),
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
    estimatedAmount: task.estimatedAmount,
    actualAmount: task.actualAmount,
    deadline: task.deadline,
    categoryId: task.categoryId,
    assignees: task.assignees.map(a => ({ id: a.id, name: a.name, color: a.color })),
    relatedMembers: task.relatedMembers.map(m => ({ id: m.id, name: m.name, color: m.color })),
    subTasks: task.subTasks.map(st => ({
      id: st.id,
      title: st.title,
      isCompleted: st.isCompleted,
    })),
  };

  const formattedMembers = members.map(m => ({
    id: m.id,
    name: m.name,
  }));

  return <EditTaskForm task={formattedTask} categories={formattedCategories} members={formattedMembers} />;
}
