import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Eye, Edit, Trash2, Filter, X } from "lucide-react";
import { BukuWithDetails, Kategori, Rak } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/context/UserContext";

interface BooksResponse {
  books: BukuWithDetails[];
  total: number;
}

export default function BooksPage() {
  const user = useUser();
  const isAdminOrPetugas = user?.level === "admin" || user?.level === "petugas";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [rakId, setRakId] = useState<number | undefined>();
  const [selectedBook, setSelectedBook] = useState<BukuWithDetails | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<BukuWithDetails | null>(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    pengarang: "",
    penerbit: "",
    thn_buku: "",
    isbn: "",
    id_kategori: "",
    id_rak: "",
    tersedia: 1 as number
  });

  // Add form state
  const [addForm, setAddForm] = useState({
    title: "",
    pengarang: "",
    penerbit: "",
    thn_buku: "",
    isbn: "",
    id_kategori: undefined as string | undefined,
    id_rak: undefined as string | undefined,
    tersedia: 1 as number
  });

  // Lampiran file state
  const [lampiranFile, setLampiranFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when limit changes
  useEffect(() => {
    setPage(1);
  }, [limit]);

  // Reset page when limit changes
  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data: booksData, isLoading: booksLoading } = useQuery<BooksResponse>({
    queryKey: ["/api/books", { page, limit, search, categoryId, rakId }],
  });

  const { data: categories } = useQuery<Kategori[]>({
    queryKey: ["/api/categories"],
  });

  const { data: shelves } = useQuery<Rak[]>({
    queryKey: ["/api/shelves"],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (bookId: number) => {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete book");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/books/${data.id}`, data.updates);
      if (!response.ok) {
        throw new Error("Failed to update book");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Book updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedBook(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update book",
        variant: "destructive",
      });
    },
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/books", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to create book");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Book added successfully",
      });
      setAddDialogOpen(false);
      setAddForm({
        title: "",
        pengarang: "",
        penerbit: "",
        thn_buku: "",
        isbn: "",
        id_kategori: "0",
        id_rak: "0",
        tersedia: 1
      });
      setLampiranFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add book",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value === "all" ? undefined : parseInt(value));
    setPage(1);
  };

  const handleShelfChange = (value: string) => {
    setRakId(value === "all" ? undefined : parseInt(value));
    setPage(1);
  };

  const openPDFViewer = (book: BukuWithDetails) => {
    // Remove "/pdfs/" prefix if present
    const pdfFileName = book.lampiran?.replace(/^\/?pdfs\//, "");
    setSelectedBook({ ...book, lampiran: pdfFileName });
    setPdfViewerOpen(true);
  };

  const openBookDetails = (book: BukuWithDetails) => {
    setSelectedBook(book);
    setDetailsDialogOpen(true);
  };

  const handleEditBook = (book: BukuWithDetails) => {
    setSelectedBook(book);
    setEditForm({
      title: book.title || "",
      pengarang: book.pengarang || "",
      penerbit: book.penerbit || "",
      thn_buku: book.thn_buku?.toString() || "",
      isbn: book.isbn || "",
      id_kategori: book.id_kategori ? book.id_kategori.toString() : "",
      id_rak: book.id_rak ? book.id_rak.toString() : "",
      tersedia: (book.tersedia ?? 1) as number
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (field: string, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = () => {
    if (!selectedBook) return;
    
    const updates = {
      title: editForm.title,
      pengarang: editForm.pengarang,
      penerbit: editForm.penerbit,
      thn_buku: editForm.thn_buku ? parseInt(editForm.thn_buku) : null,
      isbn: editForm.isbn,
      id_kategori: editForm.id_kategori && editForm.id_kategori !== "0" ? parseInt(editForm.id_kategori) : null,
      id_rak: editForm.id_rak && editForm.id_rak !== "0" ? parseInt(editForm.id_rak) : null,
      tersedia: editForm.tersedia
    };

    editMutation.mutate({ id: selectedBook.id_buku, updates });
  };

  const handleAddFormChange = (field: string, value: string | number | undefined) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value === "" || value === "0" ? undefined : value
    }));
  };

  const handleSaveAdd = () => {
    if (!addForm.title) return;
    const formData = new FormData();
    formData.append("title", addForm.title);
    formData.append("pengarang", addForm.pengarang);
    formData.append("penerbit", addForm.penerbit);
    formData.append("thn_buku", addForm.thn_buku || "");
    formData.append("isbn", addForm.isbn);
    formData.append("id_kategori", addForm.id_kategori || "");
    formData.append("id_rak", addForm.id_rak || "");
    formData.append("tersedia", addForm.tersedia.toString());
    if (lampiranFile) formData.append("lampiran", lampiranFile);

    addMutation.mutate(formData);
  };

  const handleDeleteBook = (book: BukuWithDetails) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      deleteMutation.mutate(bookToDelete.id_buku);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId(undefined);
    setRakId(undefined);
    setPage(1);
  };

  const totalPages = Math.ceil((booksData?.total || 0) / limit);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Books Management</h1>
          {isAdminOrPetugas && (
            <Button 
              onClick={() => setAddDialogOpen(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Book
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-16 z-30">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search books by title, author, publisher, or ISBN..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 w-4 h-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <Select onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id_kategori} value={category.id_kategori.toString()}>
                  {category.nama_kategori}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={handleShelfChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Shelves" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shelves</SelectItem>
              {shelves?.map((shelf) => (
                <SelectItem key={shelf.id_rak} value={shelf.id_rak.toString()}>
                  {shelf.nama_rak}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search || categoryId || rakId) && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Clear Filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Books Table */}
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Publisher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {booksLoading ? (
                    [...Array(limit)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Skeleton className="h-14 w-10 rounded" />
                            <div className="ml-4 space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-8 w-8" /></td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    booksData?.books.map((book) => (
                      <tr key={book.id_buku} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={book.sampul || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=140"}
                              alt="Book cover"
                              className="h-14 w-10 object-cover rounded flex-shrink-0"
                            />
                            <div className="ml-4 min-w-0 flex-1">
                              <button
                                onClick={() => openPDFViewer(book)}
                                className="text-sm font-medium text-primary hover:text-blue-800 text-left block w-full"
                              >
                                <span className="line-clamp-2 break-words">
                                  {book.title || "Untitled"}
                                </span>
                              </button>
                              <p className="text-sm text-slate-500 truncate">
                                ISBN: {book.isbn || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          <div className="max-w-[150px] break-words line-clamp-2">
                            {book.pengarang || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          <div className="max-w-[150px] break-words line-clamp-2">
                            {book.penerbit || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          <div className="max-w-[120px] break-words">
                            {book.kategori_nama || "Uncategorized"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {book.thn_buku || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={book.tersedia === 1 ? "default" : "secondary"}
                            className={
                              book.tersedia === 1
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {book.tersedia === 1 ? "Available" : "On Loan"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openBookDetails(book)}
                            className="text-primary hover:text-blue-800"
                            title="View Details"
                          >
                            Details
                          </Button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {isAdminOrPetugas && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openPDFViewer(book)}
                                  className="text-primary hover:text-blue-800"
                                  title="View PDF"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditBook(book)}
                                  className="text-slate-600 hover:text-slate-800"
                                  title="Edit Book"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteBook(book)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete Book"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-700">Showing</span>
                <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-slate-700">
                  of {booksData?.total || 0} results
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF Viewer */}
      <PDFViewer
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        pdfPath={selectedBook?.lampiran || undefined}
        title={selectedBook?.title || "Book PDF"}
      />

      {/* Book Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected book.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            {selectedBook && (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={selectedBook.sampul || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=200"}
                    alt="Book cover"
                    className="h-32 w-24 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 break-words">
                      {selectedBook.title || "Untitled"}
                    </h3>
                    <p className="text-sm text-slate-600 break-words">
                      by {selectedBook.pengarang || "Unknown Author"}
                    </p>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={selectedBook.tersedia === 1 ? "default" : "secondary"}
                        className={
                          selectedBook.tersedia === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {selectedBook.tersedia === 1 ? "Available" : "On Loan"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Publisher</label>
                    <p className="text-sm text-slate-900 p-2 bg-slate-50 rounded border break-words">
                      {selectedBook.penerbit || "Unknown"}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                    <p className="text-sm text-slate-900 p-2 bg-slate-50 rounded border">
                      {selectedBook.thn_buku || "N/A"}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ISBN</label>
                    <p className="text-sm text-slate-900 p-2 bg-slate-50 rounded border break-all">
                      {selectedBook.isbn || "N/A"}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <p className="text-sm text-slate-900 p-2 bg-slate-50 rounded border">
                      {selectedBook.kategori_nama || "Uncategorized"}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Shelf</label>
                    <p className="text-sm text-slate-900 p-2 bg-slate-50 rounded border">
                      {selectedBook.rak_nama || "Not assigned"}
                    </p>
                  </div>
                </div>

                {selectedBook.lampiran && (
                  <div className="border-t pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">PDF Available</h4>
                        <p className="text-sm text-blue-600">Click to view the digital copy of this book</p>
                      </div>
                      <Button
                        onClick={() => {
                          setDetailsDialogOpen(false);
                          openPDFViewer(selectedBook);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View PDF
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>
              Edit the selected book information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            {selectedBook && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => handleEditFormChange("title", e.target.value)}
                    placeholder="Enter book title"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Author</label>
                  <Input
                    value={editForm.pengarang}
                    onChange={(e) => handleEditFormChange("pengarang", e.target.value)}
                    placeholder="Enter author name"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Publisher</label>
                  <Input
                    value={editForm.penerbit}
                    onChange={(e) => handleEditFormChange("penerbit", e.target.value)}
                    placeholder="Enter publisher"
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                    <Input
                      type="number"
                      value={editForm.thn_buku}
                      onChange={(e) => handleEditFormChange("thn_buku", e.target.value)}
                      placeholder="Enter publication year"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ISBN</label>
                    <Input
                      value={editForm.isbn}
                      onChange={(e) => handleEditFormChange("isbn", e.target.value)}
                      placeholder="Enter ISBN"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <Select 
                      value={editForm.id_kategori || ""} 
                      onValueChange={(value) => handleEditFormChange("id_kategori", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Category</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id_kategori} value={category.id_kategori.toString()}>
                            {category.nama_kategori}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Shelf</label>
                    <Select 
                      value={editForm.id_rak || ""} 
                      onValueChange={(value) => handleEditFormChange("id_rak", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select shelf" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Shelf</SelectItem>
                        {shelves?.map((shelf) => (
                          <SelectItem key={shelf.id_rak} value={shelf.id_rak.toString()}>
                            {shelf.nama_rak}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Availability Status</label>
                  <Select 
                    value={editForm.tersedia?.toString() || "1"} 
                    onValueChange={(value) => handleEditFormChange("tersedia", parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Available</SelectItem>
                      <SelectItem value="0">On Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={editMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={editMutation.isPending || !editForm.title}
              className="bg-primary hover:bg-blue-700"
            >
              {editMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the book
              <strong> "{bookToDelete?.title}"</strong> from the library system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add New Book Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>
              Add a new book to the library system. Fill in the book information below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <Input
                  value={addForm.title}
                  onChange={(e) => handleAddFormChange("title", e.target.value)}
                  placeholder="Enter book title"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Author</label>
                <Input
                  value={addForm.pengarang}
                  onChange={(e) => handleAddFormChange("pengarang", e.target.value)}
                  placeholder="Enter author name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Publisher</label>
                <Input
                  value={addForm.penerbit}
                  onChange={(e) => handleAddFormChange("penerbit", e.target.value)}
                  placeholder="Enter publisher"
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <Input
                    type="number"
                    value={addForm.thn_buku}
                    onChange={(e) => handleAddFormChange("thn_buku", e.target.value)}
                    placeholder="Enter publication year"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ISBN</label>
                  <Input
                    value={addForm.isbn}
                    onChange={(e) => handleAddFormChange("isbn", e.target.value)}
                    placeholder="Enter ISBN"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <Select 
                    value={addForm.id_kategori ?? "none"}
                    onValueChange={(value) => handleAddFormChange("id_kategori", value === "none" ? undefined : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id_kategori} value={category.id_kategori.toString()}>
                          {category.nama_kategori}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Shelf</label>
                  <Select 
                    value={addForm.id_rak ?? "none"}
                    onValueChange={(value) => handleAddFormChange("id_rak", value === "none" ? undefined : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select shelf" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Shelf</SelectItem>
                      {shelves?.map((shelf) => (
                        <SelectItem key={shelf.id_rak} value={shelf.id_rak.toString()}>
                          {shelf.nama_rak}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Availability Status</label>
                <Select 
                  value={addForm.tersedia?.toString() || "1"} 
                  onValueChange={(value) => handleAddFormChange("tersedia", parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Available</SelectItem>
                    <SelectItem value="0">On Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Attachment (PDF/Image)</label>
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={e => setLampiranFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAddDialogOpen(false)}
              disabled={addMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAdd}
              disabled={addMutation.isPending || !addForm.title}
              className="bg-primary hover:bg-blue-700"
            >
              {addMutation.isPending ? "Adding..." : "Add Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}