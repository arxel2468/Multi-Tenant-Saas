"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { createTask } from "@/actions/task";
import { useState } from "react";
import { toast } from "sonner";

export function CreateTaskButton({ 
  workspaceId, 
  members 
}: { 
  workspaceId: string;
  members: any[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a new task</SheetTitle>
          <SheetDescription>
            Add a task to your workspace board.
          </SheetDescription>
        </SheetHeader>
        
        <form action={async (formData) => {
            await createTask(formData);
            setOpen(false);
            toast.success("Task created successfully");
        }} className="space-y-4 mt-6">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          
          {/* Title */}
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input 
              id="title" 
              name="title" 
              placeholder="e.g. Redesign Homepage" 
              required 
              className="mt-2" 
            />
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority</Label>
            <select 
              name="priority"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM" selected>Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Due Date - NEW */}
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input 
              id="dueDate" 
              name="dueDate" 
              type="date"
              className="mt-2" 
            />
          </div>

          {/* Assignee */}
          <div>
            <Label htmlFor="assignee">Assign To</Label>
            <select 
              name="assigneeId" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none">No one</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.userEmail || m.userId} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full">Create Task</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}