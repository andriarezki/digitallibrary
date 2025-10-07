import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Book,
  Tags,
  Archive,
  Users,
  BookOpen,
  FileText,
  LogOut,
  User
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout, isLogoutPending } = useAuth();

  const isAdmin = user?.level === "admin";

  // Move navigation array here so we can filter it
  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Document Repository", href: "/books", icon: Book },
    { name: "Categories", href: "/categories", icon: Tags },
  { name: "Location", href: "/shelves", icon: Archive },
    { name: "Loans", href: "/loans", icon: BookOpen },
    { name: "About", href: "/about", icon: FileText },
    // Only show Users for admin
    ...(isAdmin ? [{ name: "Users", href: "/users", icon: Users }] : []),
    // Only include Reports if admin
    ...(isAdmin ? [{ name: "Reports", href: "/reports", icon: FileText }] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-slate-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 bg-primary">
          <div className="text-white">
            <BookOpen className="inline-block w-5 h-5 mr-2" />
            <span className="text-lg font-semibold">Library System</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-primary border-r-2 border-primary"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.nama || "Admin User"}
              </p>
              <p className="text-xs text-slate-500">
                {user?.level || "Administrator"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLogoutPending}
            className="w-full bg-slate-100 text-slate-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            variant="ghost"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLogoutPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
