import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addDays, format } from 'date-fns';
import { CalendarIcon, BookOpen, User, Mail, Phone, Building, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCenteredNotification } from '@/components/ui/centered-notification';

interface Employee {
  id: number;
  nik: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
}

interface Book {
  id_buku: number;
  title: string;
  pengarang: string;
  penerbit: string;
  isbn: string;
  tersedia: number;
}

const BOOK_SUGGESTION_LIMIT = 20;
const MAX_LOAN_PERIOD_DAYS = 14;

interface LoanRequestForm {
  id_buku: number;
  employee_nik: string;
  borrower_name: string;
  borrower_email: string;
  borrower_phone: string;
  requested_return_date: Date | undefined;
  reason: string;
}

export default function LoanRequestPage() {
  const [, setLocation] = useLocation();
  const { showNotification, NotificationComponent } = useCenteredNotification();
  const [books, setBooks] = useState<Book[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [booksTotal, setBooksTotal] = useState(0);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchBook, setSearchBook] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [form, setForm] = useState<LoanRequestForm>({
    id_buku: 0,
    employee_nik: '',
    borrower_name: '',
    borrower_email: '',
    borrower_phone: '',
    requested_return_date: undefined,
    reason: ''
  });

  const startOfToday = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const maxSelectableReturnDate = useMemo(
    () => addDays(startOfToday, MAX_LOAN_PERIOD_DAYS),
    [startOfToday]
  );

  // Debounce search term to avoid spamming the API
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchBook.trim());
    }, 300);

    return () => clearTimeout(handle);
  }, [searchBook]);

  // Fetch available books
  useEffect(() => {
    const controller = new AbortController();

    const fetchBooks = async () => {
      try {
        setLoadingBooks(true);
  const params = new URLSearchParams({ available: 'true', limit: BOOK_SUGGESTION_LIMIT.toString() });
        if (debouncedSearch) {
          params.set('search', debouncedSearch);
        }

        const response = await fetch(`/api/books?${params.toString()}`, {
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          setBooks(data.books || []);
          setBooksTotal(data.total ?? (data.books ? data.books.length : 0));
        }
      } catch (err) {
        if ((err as any)?.name !== 'AbortError') {
          console.error('Error fetching books:', err);
        }
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();

    return () => {
      controller.abort();
    };
  }, [debouncedSearch]);

  // Fetch employees/staff
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Try staff endpoint first (newer implementation)
        let response = await fetch('/api/staff');
        if (response.ok) {
          const data = await response.json();
          const staffList = data.staff || data;
          // Convert staff data to employee format
          const employeeData = staffList.map((staff: any) => ({
            id: staff.id_staff || staff.id,
            nik: staff.nik,
            name: staff.staff_name || staff.name,
            email: staff.email,
            phone: staff.phone,
            department: staff.department,
            position: staff.position || staff.job_title
          }));
          setEmployees(employeeData);
          return;
        }
        
        // Fallback to employees endpoint
        response = await fetch('/api/employees');
        if (response.ok) {
          const data = await response.json();
          setEmployees(data);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };

    fetchEmployees();
  }, []);

  // Handle NIK input - auto-fill employee data with enhanced search
  const handleNikChange = async (nik: string) => {
    setForm(prev => ({ ...prev, employee_nik: nik }));
    
    if (nik.length >= 3) {
      // First, try exact match from cached employees
      let employee = employees.find(emp => emp.nik === nik);
      
      // If no exact match, try partial match
      if (!employee && nik.length >= 4) {
        employee = employees.find(emp => emp.nik.includes(nik));
      }
      
      if (employee) {
        setSelectedEmployee(employee);
        setForm(prev => ({
          ...prev,
          borrower_name: employee.name,
          borrower_email: employee.email || '',
          borrower_phone: employee.phone || ''
        }));
        setError(''); // Clear any previous errors
      } else {
        setSelectedEmployee(null);
        // If no match found, try to fetch from server with employee endpoint (public)
        if (nik.length >= 6) {
          try {
            // Use the public employee search endpoint which also searches staff table
            const response = await fetch(`/api/employees/${nik}`);
            
            if (response.ok) {
              const employeeData = await response.json();
              
              setSelectedEmployee(employeeData);
              setForm(prev => ({
                ...prev,
                borrower_name: employeeData.name,
                borrower_email: employeeData.email || '',
                borrower_phone: employeeData.phone || ''
              }));
              setError('');
            } else {
              // Keep the NIK but clear other fields if no match
              setForm(prev => ({
                ...prev,
                borrower_name: '',
                borrower_email: '',
                borrower_phone: ''
              }));
            }
          } catch (err) {
            console.error('Error fetching employee by NIK:', err);
            setForm(prev => ({
              ...prev,
              borrower_name: '',
              borrower_email: '',
              borrower_phone: ''
            }));
          }
        } else {
          // Clear other fields if NIK is too short
          setForm(prev => ({
            ...prev,
            borrower_name: '',
            borrower_email: '',
            borrower_phone: ''
          }));
        }
      }
    } else {
      setSelectedEmployee(null);
      setForm(prev => ({
        ...prev,
        borrower_name: '',
        borrower_email: '',
        borrower_phone: ''
      }));
    }
  };

  // Handle book selection
  const handleBookSelect = (bookId: string) => {
    const book = books.find(b => b.id_buku === parseInt(bookId));
    if (book) {
      setSelectedBook(book);
      setForm(prev => ({ ...prev, id_buku: book.id_buku }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!form.id_buku || !form.employee_nik || !form.borrower_name) {
        throw new Error('Please fill in all required fields');
      }

      if (!form.requested_return_date) {
        throw new Error('Please select a requested return date');
      }

      if (form.requested_return_date > maxSelectableReturnDate) {
        throw new Error(`Requested return date must be within ${MAX_LOAN_PERIOD_DAYS} days from today`);
      }

      // Submit loan request
      const response = await fetch('/api/loan-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          requested_return_date: format(form.requested_return_date, 'yyyy-MM-dd')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit loan request');
      }

      const result = await response.json();
      
      // Show centered success notification
      showNotification({
        title: "Loan Request Submitted!",
        description: `Your loan request has been submitted successfully. Request ID: ${result.request_id}. Reminder: the maximum loan period is ${MAX_LOAN_PERIOD_DAYS} days from approval.`,
        type: "success",
        duration: 5000
      });
      
      // Reset form
      setForm({
        id_buku: 0,
        employee_nik: '',
        borrower_name: '',
        borrower_email: '',
        borrower_phone: '',
        requested_return_date: undefined,
        reason: ''
      });
      setSelectedBook(null);
      setSelectedEmployee(null);

      // Redirect to loan status page after 3 seconds
      setTimeout(() => {
        setLocation('/loans');
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books;

  // Reset selected book if it's no longer in filtered results
  useEffect(() => {
    if (selectedBook && !filteredBooks.some(book => book.id_buku === selectedBook.id_buku)) {
      setSelectedBook(null);
      setForm(prev => ({ ...prev, id_buku: 0 }));
    }
  }, [filteredBooks, selectedBook]);

  useEffect(() => {
    if (form.requested_return_date && form.requested_return_date > maxSelectableReturnDate) {
      setForm(prev => ({ ...prev, requested_return_date: maxSelectableReturnDate }));
    }
  }, [form.requested_return_date, maxSelectableReturnDate]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Request Book Loan</h1>
        <p className="text-gray-600 mt-2">Fill out the form below to request a book loan</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <NotificationComponent />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Book Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Select Book
            </CardTitle>
            <CardDescription>
              Choose the book you want to borrow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="book-search">Search Books</Label>
              <Input
                id="book-search"
                placeholder="Search by title, author, publisher, or ISBN..."
                value={searchBook}
                onChange={(e) => setSearchBook(e.target.value)}
                className="mb-2"
              />
              <div className="flex items-center justify-between text-sm text-gray-600 min-h-[1.25rem]">
                {loadingBooks ? (
                  <span>Searching books...</span>
                ) : (
                  <span>
                    {filteredBooks.length} match(es)
                    {booksTotal > filteredBooks.length && ` of ${booksTotal} total`}
                  </span>
                )}
                {!loadingBooks && booksTotal > BOOK_SUGGESTION_LIMIT && (
                  <span className="text-xs text-gray-500">
                    Showing top {BOOK_SUGGESTION_LIMIT}. Refine your search for more precise matches.
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="book-select">Available Books *</Label>
              <Select value={selectedBook?.id_buku.toString()} onValueChange={handleBookSelect} required>
                <SelectTrigger className="min-h-[3.5rem] items-start py-3 text-left [&>span]:line-clamp-2 [&>span]:whitespace-normal">
                  <SelectValue placeholder={
                    loadingBooks
                      ? 'Loading books...'
                      : filteredBooks.length === 0
                        ? (searchBook ? 'No books match your search' : 'No books currently available')
                        : `Select a book (showing up to ${BOOK_SUGGESTION_LIMIT})`
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredBooks.map((book) => (
                    <SelectItem
                      key={book.id_buku}
                      value={book.id_buku.toString()}
                      className="whitespace-normal leading-snug py-2"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{book.title}</span>
                        <span className="text-sm text-gray-500">
                          by {book.pengarang} • ISBN: {book.isbn}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBook && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900">{selectedBook.title}</h4>
                <p className="text-blue-700">
                  Author: {selectedBook.pengarang} • Publisher: {selectedBook.penerbit}
                </p>
                <p className="text-blue-600 text-sm">ISBN: {selectedBook.isbn}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Borrower Information
            </CardTitle>
            <CardDescription>
              Enter your employee NIK to auto-fill your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nik">Employee NIK *</Label>
              <Input
                id="nik"
                placeholder="Enter your employee NIK (e.g., 20000748)"
                value={form.employee_nik}
                onChange={(e) => handleNikChange(e.target.value)}
                required
                className={selectedEmployee ? "border-green-500" : ""}
              />
              {selectedEmployee && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Employee found: {selectedEmployee.name}
                  </p>
                  <p className="text-xs text-green-600">
                    Department: {selectedEmployee.department} • Position: {selectedEmployee.position || 'Staff'}
                  </p>
                </div>
              )}
              {form.employee_nik.length >= 3 && !selectedEmployee && (
                <p className="text-sm text-amber-600 mt-1">
                  🔍 Searching for employee... Try entering more digits if not found.
                </p>
              )}
              {form.employee_nik.length < 3 && form.employee_nik.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Enter at least 3 digits to search for employee
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={form.borrower_name}
                onChange={(e) => setForm(prev => ({ ...prev, borrower_name: e.target.value }))}
                required
                disabled={!!selectedEmployee}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@company.com"
                    className="pl-10"
                    value={form.borrower_email}
                    onChange={(e) => setForm(prev => ({ ...prev, borrower_email: e.target.value }))}
                    disabled={!!selectedEmployee}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="081234567890"
                    className="pl-10"
                    value={form.borrower_phone}
                    onChange={(e) => setForm(prev => ({ ...prev, borrower_phone: e.target.value }))}
                    disabled={!!selectedEmployee}
                  />
                </div>
              </div>
            </div>

            {selectedEmployee && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Department: {selectedEmployee.department}</span>
                </div>
                <p className="text-green-700 text-sm">Position: {selectedEmployee.position}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Loan Details
            </CardTitle>
            <CardDescription>
              Specify your loan requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                Loan approvals are limited to {MAX_LOAN_PERIOD_DAYS} days. Once approved, the system automatically locks the due date to {MAX_LOAN_PERIOD_DAYS} days after approval.
              </AlertDescription>
            </Alert>
            <div>
              <Label>Requested Return Date *</Label>
              <p className="text-sm text-gray-500 mt-1">
                Choose any date within the next {MAX_LOAN_PERIOD_DAYS} days. The final due date will be fixed to {MAX_LOAN_PERIOD_DAYS} days after approval.
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.requested_return_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.requested_return_date ? (
                      format(form.requested_return_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.requested_return_date}
                    onSelect={(date) => setForm(prev => ({ ...prev, requested_return_date: date }))}
                    disabled={(date) => date < startOfToday || date > maxSelectableReturnDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Borrowing (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Please describe why you need this book (research, study, etc.)"
                value={form.reason}
                onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !form.id_buku || !form.employee_nik || !form.borrower_name}
            className="flex-1"
          >
            {loading ? 'Submitting...' : 'Submit Loan Request'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation('/books')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}