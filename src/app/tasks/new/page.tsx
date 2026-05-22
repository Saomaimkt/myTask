import { getCategories, getMembers } from "@/lib/actions";
import TaskForm from "@/components/TaskForm";

export default async function NewTaskPage() {
  const categories = await getCategories();
  const members = await getMembers();

  const formattedCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
  }));

  const formattedMembers = members.map(m => ({
    id: m.id,
    name: m.name,
  }));

  return <TaskForm categories={formattedCategories} members={formattedMembers} />;
}
