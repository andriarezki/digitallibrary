import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Upload, FileSpreadsheet, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCenteredNotification } from "@/components/ui/centered-notification";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/context/UserContext";

interface Staff {
  id_staff: number;
  staff_name: string;
  initial_name?: string;
  nik: string;
  section_name?: string;
  department_name?: string;
  dept_name?: string;
  no_hp?: string;
  email?: string;
  status: number;
  position?: string;
  photo?: string;
  created_at: string;
  updated_at: string;
}

interface StaffResponse {
  staff: Staff[];
  total: number;
}

export default function StaffPage() {
  const { toast } = useToast();
  const { showNotification, NotificationComponent } = useCenteredNotification();
  const queryClient = useQueryClient();
  const user = useUser();
  const isAdminOrPetugas = user?.level === "admin" || user?.level === "petugas";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);

  const [addForm, setAddForm] = useState({
    staff_name: "",
    initial_name: "",
    nik: "",
    section_name: "",
    department_name: "",
    dept_name: "",
    no_hp: "",
    email: "",
    status: 1,
    position: "",
    photo: "",
  });

  const [editForm, setEditForm] = useState({
    staff_name: "",
    initial_name: "",
    nik: "",
    section_name: "",
    department_name: "",
    dept_name: "",
    no_hp: "",
    email: "",
    status: 1,
    position: "",
    photo: "",
  });

  // Fetch staff
  const { data: staffData, isLoading } = useQuery<StaffResponse>({
    queryKey: ["/api/staff", { page, limit: 25, search }],
  });

  // Add staff mutation
  const addMutation = useMutation({
    mutationFn: async (staffData: any) => {
      const response = await apiRequest("POST", "/api/staff", staffData);
      if (!response.ok) throw new Error("Failed to add staff");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      showNotification({
        title: "Success!",
        description: "Staff member added successfully",
        type: "success",
        duration: 3000
      });
      setAddDialogOpen(false);
      resetAddForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff",
        variant: "destructive",
      });
    },
  });

  // Edit staff mutation
  const editMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/staff/${data.id}`, data.updates);
      if (!response.ok) throw new Error("Failed to update staff");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      showNotification({
        title: "Success!",
        description: "Staff member updated successfully",
        type: "success",
        duration: 3000
      });
      setEditDialogOpen(false);
      setSelectedStaff(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff",
        variant: "destructive",
      });
    },
  });

  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/staff/${id}`);
      if (!response.ok) throw new Error("Failed to delete staff");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      showNotification({
        title: "Success!",
        description: "Staff member deleted successfully",
        type: "success",
        duration: 3000
      });
      setDeleteDialogOpen(false);
      setSelectedStaff(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff",
        variant: "destructive",
      });
    },
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (staffList: any[]) => {
      const response = await apiRequest("POST", "/api/staff/bulk-import", { staffList });
      if (!response.ok) throw new Error("Failed to import staff");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      showNotification({
        title: "Import Complete!",
        description: `${data.success} staff imported successfully. ${data.errors.length} errors.`,
        type: "success",
        duration: 4000
      });
      setImportDialogOpen(false);
      setCsvData([]);
      setCsvPreview([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import staff",
        variant: "destructive",
      });
    },
  });

  const resetAddForm = () => {
    setAddForm({
      staff_name: "",
      initial_name: "",
      nik: "",
      section_name: "",
      department_name: "",
      dept_name: "",
      no_hp: "",
      email: "",
      status: 1,
      position: "",
      photo: "",
    });
  };

  const handleAddFormChange = (field: string, value: string | number) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field: string, value: string | number) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAdd = () => {
    if (!addForm.staff_name || !addForm.nik) return;
    addMutation.mutate(addForm);
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setEditForm({
      staff_name: staff.staff_name,
      initial_name: staff.initial_name || "",
      nik: staff.nik,
      section_name: staff.section_name || "",
      department_name: staff.department_name || "",
      dept_name: staff.dept_name || "",
      no_hp: staff.no_hp || "",
      email: staff.email || "",
      status: staff.status,
      position: staff.position || "",
      photo: staff.photo || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedStaff) return;
    editMutation.mutate({ id: selectedStaff.id_staff, updates: editForm });
  };

  const handleDeleteStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedStaff) {
      deleteMutation.mutate(selectedStaff.id_staff);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(';').map(h => h.trim());
      
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(';');
          const obj: any = {};
          headers.forEach((header, index) => {
            const value = values[index]?.trim();
            obj[header] = value === 'NULL' || value === '' ? null : value;
          });
          return obj;
        });

      // Map CSV data to our staff structure
      const staffData = data.map((row: any) => ({
        staff_name: row.staff_name,
        initial_name: row.initial_name,
        nik: row.nik,
        section_name: row.section_name,
        department_name: row.department_name,
        dept_name: row.dept_name,
        no_hp: row.no_hp === '0' ? null : row.no_hp,
        email: row.email,
        status: parseInt(row.status) || 1,
        position: row.position,
        photo: row.photo,
      })).filter(staff => staff.nik && staff.staff_name); // Only include valid entries

      setCsvData(staffData);
      setCsvPreview(staffData.slice(0, 5)); // Show first 5 for preview
      setImportDialogOpen(true);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (csvData.length === 0) return;
    bulkImportMutation.mutate(csvData);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="min-h-screen">
      <NotificationComponent />
      
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Staff Management
          </h1>
          {isAdminOrPetugas && (
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="px-4 py-2 rounded-lg text-sm font-medium"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>
          )}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, NIK, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
          {search && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      <div className="p-6">
        <div className="mb-4 text-sm text-slate-600">
          Total: {staffData?.total || 0} staff members
        </div>

        <div className="overflow-x-auto rounded-lg shadow border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIK</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9}>Loading...</TableCell>
                </TableRow>
              ) : staffData?.staff.length ? (
                staffData.staff.map((staff) => (
                  <TableRow key={staff.id_staff}>
                    <TableCell className="font-mono">{staff.nik}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{staff.staff_name}</div>
                        {staff.initial_name && (
                          <div className="text-sm text-slate-500">({staff.initial_name})</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{staff.department_name || "-"}</div>
                        {staff.dept_name && (
                          <div className="text-sm text-slate-500 font-mono">({staff.dept_name})</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{staff.section_name || "-"}</TableCell>
                    <TableCell>{staff.position || "-"}</TableCell>
                    <TableCell>{staff.email || "-"}</TableCell>
                    <TableCell>{staff.no_hp || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        staff.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {staff.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdminOrPetugas && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStaff(staff)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStaff(staff)}
                            title="Delete"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-slate-500">
                    No staff found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {staffData && staffData.total > 25 && (
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {page} of {Math.ceil(staffData.total / 25)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(staffData.total / 25)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Add Staff Dialog */}
      {isAdminOrPetugas && (
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
              <DialogDescription>
                Fill in the staff information.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Staff Name *
                  </label>
                  <Input
                    value={addForm.staff_name}
                    onChange={(e) => handleAddFormChange("staff_name", e.target.value)}
                    placeholder="Enter staff name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    NIK *
                  </label>
                  <Input
                    value={addForm.nik}
                    onChange={(e) => handleAddFormChange("nik", e.target.value)}
                    placeholder="Enter NIK"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Initial Name
                  </label>
                  <Input
                    value={addForm.initial_name}
                    onChange={(e) => handleAddFormChange("initial_name", e.target.value)}
                    placeholder="Enter initial name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department Code
                  </label>
                  <Input
                    value={addForm.dept_name}
                    onChange={(e) => handleAddFormChange("dept_name", e.target.value)}
                    placeholder="e.g., DIAD, CROP, AGRO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department Name
                  </label>
                  <Input
                    value={addForm.department_name}
                    onChange={(e) => handleAddFormChange("department_name", e.target.value)}
                    placeholder="Enter department name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Section
                  </label>
                  <Input
                    value={addForm.section_name}
                    onChange={(e) => handleAddFormChange("section_name", e.target.value)}
                    placeholder="Enter section name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Position
                  </label>
                  <Input
                    value={addForm.position}
                    onChange={(e) => handleAddFormChange("position", e.target.value)}
                    placeholder="Enter position"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>
                  <Input
                    value={addForm.no_hp}
                    onChange={(e) => handleAddFormChange("no_hp", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => handleAddFormChange("email", e.target.value)}
                    placeholder="Enter email address"
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
                disabled={addMutation.isPending || !addForm.staff_name || !addForm.nik}
                className="bg-primary hover:bg-blue-700"
              >
                {addMutation.isPending ? "Adding..." : "Add Staff"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* CSV Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import Staff from CSV</DialogTitle>
            <DialogDescription>
              Review the data to be imported. {csvData.length} records found.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {csvPreview.length > 0 && (
              <div className="overflow-x-auto rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>NIK</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvPreview.map((staff, index) => (
                      <TableRow key={index}>
                        <TableCell>{staff.staff_name}</TableCell>
                        <TableCell>{staff.nik}</TableCell>
                        <TableCell>{staff.dept_name}</TableCell>
                        <TableCell>{staff.email || "-"}</TableCell>
                        <TableCell>{staff.no_hp || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {csvData.length > 5 && (
              <p className="text-sm text-slate-600 mt-2">
                ... and {csvData.length - 5} more records
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
              disabled={bulkImportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={bulkImportMutation.isPending || csvData.length === 0}
              className="bg-primary hover:bg-blue-700"
            >
              {bulkImportMutation.isPending ? "Importing..." : `Import ${csvData.length} Records`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit and Delete dialogs would go here - similar to add dialog but with edit/delete logic */}

      {/* Edit Staff Dialog */}
      {isAdminOrPetugas && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update the staff member information below.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    value={editForm.staff_name}
                    onChange={(e) => handleEditFormChange("staff_name", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Initial Name
                  </label>
                  <Input
                    value={editForm.initial_name}
                    onChange={(e) => handleEditFormChange("initial_name", e.target.value)}
                    placeholder="Enter initial name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    NIK *
                  </label>
                  <Input
                    value={editForm.nik}
                    onChange={(e) => handleEditFormChange("nik", e.target.value)}
                    placeholder="Enter NIK"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Position
                  </label>
                  <Input
                    value={editForm.position}
                    onChange={(e) => handleEditFormChange("position", e.target.value)}
                    placeholder="Enter position"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Section
                  </label>
                  <Input
                    value={editForm.section_name}
                    onChange={(e) => handleEditFormChange("section_name", e.target.value)}
                    placeholder="Enter section"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department
                  </label>
                  <Input
                    value={editForm.department_name}
                    onChange={(e) => handleEditFormChange("department_name", e.target.value)}
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department Code
                  </label>
                  <Input
                    value={editForm.dept_name}
                    onChange={(e) => handleEditFormChange("dept_name", e.target.value)}
                    placeholder="Enter dept code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={editForm.no_hp}
                    onChange={(e) => handleEditFormChange("no_hp", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleEditFormChange("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => handleEditFormChange("status", parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
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
                disabled={editMutation.isPending || !editForm.staff_name || !editForm.nik}
                className="bg-primary hover:bg-blue-700"
              >
                {editMutation.isPending ? "Updating..." : "Update Staff"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {isAdminOrPetugas && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Staff Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedStaff?.staff_name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}