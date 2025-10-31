import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, BookOpen, Clock, CheckCircle, XCircle, Search, Eye, Check, X, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { useCenteredNotification } from "@/components/ui/centered-notification";
import { apiRequest } from "@/lib/queryClient";
import { addDays, format } from "date-fns";

interface LoanRequest {
  id: number;
  request_id: string;
  id_buku: number;
  employee_nik: string;
  borrower_name: string;
  borrower_email: string;
  borrower_phone: string;
  request_date: string;
  requested_return_date: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'on_loan' | 'returned' | 'overdue';
  approved_by: number | null;
  approval_date: string | null;
  approval_notes?: string | null;
  loan_date: string | null;
  due_date: string | null;
  return_date: string | null;
  return_notes?: string | null;
  created_at: string;
  updated_at: string;
  book_title?: string | null;
  book_isbn?: string | null;
  book_author?: string | null;
  employee_name?: string | null;
  employee_department?: string | null;
  approver_name?: string | null;
}

interface LoanStats {
  pending: number;
  active?: number;     // For admin stats
  approved?: number;   // For user stats  
  completed?: number;  // For admin stats
  returned?: number;   // For user stats
  overdue?: number;    // For admin stats only
}

const MAX_LOAN_PERIOD_DAYS = 14;

export default function LoansPage() {
  const [, setLocation] = useLocation();
  const user = useUser();
  const isAdminOrPetugas = user?.level === "admin" || user?.level === "petugas";
  const { showNotification, NotificationComponent } = useCenteredNotification();
  const queryClient = useQueryClient();

  const formatDateSafe = (value: string | null | undefined, pattern = 'PPP') => {
    if (!value) return "-";
    return format(new Date(value), pattern);
  };

  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const autoDueDatePreview = useMemo(
    () => format(addDays(new Date(), MAX_LOAN_PERIOD_DAYS), "PPP"),
    []
  );

  // Fetch loan requests (admin only)
  const { data: loanRequests, isLoading } = useQuery<{ requests: LoanRequest[]; total: number }>({
    queryKey: ["/api/loan-requests", { page: currentPage, search: searchTerm, status: statusFilter !== "all" ? statusFilter : undefined }],
    enabled: isAdminOrPetugas,
  });

  // Fetch loan statistics (for both admin and regular users)
  const { data: stats } = useQuery<LoanStats>({
    queryKey: ["/api/loan-requests/stats"],
  });

  // Approve loan request mutation
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("PATCH", `/api/loan-requests/${requestId}/approve`);
      if (!response.ok) throw new Error("Failed to approve request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-requests/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      showNotification({
        title: "Request Approved!",
        description: "The loan request has been approved successfully",
        type: "success",
        duration: 3000
      });
      setActionDialogOpen(false);
      setSelectedRequest(null);
    }
  });

  // Reject loan request mutation
  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("PATCH", `/api/loan-requests/${requestId}/reject`);
      if (!response.ok) throw new Error("Failed to reject request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-requests/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      showNotification({
        title: "Request Rejected",
        description: "The loan request has been rejected",
        type: "info",
        duration: 3000
      });
      setActionDialogOpen(false);
      setSelectedRequest(null);
    }
  });

  // Mark as returned mutation
  const returnMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("PATCH", `/api/loan-requests/${requestId}/return`);
      if (!response.ok) throw new Error("Failed to mark as returned");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-requests/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      showNotification({
        title: "Book Returned!",
        description: "The book has been marked as returned successfully",
        type: "success",
        duration: 3000
      });
      setActionDialogOpen(false);
      setSelectedRequest(null);
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const, className: "bg-orange-100 text-orange-800" },
      approved: { label: "Approved", variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      on_loan: { label: "On Loan", variant: "secondary" as const, className: "bg-purple-100 text-purple-800" },
      rejected: { label: "Rejected", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
      returned: { label: "Returned", variant: "secondary" as const, className: "bg-green-100 text-green-800" },
      overdue: { label: "Overdue", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleAction = (request: LoanRequest, action: 'approve' | 'reject' | 'return') => {
    setSelectedRequest(request);
    setActionDialogOpen(true);
  };

  const confirmAction = (action: 'approve' | 'reject' | 'return') => {
    if (!selectedRequest) return;
    
    switch (action) {
      case 'approve':
        approveMutation.mutate(selectedRequest.id.toString());
        break;
      case 'reject':
        rejectMutation.mutate(selectedRequest.id.toString());
        break;
      case 'return':
        returnMutation.mutate(selectedRequest.id.toString());
        break;
    }
  };

  const loanRequestButton = (
    <Button 
      onClick={() => setLocation('/loan-request')}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <Plus className="w-4 h-4 mr-2" />
      New Loan Request
    </Button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <NotificationComponent />
      
      {isAdminOrPetugas ? (
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Loan Management</h1>
            {loanRequestButton}
          </div>
        </div>
      ) : (
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-end">
            {loanRequestButton}
          </div>
        </div>
      )}
      
      <div className="p-6">
        {/* Statistics Cards */}
        {isAdminOrPetugas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats?.pending || 0}</div>
                <p className="text-xs text-slate-500">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Active Loans</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.active || 0}</div>
                <p className="text-xs text-slate-500">Currently borrowed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
                <p className="text-xs text-slate-500">Successfully returned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Overdue</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</div>
                <p className="text-xs text-slate-500">Past due date</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Management Section */}
        {isAdminOrPetugas && (
          <>
            {/* Search and Filter */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by borrower name, NIK, or book title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loan Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Requests</CardTitle>
                <CardDescription>
                  Manage all book loan requests from library users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 border-amber-200 bg-amber-50">
                  <AlertDescription className="text-amber-800">
                    Approving a request will automatically lock the due date to {MAX_LOAN_PERIOD_DAYS} days after approval.
                  </AlertDescription>
                </Alert>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-slate-500">Loading loan requests...</div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Book</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loanRequests?.requests.map((request) => (
                        <TableRow key={request.request_id}>
                          <TableCell className="font-mono text-sm">{request.request_id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.borrower_name}</div>
                              <div className="text-sm text-slate-500">{request.employee_nik}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.book_title || 'Book ID: ' + request.id_buku}</div>
                              <div className="text-sm text-slate-500">{request.book_author}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{formatDateSafe(request.requested_return_date, 'MMM dd, yyyy')}</div>
                              <div className="text-sm text-slate-500">Submitted: {format(new Date(request.created_at), 'MMM dd')}</div>
                              {request.due_date && (
                                <div className="text-xs text-amber-700 mt-1">Due date: {formatDateSafe(request.due_date, 'MMM dd, yyyy')} (auto-set)</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() => handleAction(request, 'approve')}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => handleAction(request, 'reject')}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {request.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                  onClick={() => handleAction(request, 'return')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Mark Returned
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setViewDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* User View - Show How it Works */}
        {!isAdminOrPetugas && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">How Book Lending Works</CardTitle>
              <CardDescription>Simple steps to borrow books from our digital library</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6 border-amber-200 bg-amber-50">
                <AlertDescription className="text-amber-800">
                  The maximum loan period is {MAX_LOAN_PERIOD_DAYS} days from approval. The system will automatically set and lock your due date when the request is approved.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Submit Request</h3>
                  <p className="text-sm text-slate-600">Fill out the loan request form with your employee NIK and select the book you want to borrow</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Admin Approval</h3>
                  <p className="text-sm text-slate-600">Your request will be reviewed by the library administrator for approval</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Collect & Return</h3>
                  <p className="text-sm text-slate-600">Once approved, collect your book and return it within {MAX_LOAN_PERIOD_DAYS} days. The due date is automatically locked when your request is approved.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Confirmation Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                {selectedRequest && (
                  <>
                    Are you sure you want to take this action on request {selectedRequest.request_id}?
                    <div className="mt-2 p-3 bg-slate-50 rounded">
                      <div><strong>Borrower:</strong> {selectedRequest.borrower_name}</div>
                      <div><strong>Book ID:</strong> {selectedRequest.id_buku}</div>
                      <div><strong>Current Status:</strong> {getStatusBadge(selectedRequest.status)}</div>
                    </div>
                    {selectedRequest.status === 'pending' && (
                      <p className="mt-3 text-sm text-amber-700">
                        Approving right now will automatically set the due date to {autoDueDatePreview} (maximum of {MAX_LOAN_PERIOD_DAYS} days from approval).
                      </p>
                    )}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                Cancel
              </Button>
              {selectedRequest?.status === 'pending' && (
                <>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => confirmAction('approve')}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => confirmAction('reject')}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                </>
              )}
              {selectedRequest?.status === 'approved' && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => confirmAction('return')}
                  disabled={returnMutation.isPending}
                >
                  {returnMutation.isPending ? "Processing..." : "Mark as Returned"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Loan Request Details</DialogTitle>
              <DialogDescription>
                Detailed information about the loan request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="grid gap-4">
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertDescription className="text-amber-800">
                    Maximum loan period is {MAX_LOAN_PERIOD_DAYS} days from approval. {selectedRequest.due_date ? `This request's due date is ${formatDateSafe(selectedRequest.due_date)}.` : 'The due date will be assigned automatically when the request is approved.'}
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Request ID</label>
                    <p className="font-mono text-sm mt-1">{selectedRequest.request_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Borrower Name</label>
                    <p className="mt-1">{selectedRequest.borrower_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Employee NIK</label>
                    <p className="mt-1 font-mono text-sm">{selectedRequest.employee_nik}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <p className="mt-1">{selectedRequest.borrower_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                    <p className="mt-1">{selectedRequest.borrower_phone}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Book Information</label>
                  <div className="mt-1 p-3 bg-slate-50 rounded">
                    <p className="font-medium">{selectedRequest.book_title || `Book ID: ${selectedRequest.id_buku}`}</p>
                    {selectedRequest.book_isbn && (
                      <p className="text-sm text-slate-600">ISBN: {selectedRequest.book_isbn}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Request Date</label>
                    <p className="mt-1">{formatDateSafe(selectedRequest.request_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Requested Return Date</label>
                    <p className="mt-1">{formatDateSafe(selectedRequest.requested_return_date)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Due Date</label>
                    <p className="mt-1">
                      {selectedRequest.due_date
                        ? formatDateSafe(selectedRequest.due_date)
                        : `Will be set at approval (${MAX_LOAN_PERIOD_DAYS}-day limit)`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Loan Date</label>
                    <p className="mt-1">{formatDateSafe(selectedRequest.loan_date)}</p>
                  </div>
                </div>

                {selectedRequest.reason && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Reason</label>
                    <p className="mt-1 p-3 bg-slate-50 rounded">{selectedRequest.reason}</p>
                  </div>
                )}

                {selectedRequest.approval_date && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Approval Information</label>
                    <div className="mt-1 p-3 bg-green-50 rounded">
                      <p><strong>Approved on:</strong> {formatDateSafe(selectedRequest.approval_date)}</p>
                      {selectedRequest.approver_name && (
                        <p><strong>Approved by:</strong> {selectedRequest.approver_name}</p>
                      )}
                      {selectedRequest.approval_notes && (
                        <p><strong>Notes:</strong> {selectedRequest.approval_notes}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedRequest.return_date && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Return Information</label>
                    <div className="mt-1 p-3 bg-blue-50 rounded">
                      <p><strong>Returned on:</strong> {formatDateSafe(selectedRequest.return_date)}</p>
                      {selectedRequest.return_notes && (
                        <p><strong>Notes:</strong> {selectedRequest.return_notes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
