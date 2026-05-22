"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- CATEGORIES ---

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: true,
    },
  });
}

export async function getCategory(id: string) {
  return await prisma.category.findFirst({
    where: { id },
  });
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const budgetLimit = parseFloat(formData.get("budgetLimit") as string) || 0;
  const color = formData.get("color") as string || "#6366f1";

  if (!name) return { error: "Tên hạng mục không được để trống" };

  await prisma.category.create({
    data: {
      name,
      budgetLimit,
      color,
    },
  });

  revalidatePath("/");
  revalidatePath("/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const budgetLimit = parseFloat(formData.get("budgetLimit") as string) || 0;
  const color = formData.get("color") as string || "#6366f1";

  if (!name) return { error: "Tên hạng mục không được để trống" };

  await prisma.category.update({
    where: { id },
    data: {
      name,
      budgetLimit,
      color,
    },
  });

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath(`/categories/${id}/edit`);
}

export async function deleteCategory(id: string) {
  // SQLite doesn't automatically delete tasks if category is deleted, unless cascade is set.
  // We'll delete tasks manually or prisma will throw if restrict is configured.
  // Let's delete related subtasks, then tasks, then the category.
  const tasks = await prisma.task.findMany({ where: { categoryId: id } });
  const taskIds = tasks.map(t => t.id);

  await prisma.subTask.deleteMany({
    where: { taskId: { in: taskIds } },
  });

  await prisma.task.deleteMany({
    where: { categoryId: id },
  });

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/categories");
}

// --- MEMBERS ---

export async function getMembers() {
  return await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignedTasks: true,
      relatedTasks: true,
    },
  });
}

export async function getMember(id: string) {
  return await prisma.member.findFirst({
    where: { id },
  });
}

export async function createMember(formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string || null;
  const color = formData.get("color") as string || "#6366f1";

  if (!name) return { error: "Tên nhân sự không được để trống" };

  await prisma.member.create({
    data: {
      name,
      role,
      color,
    },
  });

  revalidatePath("/");
  revalidatePath("/members");
  revalidatePath("/tasks/new");
}

export async function updateMember(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string || null;
  const color = formData.get("color") as string || "#6366f1";

  if (!name) return { error: "Tên nhân sự không được để trống" };

  await prisma.member.update({
    where: { id },
    data: {
      name,
      role,
      color,
    },
  });

  revalidatePath("/");
  revalidatePath("/members");
  revalidatePath(`/members/${id}/edit`);
  revalidatePath("/tasks");
}

export async function deleteMember(id: string) {
  // SQLite with SetNull will detach tasks automatically from this member
  await prisma.member.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/members");
  revalidatePath("/tasks");
}

// --- TASKS ---

export async function getTasks() {
  return await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      assignees: true,
      relatedMembers: true,
      subTasks: true,
    },
  });
}

export async function getTask(id: string) {
  return await prisma.task.findFirst({
    where: { id },
    include: {
      category: true,
      assignees: true,
      relatedMembers: true,
      subTasks: true,
    },
  });
}

export async function createTask(data: {
  title: string;
  description?: string;
  estimatedAmount: number;
  actualAmount: number;
  deadline?: string;
  categoryId: string;
  assigneeIds: string[];
  relatedMemberIds: string[];
  subTasks: string[];
}) {
  if (!data.title) return { error: "Tiêu đề công việc không được để trống" };
  if (!data.categoryId) return { error: "Vui lòng chọn hạng mục" };

  await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      estimatedAmount: data.estimatedAmount,
      actualAmount: data.actualAmount,
      deadline: data.deadline ? new Date(data.deadline + "T00:00:00+07:00") : null,
      categoryId: data.categoryId,
      assignees: {
        connect: data.assigneeIds.map(id => ({ id })),
      },
      relatedMembers: {
        connect: data.relatedMemberIds.map(id => ({ id })),
      },
      subTasks: {
        create: data.subTasks.filter(t => t.trim() !== "").map(title => ({
          title,
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function updateTask(
  id: string,
  data: {
    title: string;
    description?: string;
    estimatedAmount: number;
    actualAmount: number;
    deadline?: string;
    categoryId: string;
    assigneeIds: string[];
    relatedMemberIds: string[];
    subTasks: { id?: string; title: string; isCompleted?: boolean }[];
  }
) {
  if (!data.title) return { error: "Tiêu đề công việc không được để trống" };
  if (!data.categoryId) return { error: "Vui lòng chọn hạng mục" };

  // 1. Find existing subtasks
  const existingSubTasks = await prisma.subTask.findMany({ where: { taskId: id } });
  
  // 2. Identify subtasks to delete
  const incomingIds = data.subTasks.map(st => st.id).filter(Boolean) as string[];
  const toDelete = existingSubTasks.filter(st => !incomingIds.includes(st.id));
  
  if (toDelete.length > 0) {
    await prisma.subTask.deleteMany({
      where: { id: { in: toDelete.map(st => st.id) } },
    });
  }

  // 3. Update & create subtasks
  for (const st of data.subTasks) {
    if (st.id) {
      await prisma.subTask.update({
        where: { id: st.id },
        data: { title: st.title, isCompleted: st.isCompleted ?? false },
      });
    } else {
      await prisma.subTask.create({
        data: {
          title: st.title,
          isCompleted: st.isCompleted ?? false,
          taskId: id,
        },
      });
    }
  }

  // 4. Update the parent task
  await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      estimatedAmount: data.estimatedAmount,
      actualAmount: data.actualAmount,
      deadline: data.deadline ? new Date(data.deadline + "T00:00:00+07:00") : null,
      categoryId: data.categoryId,
      assignees: {
        set: data.assigneeIds.map(id => ({ id })),
      },
      relatedMembers: {
        set: data.relatedMemberIds.map(id => ({ id })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}/edit`);
}

export async function toggleTask(id: string, isCompleted: boolean) {
  await prisma.task.update({
    where: { id },
    data: { isCompleted },
  });
  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function toggleSubTask(id: string, isCompleted: boolean) {
  await prisma.subTask.update({
    where: { id },
    data: { isCompleted },
  });
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  await prisma.subTask.deleteMany({
    where: { taskId: id },
  });

  await prisma.task.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}
