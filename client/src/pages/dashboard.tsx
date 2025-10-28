import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, CheckCircle, Hand, Tags, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Configure Chart.js defaults to use Poppins font
ChartJS.defaults.font.family = 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
ChartJS.defaults.font.size = 12;
ChartJS.defaults.font.weight = 'normal';
ChartJS.defaults.color = 'rgb(71, 85, 105)'; // slate-600

interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  onLoan: number;
  categories: number;
  siteVisitorCount: number;
  pdfViewCount: number;
}

interface TopCategory {
  id: number;
  name: string;
  count: number;
}

interface MonthlyActivity {
  month: string;
  activeUsers: number;
}

interface WeeklyBooks {
  week: string;
  booksAdded: number;
}

interface DepartmentData {
  department: string;
  count: number;
}

interface MostReadData {
  category: string;
  views: number;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 10 * 60 * 1000, // 10 minutes cache (stats don't change often)
    gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
  });

  const { data: topCategories, isLoading: categoriesLoading } = useQuery<TopCategory[]>({
    queryKey: ["/api/dashboard/top-categories"],
    staleTime: 15 * 60 * 1000, // 15 minutes cache (categories change rarely)
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });

  const { data: monthlyActivity, isLoading: activityLoading } = useQuery<MonthlyActivity[]>({
    queryKey: ["/api/dashboard/monthly-activity"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  const { data: weeklyBooks, isLoading: weeklyBooksLoading } = useQuery<WeeklyBooks[]>({
    queryKey: ["/api/dashboard/weekly-books"],
    staleTime: 2 * 60 * 1000, // 2 minutes cache (more frequent updates)
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  });

  const { data: departmentData, isLoading: departmentLoading } = useQuery<DepartmentData[]>({
    queryKey: ["/api/dashboard/documents-by-department"],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
  });

  const { data: mostReadData, isLoading: mostReadLoading } = useQuery<MostReadData[]>({
    queryKey: ["/api/dashboard/most-read-by-category"],
    staleTime: 15 * 60 * 1000, // 15 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });

  // 1. Top 5 Document Collection (Bar Chart)
  const topDocumentChartData = {
    labels: topCategories?.map(cat => cat.name) || [],
    datasets: [
      {
        label: 'Documents',
        data: topCategories?.map(cat => cat.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(168, 85, 247, 0.8)',   // Purple
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(34, 197, 94, 0.8)',    // Green
          'rgba(251, 146, 60, 0.8)',   // Orange
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  // 2. Documents by Department (Bar Chart)
  const departmentChartData = {
    labels: departmentData?.map(dept => dept.department) || [],
    datasets: [
      {
        label: 'Documents',
        data: departmentData?.map(dept => dept.count) || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',    // Green
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(168, 85, 247, 0.8)',   // Purple
          'rgba(251, 146, 60, 0.8)',   // Orange
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(14, 165, 233, 0.8)',   // Sky blue
          'rgba(139, 69, 19, 0.8)',    // Brown
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(139, 69, 19, 1)',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  // 3. Site Visitor (Line Chart)
  const siteVisitorData = {
    labels: monthlyActivity?.map(data => data.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Site Visitors',
        data: monthlyActivity?.map(data => data.activeUsers) || [0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(34, 197, 94, 0.9)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  // 4. Most Read by Category (Doughnut Chart)
  const mostReadChartData = {
    labels: mostReadData?.map(data => data.category) || [],
    datasets: [
      {
        data: mostReadData?.map(data => data.views) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(168, 85, 247, 0.8)',   // Purple
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(34, 197, 94, 0.8)',    // Green
          'rgba(251, 146, 60, 0.8)',   // Orange
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500, // Reduced from 1000ms to 500ms for faster loading
      easing: 'easeOutQuart' as const,
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15, // Reduced padding
          usePointStyle: true,
          font: {
            family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
            size: 11, // Reduced font size
            weight: 500,
          },
          color: 'rgb(71, 85, 105)', // slate-600
        },
      },
      tooltip: {
        titleFont: {
          family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          size: 13,
          weight: 600,
        },
        bodyFont: {
          family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          size: 12,
          weight: 'normal' as const,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Remove background grid lines
        },
        border: {
          display: false, // Remove axis border
        },
        ticks: {
          font: {
            family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
            size: 11,
            weight: 500,
          },
          color: 'rgb(100, 116, 139)', // slate-500
        },
      },
      y: {
        grid: {
          display: false, // Remove background grid lines
        },
        border: {
          display: false, // Remove axis border
        },
        ticks: {
          font: {
            family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
            size: 11,
            weight: 500,
          },
          color: 'rgb(100, 116, 139)', // slate-500
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 400, // Reduced from 800ms to 400ms for faster loading
      easing: 'easeOutQuart' as const,
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        titleFont: {
          family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          size: 12, // Reduced font size
          weight: 600,
        },
        bodyFont: {
          family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          size: 11, // Reduced font size
          weight: 'normal' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false, // Remove background grid lines
        },
        border: {
          display: false, // Remove axis border
        },
        ticks: {
          font: {
            family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
            size: 10, // Smaller font for faster rendering
            weight: 500,
          },
          color: 'rgb(100, 116, 139)', // slate-500
        },
      },
      x: {
        grid: {
          display: false, // Remove background grid lines
        },
        border: {
          display: false, // Remove axis border
        },
        ticks: {
          font: {
            family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
            size: 10, // Smaller font for faster rendering
            weight: 500,
          },
          color: 'rgb(100, 116, 139)', // slate-500
        },
      },
    },
  };

  // Doughnut chart options for Most Read by Category
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 400,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
            size: 11,
            weight: 500,
          },
          color: 'rgb(71, 85, 105)',
        },
      },
      tooltip: {
        titleFont: {
          family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          size: 12,
          weight: 600,
        },
        bodyFont: {
          family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          size: 11,
          weight: 'normal' as const,
        },
      },
    },
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/top-categories"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-activity"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/weekly-books"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/documents-by-department"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/most-read-by-category"] });
    toast({
      title: "Data refreshed",
      description: "Dashboard data has been updated",
    });
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-600">
              Last updated: <span>{currentDate}</span>
            </div>
            <Button 
              onClick={handleRefresh}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-primary">
                  <Book className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Documents</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">
                      {stats?.totalBooks.toLocaleString() || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-accent">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Available</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">
                      {stats?.availableBooks.toLocaleString() || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                  <Hand className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">On Loan</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">
                      {stats?.onLoan.toLocaleString() || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Tags className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Categories</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">
                      {stats?.categories || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - 4 Charts in 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 1. Top 5 Document Collection (Bar Chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Top 5 Document Collection</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <Bar data={topDocumentChartData} options={barChartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Documents by Department (Bar Chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Documents by Department</CardTitle>
            </CardHeader>
            <CardContent>
              {departmentLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <Bar data={departmentChartData} options={barChartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Site Visitor (Line Chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Site Visitor Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <Line data={siteVisitorData} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Most Read by Category (Doughnut Chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Most Read by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {mostReadLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <Doughnut data={mostReadChartData} options={doughnutChartOptions} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
