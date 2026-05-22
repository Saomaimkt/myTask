"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTask } from "@/lib/actions";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface SubTaskInput {
  id?: string;
  title: string;
  isCompleted?: boolean;
}

interface EditTaskFormProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    amount: number;
    deadline: Date | null;
    categoryId: string;
    subTasks: {
      id: string;
      title: string;
      isCompleted: boolean;
    }[];
  };
  categories: Category[];
}

export default function EditTaskForm({ task, categories }: EditTaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Format task deadline for HTML input: YYYY-MM-DD
  const formattedDeadline = task.deadline
    ? new Date(task.deadline).toISOString().split("T")[0]
    : "";

  // Subtasks state: holds both existing subtasks (with id) and new subtasks (without id)
  const [subTasks, setSubTasks] = useState<SubTaskInput[]>(
    task.subTasks.map(st => ({ id: st.id, title: st.title, isCompleted: st.isCompleted }))
  );
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim() === "") return;
    setSubTasks(prev => [...prev, { title: newSubTaskTitle.trim(), isCompleted: false }]);
    setNewSubTaskTitle("");
  };

  const handleRemoveSubTask = (index: number) => {
    setSubTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubTask();
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const deadline = formData.get("deadline") as string;
    const categoryId = formData.get("categoryId") as string;

    try {
      const res = await updateTask(task.id, {
        title,
        description,
        amount,
        deadline,
        categoryId,
        subTasks,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/tasks");
        router.refresh();
      }
    } catch (err) {
      setError("Đã xảy ra lỗi bất ngờ. Vui lòng thử lại.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link
          href="/tasks"
          className="p-3 glass-panel rounded-xl hover:bg-surface text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa công việc</h1>
          <p className="text-text-muted mt-1">Cập nhật nội dung, chi phí, hạn chót và quản lý các công việc con liên quan.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-6 border border-border">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-text-muted">
            Tiêu đề công việc <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={task.title}
            placeholder="Ví dụ: Thiết kế Banner, Viết bài blog..."
            required
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-text-muted">
            Mô tả công việc
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={task.description || ""}
            placeholder="Mô tả ngắn gọn nội dung công việc..."
            rows={3}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="categoryId" className="text-sm font-medium text-text-muted">
              Hạng mục liên kết <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={task.categoryId}
              required
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main"
            >
              <option value="">Chọn hạng mục...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium text-text-muted">
              Chi phí dự kiến (VNĐ) <span className="text-text-muted text-xs">(Nếu có)</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              placeholder="0"
              min="0"
              defaultValue={task.amount}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="deadline" className="text-sm font-medium text-text-muted">
            Hạn chót (Deadline)
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            defaultValue={formattedDeadline}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main"
          />
        </div>

        {/* Sub-tasks Section */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div>
            <h3 className="text-sm font-medium text-text-muted">Danh sách công việc con (Checklist)</h3>
            <p className="text-xs text-text-muted/80 mt-1">Chia nhỏ công việc lớn thành nhiều đầu việc nhỏ để dễ quản lý.</p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ví dụ: Thiết kế nháp, Gửi khách duyệt..."
              value={newSubTaskTitle}
              onChange={(e) => setNewSubTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main"
            />
            <button
              type="button"
              onClick={handleAddSubTask}
              className="p-3 bg-surface hover:bg-surface/80 border border-border rounded-xl text-primary transition-all flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {subTasks.length > 0 && (
            <div className="bg-surface/30 border border-border/50 rounded-2xl p-4 space-y-2 max-h-48 overflow-y-auto">
              {subTasks.map((st, index) => (
                <div key={index} className="flex justify-between items-center bg-surface px-4 py-2.5 rounded-xl border border-border/30">
                  <span className={`text-sm break-all ${st.isCompleted ? "line-through text-text-muted" : "text-text-main"}`}>
                    {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubTask(index)}
                    className="text-text-muted hover:text-red-500 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-border/50">
          <Link
            href="/tasks"
            className="px-6 py-3 rounded-xl border border-border hover:bg-surface text-text-muted hover:text-text-main font-medium transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>Cập nhật công việc</span>
          </button>
        </div>
      </form>
    </div>
  );
}
