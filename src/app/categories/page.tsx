import { getCategories, deleteCategory } from "@/lib/actions";
import Link from "next/link";
import { Plus, Trash2, FolderOpen, Pencil } from "lucide-react";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hạng mục & Ngân sách</h1>
          <p className="text-text-muted mt-2">Quản lý các hạng mục dự án và giới hạn ngân sách chi tiêu.</p>
        </div>
        <Link
          href="/categories/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-primary/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm hạng mục mới</span>
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center border border-border">
          <FolderOpen className="w-16 h-16 text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chưa có hạng mục nào</h3>
          <p className="text-text-muted max-w-sm">
            Tạo các hạng mục chi tiêu (như Marketing, Thiết kế, Chi tiêu chung) để bắt đầu phân bổ ngân sách.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const estimatedSpent = category.tasks.reduce((sum, task) => sum + task.estimatedAmount, 0);
            const actualSpent = category.tasks.reduce((sum, task) => sum + task.actualAmount, 0);
            const percentage = category.budgetLimit > 0 
              ? Math.min((actualSpent / category.budgetLimit) * 100, 100) 
              : 0;

            const isOverBudget = actualSpent > category.budgetLimit && category.budgetLimit > 0;
            const isActualOverEstimated = actualSpent > estimatedSpent && estimatedSpent > 0;

            return (
              <div
                key={category.id}
                className="glass-panel p-6 rounded-2xl relative group overflow-hidden border border-border"
              >
                {/* Visual Color Bar Indicator */}
                <div
                  className="absolute top-0 left-0 w-full h-1.5"
                  style={{ backgroundColor: category.color }}
                />

                <div className="flex justify-between items-start mt-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="text-xl font-bold">{category.name}</h3>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 transition-all">
                    <Link
                      href={`/categories/${category.id}/edit`}
                      className="text-text-muted hover:text-primary p-2 rounded-lg hover:bg-surface transition-all"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteCategory(category.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-text-muted hover:text-red-500 p-2 rounded-lg hover:bg-surface transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div>
                    <span className="text-xs text-text-muted block mb-1">Dự kiến chi</span>
                    <span className="text-base font-semibold">{estimatedSpent.toLocaleString("vi-VN")} ₫</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block mb-1">Đã chi (Thực tế)</span>
                    <span className={`text-base font-semibold ${isActualOverEstimated ? "text-red-500" : ""}`}>
                      {actualSpent.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block mb-1">Ngân sách giới hạn</span>
                    <span className="text-base font-semibold">
                      {category.budgetLimit > 0
                        ? `${category.budgetLimit.toLocaleString("vi-VN")} ₫`
                        : "Vô hạn"}
                    </span>
                  </div>
                </div>

                {category.budgetLimit > 0 && (
                  <div className="mt-6 space-y-2">
                    <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: isOverBudget ? "#ef4444" : category.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={isOverBudget ? "text-red-500 font-medium" : "text-text-muted"}>
                        {isOverBudget ? "Vượt ngân sách!" : `${percentage.toFixed(0)}% đã dùng`}
                      </span>
                      <span className="text-text-muted">
                        Còn lại: {Math.max(0, category.budgetLimit - actualSpent).toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
