"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // You might need to install this: npx shadcn-ui@latest add checkbox
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toggleTaskStatus, deleteTask } from "@/actions/task";
import { toast } from "sonner";

export function TaskCard({ task, workspaceId }: { task: any, workspaceId: string }) {

  // Helper function for colors
  const getPriorityColor = (p: string) => {
    switch(p) {
      case "HIGH": return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "LOW": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <Card className="p-4 flex items-center justify-between hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <Checkbox 
          checked={task.status === "DONE"}
          onCheckedChange={async () => {
            await toggleTaskStatus(task.id, task.status, workspaceId);
            toast("Task status updated");
          }}
        />
        <div>
          <p className={`font-medium ${task.status === "DONE" ? "line-through text-gray-400" : ""}`}>
            {task.title}
          </p>
          {/* Priority Badge */}
          <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-[10px] px-1 py-0 h-5 border`}>
              {task.priority}
          </Badge>
          {task.assignee && (
            <div className="flex items-center gap-2 mt-1">
               <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
                 Assigned to: {task.assignee.userEmail || task.assignee.userId} 
               </Badge>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={async () => {
          await deleteTask(task.id, workspaceId);
          toast.error("Task deleted");
        }}>
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  );
}