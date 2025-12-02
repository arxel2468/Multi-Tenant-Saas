"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInvite } from "@/actions/invite";
import { toast } from "sonner";
import { Loader2, Copy, Check } from "lucide-react";

interface InviteFormProps {
  workspaceId: string;
}

export function InviteForm({ workspaceId }: InviteFormProps) {
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setGeneratedLink(null);

    try {
      const token = await createInvite(formData);
      const link = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
      setGeneratedLink(link);
      toast.success("Invite link generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create invite");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <form action={handleSubmit} className="flex gap-2">
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <Input 
          name="email" 
          placeholder="colleague@example.com" 
          required 
          type="email"
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Link"}
        </Button>
      </form>

      {generatedLink && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium mb-2">Invite link generated!</p>
          <div className="flex gap-2">
            <Input 
              value={generatedLink} 
              readOnly 
              className="bg-white text-xs font-mono"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={copyToClipboard}
              className="flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        New members will join with the "Member" role.
      </p>
    </div>
  );
}