"use client";

import { useState, useEffect } from "react";
import { toggleTask, toggleSubTask, deleteTask } from "@/lib/actions";
import { CheckSquare, Square, Calendar, DollarSign, Trash2, ChevronDown, ChevronUp, Folder, CheckCircle, Pencil, List, LayoutGrid, Kanban } from "lucide-react";
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

interface Member {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  estimatedAmount: number;
  actualAmount: number;
  deadline: Date | null;
  isCompleted: boolean;
  categoryId: string;
  category: Category;
  assignees: Member[];
  relatedMembers: Member[];
  subTasks: SubTask[];
}

interface TaskListProps {
  initialTasks: Task[];
  categories: Category[];
  members: Member[];
}

export default function TaskList({ initialTasks, categories, members }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"deadline_asc" | "deadline_desc">("deadline_desc");
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"list" | "grid" | "kanban">("list");
  const [mounted, setMounted] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedView = localStorage.getItem("taskViewMode");
    if (savedView === "grid" || savedView === "kanban") {
      setViewMode(savedView);
    }
  }, []);

  const handleViewChange = (mode: "list" | "grid" | "kanban") => {
    setViewMode(mode);
    localStorage.setItem("taskViewMode", mode);
  };

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

  // Drag and Drop Handlers for Kanban
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("text/plain", id);
    // Needed for Firefox
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, isCompletedColumn: boolean) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    
    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task || task.isCompleted === isCompletedColumn) {
      setDraggedTaskId(null);
      return;
    }

    // Optimistic UI update
    setTasks(prev => prev.map(t => (t.id === draggedTaskId ? { ...t, isCompleted: isCompletedColumn } : t)));
    setDraggedTaskId(null);

    // Call server action
    await toggleTask(draggedTaskId, isCompletedColumn);
  };

  // Filtering
  const filteredTasks = tasks.filter(task => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && task.isCompleted) ||
      (statusFilter === "pending" && !task.isCompleted);

    const matchesCategory = categoryFilter === "all" || task.categoryId === categoryFilter;

    const matchesAssignee = assigneeFilter === "all" || task.assignees.some(a => a.id === assigneeFilter) || task.relatedMembers.some(m => m.id === assigneeFilter);

    let matchesDate = true;
    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      if (!task.deadline) {
        matchesDate = dateFilter === "no_deadline";
      } else {
        const taskTime = new Date(task.deadline).getTime();
        if (dateFilter === "overdue") {
          matchesDate = taskTime < today.getTime() && !task.isCompleted;
        } else if (dateFilter === "today") {
          matchesDate = taskTime >= today.getTime() && taskTime < tomorrow.getTime();
        } else if (dateFilter === "this_week") {
          matchesDate = taskTime >= today.getTime() && taskTime < nextWeek.getTime();
        } else if (dateFilter === "this_month") {
          matchesDate = taskTime >= today.getTime() && taskTime < nextMonth.getTime();
        } else if (dateFilter === "no_deadline") {
          matchesDate = false;
        }
      }
    }

    return matchesStatus && matchesCategory && matchesAssignee && matchesDate;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOrder === "deadline_asc") {
      if (!a.deadline) return 1; // Put tasks without deadline at the end
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    } else {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
    }
  });

  const renderTaskCard = (task: Task, isDraggable: boolean = false) => {
    const totalSub = task.subTasks.length;
    const completedSub = task.subTasks.filter(st => st.isCompleted).length;
    const isExpanded = !!expandedTasks[task.id];

    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        draggable={isDraggable}
        onDragStart={isDraggable ? (e: any) => handleDragStart(e, task.id) : undefined}
        className={`glass-panel p-5 rounded-2xl border border-border relative overflow-hidden transition-all duration-300 flex flex-col h-full ${
          task.isCompleted ? "opacity-75" : ""
        } ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        <div
          className="absolute top-0 left-0 h-full w-1"
          style={{ backgroundColor: task.category.color }}
        />

        <div className="flex gap-4 items-start pl-2">
          <button
            onClick={() => handleToggleTask(task.id, task.isCompleted)}
            className="text-text-muted hover:text-primary transition-colors mt-1 focus:outline-none flex-shrink-0"
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

              {(task.estimatedAmount > 0 || task.actualAmount > 0) && (
                <div className="flex flex-wrap items-center gap-2 text-xs bg-surface/50 px-2 py-1 rounded-md border border-border/50">
                  <DollarSign className="w-3 h-3 text-text-muted" />
                  {task.estimatedAmount > 0 && (
                    <span className="flex items-center gap-1 text-text-muted">
                      Dự kiến: <span className="font-medium text-text-main">{task.estimatedAmount.toLocaleString("vi-VN")}</span>
                    </span>
                  )}
                  {task.estimatedAmount > 0 && task.actualAmount > 0 && <span className="text-border">|</span>}
                  {task.actualAmount > 0 && (
                    <span className={`flex items-center gap-1 font-medium ${task.actualAmount > task.estimatedAmount && task.estimatedAmount > 0 ? "text-red-500" : "text-accent"}`}>
                      Thực chi: {task.actualAmount.toLocaleString("vi-VN")}
                      {task.actualAmount > task.estimatedAmount && task.estimatedAmount > 0 && (
                        <span title="Vượt ngân sách dự kiến!" className="flex h-2 w-2 rounded-full bg-red-500 ml-1"></span>
                      )}
                    </span>
                  )}
                </div>
              )}

              {task.assignees && task.assignees.length > 0 && (
                <div className="flex items-center ml-1 mt-1 sm:mt-0">
                  <span className="text-[10px] text-text-muted mr-1">Phụ trách:</span>
                  <div className="flex -space-x-1.5 relative z-0 hover:z-10 transition-all">
                    {task.assignees.map((assignee) => (
                      <div
                        key={assignee.id}
                        title={`Phụ trách: ${assignee.name}`}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white border border-background shadow-sm hover:-translate-y-0.5 hover:z-20 relative transition-transform cursor-help"
                        style={{ backgroundColor: assignee.color }}
                      >
                        {assignee.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.relatedMembers && task.relatedMembers.length > 0 && (
                <div className="flex items-center ml-2 mt-1 sm:mt-0">
                  <span className="text-[10px] text-text-muted mr-1">Liên quan:</span>
                  <div className="flex -space-x-1.5 relative z-0 hover:z-10 transition-all opacity-80">
                    {task.relatedMembers.map((member) => (
                      <div
                        key={member.id}
                        title={`Liên quan: ${member.name}`}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white border border-background shadow-sm hover:-translate-y-0.5 hover:z-20 relative transition-transform cursor-help"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
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
              <div 
                className="text-sm text-text-muted break-words pr-4 rich-text-content rich-text-preview"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            )}

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

          <div className="flex items-center gap-1 opacity-100 transition-all flex-shrink-0">
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

        {totalSub > 0 && isExpanded && (
          <div className="mt-4 ml-10 pl-4 border-l border-border space-y-2.5 animate-in fade-in duration-200">
            {task.subTasks.map((subTask) => (
              <div key={subTask.id} className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleSubTask(task.id, subTask.id, subTask.isCompleted)}
                  className="text-text-muted hover:text-primary transition-colors focus:outline-none flex-shrink-0"
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
  };

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-col gap-4 bg-surface/40 p-4 rounded-2xl border border-border">
        <div className="flex flex-wrap justify-between items-center gap-4">
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

          <div className="flex gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "deadline_asc" | "deadline_desc")}
              className="bg-surface border border-border rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
            >
              <option value="deadline_asc">Sắp xếp: Gần nhất</option>
              <option value="deadline_desc">Sắp xếp: Xa nhất</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-border/50 pt-4 items-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 min-w-[150px] bg-surface border border-border rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">Tất cả hạng mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="flex-1 min-w-[150px] bg-surface border border-border rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">Tất cả nhân sự</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 min-w-[150px] bg-surface border border-border rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="this_week">Trong vòng 7 ngày</option>
            <option value="this_month">Trong vòng 30 ngày</option>
            <option value="overdue">Đã quá hạn</option>
            <option value="no_deadline">Không có hạn chót</option>
          </select>
          
          <div className="flex items-center ml-auto bg-surface/50 p-1 rounded-xl border border-border">
            <button
              onClick={() => handleViewChange("list")}
              className={`p-2 rounded-lg transition-colors ${!mounted || viewMode === "list" ? "bg-primary text-white" : "text-text-muted hover:text-text-main hover:bg-surface"}`}
              title="Dạng danh sách"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewChange("grid")}
              className={`p-2 rounded-lg transition-colors ${mounted && viewMode === "grid" ? "bg-primary text-white" : "text-text-muted hover:text-text-main hover:bg-surface"}`}
              title="Dạng lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewChange("kanban")}
              className={`p-2 rounded-lg transition-colors ${mounted && viewMode === "kanban" ? "bg-primary text-white" : "text-text-muted hover:text-text-main hover:bg-surface"}`}
              title="Bảng Kanban"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Task List container */}
      <div className="w-full">
        <AnimatePresence mode="popLayout">
          {sortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-12 rounded-2xl text-center text-text-muted border border-border"
            >
              Không tìm thấy công việc phù hợp.
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {(!mounted || viewMode === "list") && (
                <div className="space-y-4">
                  {sortedTasks.map(task => renderTaskCard(task))}
                </div>
              )}
              {mounted && viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                  {sortedTasks.map(task => renderTaskCard(task))}
                </div>
              )}
              {mounted && viewMode === "kanban" && (
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  <div 
                    className={`flex-1 w-full bg-surface/20 rounded-3xl p-4 md:p-6 border transition-colors ${draggedTaskId ? "border-primary/50 bg-primary/5" : "border-border"}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, false)}
                  >
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Square className="w-5 h-5 text-text-muted"/> 
                      Đang chờ 
                      <span className="bg-surface border border-border px-2 py-0.5 rounded-full text-xs text-text-muted ml-1">
                        {sortedTasks.filter(t => !t.isCompleted).length}
                      </span>
                    </h2>
                    <div className="space-y-4">
                      {sortedTasks.filter(t => !t.isCompleted).map(task => renderTaskCard(task, true))}
                      {sortedTasks.filter(t => !t.isCompleted).length === 0 && (
                        <div className="text-sm text-text-muted italic p-4 text-center border border-dashed border-border rounded-xl">Không có công việc nào</div>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className={`flex-1 w-full bg-surface/20 rounded-3xl p-4 md:p-6 border opacity-90 transition-colors ${draggedTaskId ? "border-primary/50 bg-primary/5" : "border-border"}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, true)}
                  >
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-primary"/> 
                      Hoàn thành
                      <span className="bg-surface border border-border px-2 py-0.5 rounded-full text-xs text-text-muted ml-1">
                        {sortedTasks.filter(t => t.isCompleted).length}
                      </span>
                    </h2>
                    <div className="space-y-4">
                      {sortedTasks.filter(t => t.isCompleted).map(task => renderTaskCard(task, true))}
                      {sortedTasks.filter(t => t.isCompleted).length === 0 && (
                        <div className="text-sm text-text-muted italic p-4 text-center border border-dashed border-border rounded-xl">Không có công việc nào</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
