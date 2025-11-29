"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // You might need to install this: npx shadcn-ui@latest add checkbox
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toggleTaskStatus, deleteTask } from "@/actions/task";

export function TaskCard({ task, workspaceId }: { task: any, workspaceId: string }) {
  return (
    <Card className="p-4 flex items-center justify-between hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <Checkbox 
          checked={task.status === "DONE"}
          onCheckedChange={async () => {
            await toggleTaskStatus(task.id, task.status, workspaceId);
          }}
        />
        <div>
          <p className={`font-medium ${task.status === "DONE" ? "line-through text-gray-400" : ""}`}>
            {task.title}
          </p>
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
        onClick={async () => await deleteTask(task.id, workspaceId)}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  );
}