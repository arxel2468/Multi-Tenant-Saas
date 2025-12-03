"use client";

import { formatDistanceToNow } from "date-fns";
import { getActionLabel, getActionIcon, ActivityAction } from "@/lib/activity-logger";

interface ActivityLog {
  id: string;
  userEmail: string;
  action: string;
  targetType: string;
  targetName: string | null;
  createdAt: Date;
}

interface ActivityFeedProps {
  logs: ActivityLog[];
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="text-sm">No activity yet</p>
        <p className="text-xs mt-1">Actions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3">
          <div className="text-lg flex-shrink-0">
            {getActionIcon(log.action as ActivityAction)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium text-slate-900">
                {log.userEmail.split("@")[0]}
              </span>{" "}
              <span className="text-slate-600">
                {getActionLabel(log.action as ActivityAction)}
              </span>
              {log.targetName && (
                <span className="font-medium text-slate-900">
                  {" "}"{log.targetName}"
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}