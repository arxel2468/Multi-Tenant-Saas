import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
    </div>
  );
}