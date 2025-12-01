"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, Clock, MessageSquare } from "lucide-react";
import { toggleTaskStatus, deleteTask } from "@/actions/task";
import { toast } from "sonner";
import { formatDueDate, getDueDateColor, isOverdue } from "@/lib/date-utils";
import { getPermissions, Role } from "@/lib/permissions";

const getPriorityColor = (p: string) => {
  switch(p) {
    case "HIGH": return "bg-red-100 text-red-700 border-red-200";
    case "MEDIUM": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "LOW": return "bg-slate-100 text-slate-700 border-slate-200";
    default: return "bg-slate-100 text-slate-700";
  }
};

interface TaskCardProps {
  task: any;
  workspaceId: string;
  onClick?: () => void;
  currentUserId: string;
  userRole: string;
}

export function TaskCard({ task, workspaceId, onClick }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate) && task.status !== "DONE";
  const commentCount = task._count?.comments || task.comments?.length || 0;
  const permissions = getPermissions(userRole as Role);
  const canDelete = permissions.canDeleteTask(task.createById || "", currentUserId)

  return (
    <Card 
      className={`p-4 hover:shadow-md transition-all cursor-pointer ${overdue ? 'border-red-300 bg-red-50/30' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              checked={task.status === "DONE"}
              onCheckedChange={async () => {
                await toggleTaskStatus(task.id, task.status, workspaceId);
                toast(task.status === "DONE" ? "Task reopened" : "Task completed");
              }}
              className="mt-1"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${task.status === "DONE" ? "line-through text-gray-400" : ""}`}>
              {task.title}
            </p>
            
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Priority Badge */}
              <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-[10px] px-2 py-0 h-5 border`}>
                {task.priority}
              </Badge>

              {/* Due Date Badge */}
              {task.dueDate && (
                <Badge variant="outline" className={`${getDueDateColor(task.dueDate, task.status)} text-[10px] px-2 py-0 h-5 border flex items-center gap-1`}>
                  {overdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                  {formatDueDate(task.dueDate)}
                </Badge>
              )}

              {/* Comment Count Badge */}
              {commentCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {commentCount}
                </Badge>
              )}

              {/* Assignee Badge */}
              {task.assignee && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
                  {task.assignee.userEmail || task.assignee.userId}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {canDelete && (
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              await deleteTask(task.id, workspaceId);
              toast.error("Task deleted");
            }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
      </div>
    </Card>
  );
}