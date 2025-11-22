"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspace } from "@/actions/workspace";
import { Plus } from "lucide-react";

export function CreateWorkspaceDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Workspace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Team</DialogTitle>
        </DialogHeader>
        <form action={createWorkspace} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Acme Corp, My Startup..."
              required
              className="mt-2"
            />
          </div>
          <Button type="submit" className="w-full">
            Create & Enter Dashboard
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
