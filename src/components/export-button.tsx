"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2, FileText, Activity } from "lucide-react";
import { exportActivityLogs, exportTasks } from "@/actions/export";
import { toast } from "sonner";

interface ExportButtonProps {
  workspaceId: string;
}

export function ExportButton({ workspaceId }: ExportButtonProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleExport(type: "activity" | "tasks") {
    setLoading(type);
    try {
      const csv = type === "activity" 
        ? await exportActivityLogs(workspaceId)
        : await exportTasks(workspaceId);

      // Download the file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${type === "activity" ? "Activity log" : "Tasks"} exported successfully`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export");
    } finally {
      setLoading(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("tasks")} disabled={loading !== null}>
          {loading === "tasks" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Export Tasks (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("activity")} disabled={loading !== null}>
          {loading === "activity" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Activity className="w-4 h-4 mr-2" />
          )}
          Export Activity Log (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}