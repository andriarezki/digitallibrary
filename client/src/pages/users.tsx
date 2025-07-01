import { useState } from "react";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id_login: number;
  user: string;
  nama?: string;
  email?: string;
  level?: string;
}

interface UsersResponse {
  users: User[];
  total: number;
}

export default function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addForm, setAddForm] = useState({ user: "", pass: "" });
  const [editForm, setEditForm] = useState({
    user: "",
    pass: "",
    nama: "",
    email: "",
    level: "",
  });

  // Fetch users
  const { data: usersData, isLoading } = useQuery<UsersResponse>({
    queryKey: ["/api/users", { page: 1, limit: 50 }],
  });

  // Add user mutation
  const addMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      if (!response.ok) throw new Error("Failed to add user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Success", description: "User added successfully" });
      setAddDialogOpen(false);
      setAddForm({ user: "", pass: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    },
  });

  // Edit user mutation
  const editMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/users/${data.id}`, data.updates);
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Success", description: "User updated successfully" });
      setEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/users/${id}`);
      if (!response.ok) throw new Error("Failed to delete user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Success", description: "User deleted successfully" });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleAddFormChange = (field: string, value: string) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAdd = () => {
    if (!addForm.user || !addForm.pass) return;
    addMutation.mutate(addForm);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      user: user.user || "",
      pass: "",
      nama: user.nama || "",
      email: user.email || "",
      level: user.level || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;
    const updates: any = {
      user: editForm.user,
      nama: editForm.nama,
      email: editForm.email,
      level: editForm.level,
    };
    if (editForm.pass) updates.pass = editForm.pass;
    editMutation.mutate({ id: selectedUser.id_login, updates });
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id_login);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Users Management
          </h1>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto rounded-lg shadow border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading...</TableCell>
                </TableRow>
              ) : usersData?.users.length ? (
                usersData.users.map((user) => (
                  <TableRow key={user.id_login}>
                    <TableCell>{user.user}</TableCell>
                    <TableCell>{user.nama || "-"}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user.level || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        title="Delete"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Fill in the username and password for the new user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username *
              </label>
              <Input
                value={addForm.user}
                onChange={(e) =>
                  handleAddFormChange("user", e.target.value)
                }
                placeholder="Enter username"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password *
              </label>
              <Input
                type="password"
                value={addForm.pass}
                onChange={(e) =>
                  handleAddFormChange("pass", e.target.value)
                }
                placeholder="Enter password"
                className="w-full"
              />
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
              disabled={
                addMutation.isPending || !addForm.user || !addForm.pass
              }
              className="bg-primary hover:bg-blue-700"
            >
              {addMutation.isPending ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Edit the user information. Leave password blank to keep unchanged.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username *
              </label>
              <Input
                value={editForm.user}
                onChange={(e) =>
                  handleEditFormChange("user", e.target.value)
                }
                placeholder="Enter username"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={editForm.pass}
                onChange={(e) =>
                  handleEditFormChange("pass", e.target.value)
                }
                placeholder="Enter new password (leave blank to keep current)"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>
              <Input
                value={editForm.nama}
                onChange={(e) =>
                  handleEditFormChange("nama", e.target.value)
                }
                placeholder="Enter name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <Input
                value={editForm.email}
                onChange={(e) =>
                  handleEditFormChange("email", e.target.value)
                }
                placeholder="Enter email"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Level
              </label>
              <Input
                value={editForm.level}
                onChange={(e) =>
                  handleEditFormChange("level", e.target.value)
                }
                placeholder="Enter level (e.g. admin, user)"
                className="w-full"
              />
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
              disabled={editMutation.isPending || !editForm.user}
              className="bg-primary hover:bg-blue-700"
            >
              {editMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user{" "}
              <b>{selectedUser?.user}</b>? This action cannot be undone.
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
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
