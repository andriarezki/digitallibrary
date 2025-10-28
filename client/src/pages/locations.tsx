import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, MapPin } from "lucide-react";
import { Lokasi } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function LocationsPage() {
  const { data: locations, isLoading } = useQuery<Lokasi[]>({
    queryKey: ["/api/locations"],
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useUser();
  const isAdmin = user?.level === "admin";

  // State for dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Lokasi | null>(null);
  const [locationName, setLocationName] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [locationCapacity, setLocationCapacity] = useState("");

  // Add location mutation
  const addMutation = useMutation({
    mutationFn: async (data: { nama_lokasi: string; deskripsi: string; kapasitas: string }) =>
      apiRequest("POST", "/api/locations", {
        nama_lokasi: data.nama_lokasi,
        deskripsi: data.deskripsi || null,
        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setAddDialogOpen(false);
      setLocationName("");
      setLocationDescription("");
      setLocationCapacity("");
      toast({ title: "Location added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add location", variant: "destructive" });
    },
  });

  // Edit location mutation
  const editMutation = useMutation({
    mutationFn: async (data: { id: number; nama_lokasi: string; deskripsi: string; kapasitas: string }) =>
      apiRequest("PATCH", `/api/locations/${data.id}`, {
        nama_lokasi: data.nama_lokasi,
        deskripsi: data.deskripsi || null,
        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setEditDialogOpen(false);
      setSelectedLocation(null);
      setLocationName("");
      setLocationDescription("");
      setLocationCapacity("");
      toast({ title: "Location updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update location", variant: "destructive" });
    },
  });

  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) =>
      apiRequest("DELETE", `/api/locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({ title: "Location deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete location", variant: "destructive" });
    },
  });

  // Handlers
  const handleAddLocation = () => {
    setLocationName("");
    setLocationDescription("");
    setLocationCapacity("");
    setAddDialogOpen(true);
  };

  const handleSaveAdd = () => {
    if (locationName.trim()) {
      addMutation.mutate({ 
        nama_lokasi: locationName,
        deskripsi: locationDescription,
        kapasitas: locationCapacity
      });
    }
  };

  const handleEditLocation = (location: Lokasi) => {
    setSelectedLocation(location);
    setLocationName(location.nama_lokasi);
    setLocationDescription(location.deskripsi || "");
    setLocationCapacity(location.kapasitas?.toString() || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedLocation && locationName.trim()) {
      editMutation.mutate({ 
        id: selectedLocation.id_lokasi, 
        nama_lokasi: locationName,
        deskripsi: locationDescription,
        kapasitas: locationCapacity
      });
    }
  };

  const handleDeleteLocation = (location: Lokasi) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      deleteMutation.mutate(location.id_lokasi);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-slate-900">Locations Management</h1>
          </div>
          {isAdmin && (
            <Button 
              onClick={handleAddLocation}
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
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {locations?.map((location) => (
                  <div key={location.id_lokasi} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <h3 className="font-medium text-slate-900">{location.nama_lokasi}</h3>
                      <p className="text-sm text-slate-500">
                        Description: {location.deskripsi || "Not specified"} • 
                        Capacity: {location.kapasitas || "Unlimited"}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditLocation(location)}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteLocation(location)}>Delete</Button>
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
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Enter location name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Input
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  placeholder="Enter location description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Capacity</label>
                <Input
                  type="number"
                  value={locationCapacity}
                  onChange={(e) => setLocationCapacity(e.target.value)}
                  placeholder="Enter capacity (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveAdd} disabled={addMutation.isPending || !locationName.trim()}>
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
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Enter location name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Input
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  placeholder="Enter location description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Capacity</label>
                <Input
                  type="number"
                  value={locationCapacity}
                  onChange={(e) => setLocationCapacity(e.target.value)}
                  placeholder="Enter capacity (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit} disabled={editMutation.isPending || !locationName.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
