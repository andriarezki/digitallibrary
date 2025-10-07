import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Rak } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function ShelvesPage() {
  const { data: shelves, isLoading } = useQuery<Rak[]>({
    queryKey: ["/api/shelves"],
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useUser();
  const isAdminOrPetugas = user?.level === "admin" || user?.level === "petugas";
  const isAdmin = user?.level === "admin";

  // State for dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<Rak | null>(null);
  const [shelfData, setShelfData] = useState({
    nama_rak: "",
    lokasi: "",
    kapasitas: ""
  });

  // Add shelf mutation
  const addMutation = useMutation({
    mutationFn: async (data: { nama_rak: string; lokasi: string; kapasitas: string }) =>
      apiRequest("POST", "/api/shelves", {
        nama_rak: data.nama_rak,
        lokasi: data.lokasi || null,
        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });
      setAddDialogOpen(false);
      setShelfData({ nama_rak: "", lokasi: "", kapasitas: "" });
      toast({ title: "Location added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add location", variant: "destructive" });
    },
  });

  // Edit shelf mutation
  const editMutation = useMutation({
    mutationFn: async (data: { id: number; nama_rak: string; lokasi: string; kapasitas: string }) =>
      apiRequest("PATCH", `/api/shelves/${data.id}`, {
        nama_rak: data.nama_rak,
        lokasi: data.lokasi || null,
        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });
      setEditDialogOpen(false);
      setSelectedShelf(null);
      setShelfData({ nama_rak: "", lokasi: "", kapasitas: "" });
      toast({ title: "Location updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update location", variant: "destructive" });
    },
  });

  // Delete shelf mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) =>
      apiRequest("DELETE", `/api/shelves/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });
      toast({ title: "Location deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete location", variant: "destructive" });
    },
  });

  // Handlers
  const handleAddShelf = () => {
    setShelfData({ nama_rak: "", lokasi: "", kapasitas: "" });
    setAddDialogOpen(true);
  };

  const handleSaveAdd = () => {
    if (shelfData.nama_rak.trim()) {
      addMutation.mutate(shelfData);
    }
  };

  const handleEditShelf = (shelf: Rak) => {
    setSelectedShelf(shelf);
    setShelfData({
      nama_rak: shelf.nama_rak,
      lokasi: shelf.lokasi || "",
      kapasitas: shelf.kapasitas?.toString() || ""
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedShelf && shelfData.nama_rak.trim()) {
      editMutation.mutate({ 
        id: selectedShelf.id_rak, 
        ...shelfData 
      });
    }
  };

  const handleDeleteShelf = (shelf: Rak) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      deleteMutation.mutate(shelf.id_rak);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Location Management</h1>
          {isAdminOrPetugas && ( // <-- Only show Add Location for admin/petugas
            <Button 
              onClick={handleAddShelf}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {shelves?.map((shelf) => (
                  <div key={shelf.id_rak} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <h3 className="font-medium text-slate-900">{shelf.nama_rak}</h3>
                      <p className="text-sm text-slate-500">
                        Location: {shelf.lokasi || "Not specified"} • 
                        Capacity: {shelf.kapasitas || "Unlimited"}
                      </p>
                    </div>
                    {isAdmin && ( // <-- Only show Edit/Delete for admin
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditShelf(shelf)}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteShelf(shelf)}>Delete</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Location Dialog */}
      {isAdmin && (
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location Name *</label>
                <Input
                  value={shelfData.nama_rak}
                  onChange={(e) => setShelfData(prev => ({ ...prev, nama_rak: e.target.value }))}
                  placeholder="Enter location name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address/Description</label>
                <Input
                  value={shelfData.lokasi}
                  onChange={(e) => setShelfData(prev => ({ ...prev, lokasi: e.target.value }))}
                  placeholder="Enter location address or description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Capacity</label>
                <Input
                  type="number"
                  value={shelfData.kapasitas}
                  onChange={(e) => setShelfData(prev => ({ ...prev, kapasitas: e.target.value }))}
                  placeholder="Enter capacity (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveAdd} disabled={addMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Location Dialog */}
      {isAdmin && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location Name *</label>
                <Input
                  value={shelfData.nama_rak}
                  onChange={(e) => setShelfData(prev => ({ ...prev, nama_rak: e.target.value }))}
                  placeholder="Enter location name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address/Description</label>
                <Input
                  value={shelfData.lokasi}
                  onChange={(e) => setShelfData(prev => ({ ...prev, lokasi: e.target.value }))}
                  placeholder="Enter location address or description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Capacity</label>
                <Input
                  type="number"
                  value={shelfData.kapasitas}
                  onChange={(e) => setShelfData(prev => ({ ...prev, kapasitas: e.target.value }))}
                  placeholder="Enter capacity (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit} disabled={editMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
