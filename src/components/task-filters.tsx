"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";

interface FilterState {
  search: string;
  status: string;
  priority: string;
  assignee: string;
}

interface TaskFiltersProps {
  members: any[];
  onFilterChange: (filters: FilterState) => void;
  taskCounts: {
    total: number;
    todo: number;
    done: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function TaskFilters({ members, onFilterChange, taskCounts }: TaskFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "ALL",
    priority: "ALL",
    assignee: "ALL",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Notify parent whenever filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      priority: "ALL",
      assignee: "ALL",
    });
  };

  const hasActiveFilters = 
    filters.search !== "" || 
    filters.status !== "ALL" || 
    filters.priority !== "ALL" || 
    filters.assignee !== "ALL";

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar Row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 h-11"
          />
          {filters.search && (
            <button 
              onClick={() => updateFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button 
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="h-11 px-4"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge className="ml-2 bg-purple-600 text-white text-[10px] px-1.5">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Options (Collapsible) */}
      {showFilters && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "ALL", label: "All", count: taskCounts.total },
                  { value: "TODO", label: "Todo", count: taskCounts.todo },
                  { value: "DONE", label: "Done", count: taskCounts.done },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter("status", option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filters.status === option.value
                        ? "bg-purple-600 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-purple-300"
                    }`}
                  >
                    {option.label}
                    <span className={`ml-1.5 text-xs ${
                      filters.status === option.value ? "text-purple-200" : "text-slate-400"
                    }`}>
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "ALL", label: "All" },
                  { value: "HIGH", label: "High", count: taskCounts.high, color: "bg-red-100 text-red-700 border-red-200" },
                  { value: "MEDIUM", label: "Medium", count: taskCounts.medium, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
                  { value: "LOW", label: "Low", count: taskCounts.low, color: "bg-slate-100 text-slate-600 border-slate-200" },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter("priority", option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      filters.priority === option.value
                        ? "bg-purple-600 text-white border-purple-600"
                        : option.color || "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                Assignee
              </label>
              <select
                value={filters.assignee}
                onChange={(e) => updateFilter("assignee", e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Members</option>
                <option value="UNASSIGNED">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.userEmail || m.userId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
                <X className="w-4 h-4 mr-1" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}