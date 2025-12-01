export type Role = "OWNER" | "ADMIN" | "MEMBER";

export const ROLE_HIERARCHY: Record<Role, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export interface Permissions {
  canCreateTask: boolean;
  canEditAnyTask: boolean;
  canDeleteAnyTask: boolean;
  canInviteMembers: boolean;
  canChangeRoles: boolean;
  canRemoveMembers: boolean;
  canDeleteWorkspace: boolean;
  canAccessBilling: boolean;
  canEditTask: (taskCreatorId: string, currentUserId: string) => boolean;
  canDeleteTask: (taskCreatorId: string, currentUserId: string) => boolean;
}

export function getPermissions(role: Role): Permissions {
  const roleLevel = ROLE_HIERARCHY[role];

  return {
    canCreateTask: roleLevel >= 1,
    canEditAnyTask: roleLevel >= 2,
    canDeleteAnyTask: roleLevel >= 2,
    canInviteMembers: roleLevel >= 2,
    canChangeRoles: roleLevel >= 3,
    canRemoveMembers: roleLevel >= 2,
    canDeleteWorkspace: roleLevel >= 3,
    canAccessBilling: roleLevel >= 3,
    
    canEditTask: (taskCreatorId: string, currentUserId: string) => {
      if (roleLevel >= 2) return true;
      return taskCreatorId === currentUserId;
    },
    
    canDeleteTask: (taskCreatorId: string, currentUserId: string) => {
      if (roleLevel >= 2) return true;
      return taskCreatorId === currentUserId;
    },
  };
}

export function canManageRole(managerRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case "OWNER": return "Owner";
    case "ADMIN": return "Admin";
    case "MEMBER": return "Member";
    default: return role;
  }
}

export function getRoleBadgeColor(role: Role): string {
  switch (role) {
    case "OWNER": return "bg-purple-100 text-purple-700 border-purple-200";
    case "ADMIN": return "bg-blue-100 text-blue-700 border-blue-200";
    case "MEMBER": return "bg-slate-100 text-slate-700 border-slate-200";
    default: return "bg-slate-100 text-slate-700";
  }
}