"use client";

import { changeMemberRole } from "@/actions/member";
import { toast } from "sonner";
import { Role } from "@/lib/permissions";

interface RoleSelectorProps {
  memberId: string;
  currentRole: string;
  workspaceId: string;
}

export function RoleSelector({ memberId, currentRole, workspaceId }: RoleSelectorProps) {
  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as Role;
    try {
      await changeMemberRole(memberId, newRole, workspaceId);
      toast.success("Role updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  }

  return (
    <select 
      defaultValue={currentRole}
      onChange={handleChange}
      className="text-sm border rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      <option value="ADMIN">Admin</option>
      <option value="MEMBER">Member</option>
    </select>
  );
}