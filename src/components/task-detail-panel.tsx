"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CommentList } from "@/components/comment-list";
import { getTaskWithComments } from "@/actions/comment";
import { toggleTaskStatus, deleteTask } from "@/actions/task";
import { formatDueDate, getDueDateColor, isOverdue } from "@/lib/date-utils";
import { Calendar, Clock, User, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

const getPriorityColor = (p: string) => {
  switch(p) {
    case "HIGH": return "bg-red-100 text-red-700 border-red-200";
    case "MEDIUM": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "LOW": return "bg-slate-100 text-slate-700 border-slate-200";
    default: return "bg-slate-100 text-slate-700";
  }
};

interface TaskDetailPanelProps {
  taskId: string | null;
  workspaceId: string;
  currentUserId: string;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, workspaceId, currentUserId, onClose }: TaskDetailPanelProps) {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskId) {
      setLoading(true);
      getTaskWithComments(taskId)
        .then(setTask)
        .finally(() => setLoading(false));
    } else {
      setTask(null);
    }
  }, [taskId]);

  async function handleStatusToggle() {
    if (!task) return;
    await toggleTaskStatus(task.id, task.status, workspaceId);
    toast(task.status === "DONE" ? "Task reopened" : "Task completed");
    // Refresh task data
    const updated = await getTaskWithComments(task.id);
    setTask(updated);
  }

  async function handleDelete() {
    if (!task) return;
    await deleteTask(task.id, workspaceId);
    toast.error("Task deleted");
    onClose();
  }

  const overdue = task && isOverdue(task.dueDate) && task.status !== "DONE";

  return (
    <Sheet open={!!taskId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : task ? (
          <>
            <SheetHeader className="border-b pb-4">
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={task.status === "DONE"}
                  onCheckedChange={handleStatusToggle}
                  className="mt-1"
                />
                <div className="flex-1">
                  <SheetTitle className={`text-xl ${task.status === "DONE" ? "line-through text-slate-400" : ""}`}>
                    {task.title}
                  </SheetTitle>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className={`${getPriorityColor(task.priority)} border`}>
                      {task.priority}
                    </Badge>
                    
                    {task.dueDate && (
                      <Badge variant="outline" className={`${getDueDateColor(task.dueDate, task.status)} border flex items-center gap-1`}>
                        {overdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                        {formatDueDate(task.dueDate)}
                      </Badge>
                    )}

                    <Badge variant="secondary" className="flex items-center gap-1">
                      {task.status === "DONE" ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Task Meta */}
            <div className="py-4 border-b space-y-3">
              {task.assignee && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Assigned to:</span>
                  <span className="font-medium">{task.assignee.userEmail}</span>
                </div>
              )}
              
              {task.description && (
                <p className="text-sm text-slate-600">{task.description}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MessageSquare className="w-4 h-4" />
                <span>{task.comments?.length || 0} comments</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-hidden py-4">
              <h3 className="font-semibold text-sm text-slate-700 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Discussion
              </h3>
              <CommentList 
                taskId={task.id}
                workspaceId={workspaceId}
                comments={task.comments || []}
                currentUserId={currentUserId}
              />
            </div>

            {/* Delete Button */}
            <div className="border-t pt-4">
              <Button 
                variant="ghost" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}