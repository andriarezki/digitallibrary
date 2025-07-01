import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto sticky bottom-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Digital Library Management System</span>
          </div>
          <div>
            © 2025 All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}