import React, { useState, useEffect } from 'react';
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
import { format } from 'date-fns';
import { CalendarIcon, BookOpen, User, Mail, Phone, Building, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [books, setBooks] = useState<Book[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchBook, setSearchBook] = useState('');
  const [form, setForm] = useState<LoanRequestForm>({
    id_buku: 0,
    employee_nik: '',
    borrower_name: '',
    borrower_email: '',
    borrower_phone: '',
    requested_return_date: undefined,
    reason: ''
  });

  // Fetch available books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books?available=true');
        if (response.ok) {
          const data = await response.json();
          setBooks(data.books.filter((book: Book) => book.tersedia > 0));
        }
      } catch (err) {
        console.error('Error fetching books:', err);
      }
    };

    fetchBooks();
  }, []);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
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

  // Handle NIK input - auto-fill employee data
  const handleNikChange = async (nik: string) => {
    setForm(prev => ({ ...prev, employee_nik: nik }));
    
    if (nik.length >= 3) {
      const employee = employees.find(emp => emp.nik === nik);
      if (employee) {
        setSelectedEmployee(employee);
        setForm(prev => ({
          ...prev,
          borrower_name: employee.name,
          borrower_email: employee.email || '',
          borrower_phone: employee.phone || ''
        }));
      } else {
        setSelectedEmployee(null);
        // Keep the NIK but clear other fields if no match
        setForm(prev => ({
          ...prev,
          borrower_name: '',
          borrower_email: '',
          borrower_phone: ''
        }));
      }
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
    setSuccess('');

    try {
      // Validation
      if (!form.id_buku || !form.employee_nik || !form.borrower_name) {
        throw new Error('Please fill in all required fields');
      }

      if (!form.requested_return_date) {
        throw new Error('Please select a requested return date');
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
      setSuccess(`Loan request submitted successfully! Request ID: ${result.request_id}`);
      
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

      // Redirect to loan status page after 2 seconds
      setTimeout(() => {
        setLocation('/loans');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter books based on search
  const filteredBooks = books.filter(book => {
    const searchLower = searchBook.toLowerCase();
    return (
      (book.title && book.title.toLowerCase().includes(searchLower)) ||
      (book.pengarang && book.pengarang.toLowerCase().includes(searchLower)) ||
      (book.penerbit && book.penerbit.toLowerCase().includes(searchLower)) ||
      (book.isbn && book.isbn.includes(searchBook))
    );
  });

  // Reset selected book if it's no longer in filtered results
  useEffect(() => {
    if (selectedBook && !filteredBooks.some(book => book.id_buku === selectedBook.id_buku)) {
      setSelectedBook(null);
      setForm(prev => ({ ...prev, id_buku: 0 }));
    }
  }, [searchBook, filteredBooks, selectedBook]);

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

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

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
              {searchBook && (
                <p className="text-sm text-gray-600">
                  {filteredBooks.length} book(s) found
                  {filteredBooks.length === 0 && " - try different keywords"}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="book-select">Available Books *</Label>
              <Select onValueChange={handleBookSelect} required>
                <SelectTrigger>
                  <SelectValue placeholder={
                    filteredBooks.length === 0 && searchBook 
                      ? "No books match your search" 
                      : `Select a book (${filteredBooks.length} available)`
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredBooks.map((book) => (
                    <SelectItem key={book.id_buku} value={book.id_buku.toString()}>
                      <div className="flex flex-col">
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
                placeholder="Enter your employee NIK"
                value={form.employee_nik}
                onChange={(e) => handleNikChange(e.target.value)}
                required
              />
              {selectedEmployee && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Employee found: {selectedEmployee.name} ({selectedEmployee.department})
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
            <div>
              <Label>Requested Return Date *</Label>
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
                    disabled={(date) => date < new Date()}
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