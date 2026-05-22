"use client";

import { useState, useEffect } from "react";
import { getMember, updateMember } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Briefcase, Palette } from "lucide-react";
import Link from "next/link";
import { use } from "react";

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e",
];

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[5]);
  const [initialData, setInitialData] = useState<{ name: string; role: string | null; color: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const member = await getMember(id);
      if (member) {
        setInitialData(member);
        setSelectedColor(member.color);
      } else {
        router.push("/members");
      }
    }
    loadData();
  }, [id, router]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    formData.append("color", selectedColor);

    const result = await updateMember(id, formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/members");
    }
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10b981]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/members"
          className="p-2 hover:bg-surface rounded-xl transition-colors text-text-muted hover:text-text-main"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-main">Chỉnh sửa nhân sự</h1>
          <p className="text-sm text-text-muted">Cập nhật thông tin của người phụ trách.</p>
        </div>
      </div>

      <form action={handleSubmit} className="glass-panel p-6 md:p-8 rounded-2xl border border-border/50 space-y-6">
        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-muted mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4" />
              Tên nhân sự <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={initialData.name}
              required
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-text-muted mb-1.5 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Vai trò / Chức danh
            </label>
            <input
              type="text"
              id="role"
              name="role"
              defaultValue={initialData.role || ""}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Màu đại diện (Avatar)
            </label>
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${
                    selectedColor === color ? "ring-2 ring-offset-2 ring-offset-background scale-110" : "hover:scale-110 opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50 flex justify-end gap-3">
          <Link
            href="/members"
            className="px-5 py-2.5 rounded-xl font-medium text-text-muted hover:text-text-main hover:bg-surface transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#10b981] to-[#34d399] hover:from-[#059669] hover:to-[#10b981] text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
