"use client";

import { useState, useCallback, useMemo } from "react";
import { TaskFilters } from "@/components/task-filters";
import { TaskCard } from "@/components/task-card";
import { TaskDetailPanel } from "@/components/task-detail-panel";
import { CreateTaskButton } from "@/components/create-task-button";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { ClipboardList } from "lucide-react";

interface FilterState {
  search: string;
  status: string;
  priority: string;
  assignee: string;
}

interface TaskListProps {
  tasks: any[];
  members: any[];
  workspaceId: string;
  currentUserId: string;
  userRole: string;
}

export function TaskList({ tasks, members, workspaceId, currentUserId }: TaskListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "ALL",
    priority: "ALL",
    assignee: "ALL",
  });

  // NEW: Panel state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const taskCounts = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === "TODO").length,
    done: tasks.filter(t => t.status === "DONE").length,
    high: tasks.filter(t => t.priority === "HIGH").length,
    medium: tasks.filter(t => t.priority === "MEDIUM").length,
    low: tasks.filter(t => t.priority === "LOW").length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const assigneeMatch = task.assignee?.userEmail?.toLowerCase().includes(searchLower);
        if (!titleMatch && !assigneeMatch) return false;
      }

      if (filters.status !== "ALL" && task.status !== filters.status) {
        return false;
      }

      if (filters.priority !== "ALL" && task.priority !== filters.priority) {
        return false;
      }

      if (filters.assignee === "UNASSIGNED" && task.assignedToId !== null) {
        return false;
      }
      if (filters.assignee !== "ALL" && filters.assignee !== "UNASSIGNED" && task.assignedToId !== filters.assignee) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const todoTasks = filteredTasks.filter(t => t.status === "TODO");
  const doneTasks = filteredTasks.filter(t => t.status === "DONE");

  const hasActiveFilters = 
    filters.search !== "" || 
    filters.status !== "ALL" || 
    filters.priority !== "ALL" || 
    filters.assignee !== "ALL";

  return (
    <div>
      {/* Filters */}
      <TaskFilters 
        members={members} 
        onFilterChange={handleFilterChange}
        taskCounts={taskCounts}
      />

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="mb-4 text-sm text-slate-500">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      )}

      {/* Task Columns */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* TODO Column */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-slate-500 text-sm uppercase tracking-wider flex items-center justify-between">
            <span>To Do ({todoTasks.length})</span>
          </h2>
          
          {todoTasks.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-6 h-6 text-slate-400" />
              </div>
              {hasActiveFilters ? (
                <>
                  <h3 className="font-semibold text-slate-700 mb-1">No tasks match your filters</h3>
                  <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-slate-700 mb-1">No pending tasks</h3>
                  <p className="text-slate-500 text-sm mb-4">Create your first task to get started</p>
                  <CreateTaskButton workspaceId={workspaceId} members={members} />
                </>
              )}
            </div>
          )}

          {todoTasks.map((task, index) => (
            <FadeIn key={task.id} delay={index * 0.03}>
              <TaskCard 
                task={task} 
                workspaceId={workspaceId} 
                onClick={() => setSelectedTaskId(task.id)}
                currentUserId={currentUserId}
                userRole={userRole}
              />
            </FadeIn>
          ))}
        </div>

        {/* DONE Column */}
        <div className="space-y-4">
          <h2 className="font-bold text-slate-500 text-sm uppercase tracking-wider">
            Completed ({doneTasks.length})
          </h2>
          
          {doneTasks.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50">
              <p className="text-slate-400 text-sm">No completed tasks</p>
            </div>
          )}

          <div className="opacity-70">
            {doneTasks.map((task, index) => (
              <FadeIn key={task.id} delay={index * 0.03}>
                <div className="mb-3">
                  <TaskCard 
                    task={task} 
                    workspaceId={workspaceId}
                    onClick={() => setSelectedTaskId(task.id)} 
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel 
        taskId={selectedTaskId}
        workspaceId={workspaceId}
        currentUserId={currentUserId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}