"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCategory } from "@/lib/actions";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#eab308", // Yellow
  "#f97316", // Orange
  "#ef4444", // Red
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#64748b", // Slate
];

interface EditCategoryFormProps {
  category: {
    id: string;
    name: string;
    budgetLimit: number;
    color: string;
  };
}

export default function EditCategoryForm({ category }: EditCategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedColor, setSelectedColor] = useState(category.color);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    formData.set("color", selectedColor);

    try {
      const res = await updateCategory(category.id, formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/categories");
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
          href="/categories"
          className="p-3 glass-panel rounded-xl hover:bg-surface text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa hạng mục</h1>
          <p className="text-text-muted mt-1">Cập nhật ngân sách tối đa và màu sắc nhận diện cho hạng mục.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-6 border border-border">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-text-muted">
            Tên hạng mục <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={category.name}
            placeholder="Ví dụ: Thiết kế đồ họa, Tiếp thị số..."
            required
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="budgetLimit" className="text-sm font-medium text-text-muted">
            Giới hạn ngân sách (VNĐ) <span className="text-text-muted text-xs">(Điền 0 nếu không giới hạn)</span>
          </label>
          <input
            type="number"
            id="budgetLimit"
            name="budgetLimit"
            placeholder="0"
            min="0"
            defaultValue={category.budgetLimit}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text-main"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-text-muted">Màu sắc hiển thị</label>
          <div className="flex flex-wrap gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-9 h-9 rounded-full transition-transform duration-200 relative flex items-center justify-center ${
                  selectedColor === color ? "scale-110 shadow-lg" : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <span className="w-2.5 h-2.5 bg-white rounded-full block shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
          <Link
            href="/categories"
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
            <span>Cập nhật</span>
          </button>
        </div>
      </form>
    </div>
  );
}
