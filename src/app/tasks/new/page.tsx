import { getCategories } from "@/lib/actions";
import TaskForm from "@/components/TaskForm";

export default async function NewTaskPage() {
  const categories = await getCategories();

  const formattedCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
  }));

  return <TaskForm categories={formattedCategories} />;
}
