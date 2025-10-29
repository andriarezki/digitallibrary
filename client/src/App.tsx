import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { UserContext } from "@/context/UserContext";
import { Suspense, lazy } from "react";

// Lazy load pages for better performance
const LoginPage = lazy(() => import("@/pages/login"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const BooksPage = lazy(() => import("@/pages/books"));
const CategoriesPage = lazy(() => import("@/pages/categories"));
const LocationsPage = lazy(() => import("@/pages/locations"));
const LoansPage = lazy(() => import("@/pages/loans"));
const LoanRequestPage = lazy(() => import("@/pages/loan-request"));
const UsersPage = lazy(() => import("@/pages/users"));
const StaffPage = lazy(() => import("@/pages/staff"));
const ReportsPage = lazy(() => import("@/pages/reports"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AboutPage = lazy(() => import("@/pages/about"));

// Loading component for lazy-loaded pages
function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth(); // <-- Make sure useAuth returns user info

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <UserContext.Provider value={user || null}>
      <AuthenticatedLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/books" component={BooksPage} />
            <Route path="/categories" component={CategoriesPage} />
            <Route path="/locations" component={LocationsPage} />
            <Route path="/loans" component={LoansPage} />
            <Route path="/loan-request" component={LoanRequestPage} />
            <Route path="/users" component={UsersPage} />
            <Route path="/staff" component={StaffPage} />
            <Route path="/reports" component={ReportsPage} />
            <Route path="/about" component={AboutPage} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </AuthenticatedLayout>
    </UserContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
