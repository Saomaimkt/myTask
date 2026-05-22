"use client";

import { useState } from "react";
import { toggleTask, toggleSubTask, deleteTask } from "@/lib/actions";
import { CheckSquare, Square, Calendar, DollarSign, Trash2, ChevronDown, ChevronUp, Folder, CheckCircle, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  deadline: Date | null;
  isCompleted: boolean;
  categoryId: string;
  category: Category;
  subTasks: SubTask[];
}

interface TaskListProps {
  initialTasks: Task[];
  categories: Category[];
}

export default function TaskList({ initialTasks, categories }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  // Local state update helper
  const handleToggleTask = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, isCompleted: nextStatus } : t))
    );
    await toggleTask(id, nextStatus);
  };

  const handleToggleSubTask = async (taskId: string, subTaskId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subTasks: t.subTasks.map(st => (st.id === subTaskId ? { ...st, isCompleted: nextStatus } : st)),
          };
        }
        return t;
      })
    );
    await toggleSubTask(subTaskId, nextStatus);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await deleteTask(id);
  };

  const toggleExpand = (id: string) => {
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtering
  const filteredTasks = tasks.filter(task => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && task.isCompleted) ||
      (statusFilter === "pending" && !task.isCompleted);

    const matchesCategory = categoryFilter === "all" || task.categoryId === categoryFilter;

    return matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-surface/40 p-4 rounded-2xl border border-border">
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-surface hover:bg-surface/80 text-text-muted hover:text-text-main"
              }`}
            >
              {status === "all" && "Tất cả"}
              {status === "pending" && "Đang chờ"}
              {status === "completed" && "Hoàn thành"}
            </button>
          ))}
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface border border-border rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">Tất cả hạng mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List container */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-12 rounded-2xl text-center text-text-muted border border-border"
            >
              Không tìm thấy công việc phù hợp.
            </motion.div>
          ) : (
            filteredTasks.map((task) => {
              const totalSub = task.subTasks.length;
              const completedSub = task.subTasks.filter(st => st.isCompleted).length;
              const isExpanded = !!expandedTasks[task.id];

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className={`glass-panel p-5 rounded-2xl border border-border relative overflow-hidden transition-all duration-300 ${
                    task.isCompleted ? "opacity-75" : ""
                  }`}
                >
                  {/* Category color tag accent */}
                  <div
                    className="absolute top-0 left-0 h-full w-1"
                    style={{ backgroundColor: task.category.color }}
                  />

                  <div className="flex gap-4 items-start pl-2">
                    <button
                      onClick={() => handleToggleTask(task.id, task.isCompleted)}
                      className="text-text-muted hover:text-primary transition-colors mt-1 focus:outline-none"
                    >
                      {task.isCompleted ? (
                        <CheckSquare className="w-6 h-6 text-primary" />
                      ) : (
                        <Square className="w-6 h-6" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: `${task.category.color}20`,
                            color: task.category.color,
                          }}
                        >
                          {task.category.name}
                        </span>

                        {task.deadline && (
                          <span className="flex items-center gap-1 text-xs text-text-muted" suppressHydrationWarning>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(task.deadline).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                          </span>
                        )}

                        {task.amount > 0 && (
                          <span className="flex items-center gap-0.5 text-xs font-semibold text-accent">
                            <DollarSign className="w-3.5 h-3.5" />
                            {task.amount.toLocaleString("vi-VN")} ₫
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-lg font-bold text-text-main leading-snug break-words ${
                          task.isCompleted ? "line-through text-text-muted" : ""
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-sm text-text-muted break-words pr-4">
                          {task.description}
                        </p>
                      )}

                      {/* Sub-tasks header/indicator */}
                      {totalSub > 0 && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="flex items-center gap-2 mt-4 text-xs font-semibold text-primary hover:text-primary-hover transition-colors focus:outline-none"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            Công việc con: {completedSub}/{totalSub}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-all">
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="text-text-muted hover:text-primary p-2 rounded-lg hover:bg-surface transition-all"
                      >
                        <Pencil className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-text-muted hover:text-red-500 p-2 rounded-lg hover:bg-surface transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Sub-tasks list */}
                  {totalSub > 0 && isExpanded && (
                    <div className="mt-4 ml-10 pl-4 border-l border-border space-y-2.5 animate-in fade-in duration-200">
                      {task.subTasks.map((subTask) => (
                        <div key={subTask.id} className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleSubTask(task.id, subTask.id, subTask.isCompleted)}
                            className="text-text-muted hover:text-primary transition-colors focus:outline-none"
                          >
                            {subTask.isCompleted ? (
                              <CheckSquare className="w-4.5 h-4.5 text-primary" />
                            ) : (
                              <Square className="w-4.5 h-4.5" />
                            )}
                          </button>
                          <span
                            className={`text-sm break-words ${
                              subTask.isCompleted ? "line-through text-text-muted" : "text-text-main"
                            }`}
                          >
                            {subTask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
