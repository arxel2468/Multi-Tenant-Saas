"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Send, Loader2 } from "lucide-react";
import { createComment, deleteComment } from "@/actions/comment";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  userId: string;
  userEmail: string;
  createdAt: Date;
}

interface CommentListProps {
  taskId: string;
  workspaceId: string;
  comments: Comment[];
  currentUserId: string;
}

export function CommentList({ taskId, workspaceId, comments, currentUserId }: CommentListProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("workspaceId", workspaceId);
    formData.append("content", newComment);

    try {
      await createComment(formData);
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await deleteComment(commentId, workspaceId);
      toast.success("Comment deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete comment");
    }
  }

  function getInitials(email: string): string {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  }

  function getAvatarColor(email: string): string {
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  }

  return (
    <div className="flex flex-col h-full">
      {/* Comment List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-1">Be the first to add a comment</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group flex gap-3">
              <Avatar className={`w-8 h-8 ${getAvatarColor(comment.userEmail)}`}>
                <AvatarFallback className="text-white text-xs">
                  {getInitials(comment.userEmail)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-slate-900">
                    {comment.userEmail.split("@")[0]}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>

              {comment.userId === currentUserId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="border-t pt-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-slate-400">
            Press Ctrl+Enter to send
          </span>
          <Button 
            type="submit" 
            size="sm" 
            disabled={isSubmitting || !newComment.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                Send
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}