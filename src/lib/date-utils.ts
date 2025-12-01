export function isOverdue(dueDate: Date | null): boolean {
    if (!dueDate) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Compare dates only, not time
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < now;
  }
  
  export function isDueToday(dueDate: Date | null): boolean {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(dueDate);
    return (
      due.getDate() === now.getDate() &&
      due.getMonth() === now.getMonth() &&
      due.getFullYear() === now.getFullYear()
    );
  }
  
  export function isDueTomorrow(dueDate: Date | null): boolean {
    if (!dueDate) return false;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const due = new Date(dueDate);
    return (
      due.getDate() === tomorrow.getDate() &&
      due.getMonth() === tomorrow.getMonth() &&
      due.getFullYear() === tomorrow.getFullYear()
    );
  }
  
  export function formatDueDate(dueDate: Date | null): string {
    if (!dueDate) return "";
    
    if (isOverdue(dueDate)) {
      const days = Math.floor((new Date().getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
      return `${days} day${days > 1 ? 's' : ''} overdue`;
    }
    
    if (isDueToday(dueDate)) return "Due today";
    if (isDueTomorrow(dueDate)) return "Due tomorrow";
    
    return `Due ${new Date(dueDate).toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  }
  
  export function getDueDateColor(dueDate: Date | null, status: string): string {
    if (status === "DONE") return "text-green-600 bg-green-50";
    if (!dueDate) return "text-slate-500 bg-slate-50";
    if (isOverdue(dueDate)) return "text-red-600 bg-red-50";
    if (isDueToday(dueDate)) return "text-orange-600 bg-orange-50";
    if (isDueTomorrow(dueDate)) return "text-yellow-600 bg-yellow-50";
    return "text-slate-600 bg-slate-50";
  }