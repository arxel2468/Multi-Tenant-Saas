import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-9xl font-extrabold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold mt-4 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link href="/">
        <Button>Go back home</Button>
      </Link>
    </div>
  );
}