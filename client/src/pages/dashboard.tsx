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

interface MonthlyActivity {
  month: string;
  activeUsers: number;
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

  // Chart data for library status with soft colors
  const statusChartData = {
    labels: ['Available', 'On Loan'],
    datasets: [
      {
        data: [stats?.availableBooks || 0, stats?.onLoan || 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // Soft green
          'rgba(251, 146, 60, 0.8)',  // Soft orange
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for categories with soft colors
  const categoryChartData = {
    labels: topCategories?.map(cat => cat.name) || [],
    datasets: [
      {
        label: 'Books per Category',
        data: topCategories?.map(cat => cat.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',   // Soft blue
          'rgba(168, 85, 247, 0.7)',   // Soft purple
          'rgba(236, 72, 153, 0.7)',   // Soft pink
          'rgba(34, 197, 94, 0.7)',    // Soft green
          'rgba(251, 146, 60, 0.7)',   // Soft orange
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Monthly activity data (real data from API)
  const monthlyData = {
    labels: monthlyActivity?.map(data => data.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Active Users',
        data: monthlyActivity?.map(data => data.activeUsers) || [0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(34, 197, 94, 0.8)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Books added by category data (real data from API)
  const weeklyBooksData = {
    labels: weeklyBooks?.map(data => data.week) || ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5', 'Category 6', 'Category 7', 'Category 8'],
    datasets: [
      {
        label: 'Books Added by Category',
        data: weeklyBooks?.map(data => data.booksAdded) || [0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',   // Purple
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(34, 197, 94, 0.8)',    // Green
          'rgba(251, 146, 60, 0.8)',   // Orange
          'rgba(168, 85, 247, 0.8)',   // Purple (repeat for more categories)
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(59, 130, 246, 0.8)',   // Blue
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
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

  // Doughnut chart specific options (no scales for Collection Status)
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300, // Very fast animation for doughnut
      easing: 'easeOutQuad' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15, // Reduced padding
          usePointStyle: true,
          font: {
            family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
            size: 11, // Slightly smaller font
            weight: 500,
          },
          color: 'rgb(71, 85, 105)', // slate-600
        },
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
    // No scales property for doughnut chart - this removes x and y axis
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/top-categories"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-activity"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/weekly-books"] });
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Book Status Doughnut Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Collection Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <Doughnut data={statusChartData} options={doughnutChartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <Bar data={categoryChartData} options={barChartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly User Activity Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Monthly User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <Line data={monthlyData} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Books Added by Category Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Books Added by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyBooksLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <Bar data={weeklyBooksData} options={barChartOptions} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Book Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {topCategories?.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-purple-500' :
                          index === 2 ? 'bg-pink-500' :
                          index === 3 ? 'bg-green-500' : 'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-slate-900">{category.name}</span>
                      </div>
                      <span className="text-sm text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded-full">
                        {category.count.toLocaleString()} books
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Library Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      Collection Health
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Available Books:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${((stats?.availableBooks || 0) / (stats?.totalBooks || 1) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-green-600 text-sm">
                            {((stats?.availableBooks || 0) / (stats?.totalBooks || 1) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Books on Loan:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${((stats?.onLoan || 0) / (stats?.totalBooks || 1) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-orange-600 text-sm">
                            {((stats?.onLoan || 0) / (stats?.totalBooks || 1) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                      <Tags className="w-5 h-5 text-blue-600 mr-2" />
                      Quick Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-white rounded-lg">
                        <span className="text-slate-600 block">Avg. per category</span>
                        <p className="font-bold text-lg text-blue-600">
                          {Math.round((stats?.totalBooks || 0) / (stats?.categories || 1))}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <span className="text-slate-600 block">Collection size</span>
                        <p className="font-bold text-lg text-purple-600">Large</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div className="text-center p-2 bg-white rounded-lg">
                        <span className="text-slate-600 block">Site Visitors</span>
                        <p className="font-bold text-lg text-green-600">
                          {stats?.siteVisitorCount ?? 0}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <span className="text-slate-600 block">PDF Views</span>
                        <p className="font-bold text-lg text-green-600">
                          {stats?.pdfViewCount ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
