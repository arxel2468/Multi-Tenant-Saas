"use client";

import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";
import { removeMember } from "@/actions/member";
import { toast } from "sonner";

interface RemoveMemberButtonProps {
  memberId: string;
  workspaceId: string;
}

export function RemoveMemberButton({ memberId, workspaceId }: RemoveMemberButtonProps) {
  async function handleRemove() {
    try {
      await removeMember(memberId, workspaceId);
      toast.success("Member removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    }
  }

  return (
    <Button 
      type="button"
      variant="ghost" 
      size="sm" 
      className="text-red-500 hover:text-red-600 hover:bg-red-50"
      onClick={handleRemove}
    >
      <UserMinus className="w-4 h-4" />
    </Button>
  );
}