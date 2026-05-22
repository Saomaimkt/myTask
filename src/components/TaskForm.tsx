"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/lib/actions";
import { ArrowLeft, Plus, X, Loader2, GripVertical } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "./RichTextEditor";

interface Category {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
}

interface TaskFormProps {
  categories: Category[];
  members: Member[];
}

export default function TaskForm({ categories, members }: TaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Subtasks state
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [relatedMemberIds, setRelatedMemberIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const toggleAssignee = (id: string) => {
    setAssigneeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleRelated = (id: string) => {
    setRelatedMemberIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim() === "") return;
    setSubTasks(prev => [...prev, newSubTaskTitle.trim()]);
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

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSubTasks = [...subTasks];
    const [draggedItem] = newSubTasks.splice(draggedIndex, 1);
    newSubTasks.splice(index, 0, draggedItem);
    setSubTasks(newSubTasks);
    setDraggedIndex(null);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    formData.append("assigneeIds", JSON.stringify(assigneeIds));
    formData.append("relatedMemberIds", JSON.stringify(relatedMemberIds));

    const title = formData.get("title") as string;
    const estimatedAmount = parseFloat(formData.get("estimatedAmount") as string) || 0;
    const actualAmount = parseFloat(formData.get("actualAmount") as string) || 0;
    const deadline = formData.get("deadline") as string;
    const categoryId = formData.get("categoryId") as string;

    try {
      const res = await createTask({
        title,
        description,
        estimatedAmount,
        actualAmount,
        deadline,
        categoryId,
        assigneeIds,
        relatedMemberIds,
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
          <h1 className="text-3xl font-bold">Thêm công việc mới</h1>
          <p className="text-text-muted mt-1">Tạo công việc chính, phân công chi tiết công việc con và thiết lập ngân sách.</p>
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
            placeholder="Ví dụ: Thiết kế Banner, Viết bài blog..."
            required
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">
            Mô tả công việc
          </label>
          <RichTextEditor
            content={description}
            onChange={setDescription}
            placeholder="Mô tả chi tiết nội dung công việc..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-sm font-medium text-text-muted">
                Hạng mục liên kết <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
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
              <label htmlFor="estimatedAmount" className="text-sm font-medium text-text-muted">
                Ngân sách dự kiến (VNĐ) <span className="text-text-muted text-xs">(Nếu có)</span>
              </label>
              <input
                type="number"
                id="estimatedAmount"
                name="estimatedAmount"
                placeholder="0"
                min="0"
                defaultValue="0"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="actualAmount" className="text-sm font-medium text-text-muted">
                Thực chi (VNĐ) <span className="text-text-muted text-xs">(Nếu có)</span>
              </label>
              <input
                type="number"
                id="actualAmount"
                name="actualAmount"
                placeholder="0"
                min="0"
                defaultValue="0"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main"
              />
            </div>
          </div>

          <div className="space-y-4 bg-surface/30 p-4 rounded-xl border border-border/50">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">
                Người phụ trách
              </label>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleAssignee(m.id)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      assigneeIds.includes(m.id)
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                        : 'bg-surface border-border text-text-muted hover:border-primary/50'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
                {members.length === 0 && (
                  <span className="text-sm text-text-muted italic">Chưa có nhân sự nào.</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">
                Người liên quan
              </label>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleRelated(m.id)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      relatedMemberIds.includes(m.id)
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-500'
                        : 'bg-surface border-border text-text-muted hover:border-primary/50'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
                {members.length === 0 && (
                  <span className="text-sm text-text-muted italic">Chưa có nhân sự nào.</span>
                )}
              </div>
            </div>
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
              {subTasks.map((title, index) => (
                <div 
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={() => setDraggedIndex(null)}
                  className={`flex justify-between items-center bg-surface px-4 py-2.5 rounded-xl border border-border/30 cursor-grab active:cursor-grabbing transition-all ${
                    draggedIndex === index ? 'opacity-50 border-dashed border-primary scale-[0.98]' : 'hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-text-muted/50" />
                    <span className="text-sm text-text-main break-all">{title}</span>
                  </div>
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
            <span>Tạo công việc</span>
          </button>
        </div>
      </form>
    </div>
  );
}
