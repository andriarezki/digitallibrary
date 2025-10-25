function LocationsPage() {import React from "react";import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

  return <div>Locations page placeholder</div>;

}



export default LocationsPage;const LocationsPage: React.FC = () => {import { Button } from "@/components/ui/button";

  return (

    <div className="min-h-screen">import { Card, CardContent } from "@/components/ui/card";import { Button } from "@/components/ui/button";

      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">

        <h1 className="text-2xl font-bold text-slate-900">Document Locations</h1>import { Plus, MapPin } from "lucide-react";

      </div>

      <div className="p-6">import { Lokasi } from "@shared/schema";import { Card, CardContent } from "@/components/ui/card";import { Button } from "@/components/ui/button";

        <p>Locations page is under construction.</p>

      </div>import { Skeleton } from "@/components/ui/skeleton";

    </div>

  );import { useToast } from "@/hooks/use-toast";import { Plus, MapPin } from "lucide-react";

};

import { useUser } from "@/context/UserContext";

export default LocationsPage;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";import { Lokasi } from "@shared/schema";import { Card, CardContent } from "@/components/ui/card";import { Button } from "@/components/ui/button";import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { useState } from "react";import { Skeleton } from "@/components/ui/skeleton";

import { apiRequest } from "@/lib/queryClient";

import { useToast } from "@/hooks/use-toast";import { Plus, MapPin } from "lucide-react";

export default function LocationsPage() {

  const { data: locations, isLoading } = useQuery<Lokasi[]>({import { useUser } from "@/context/UserContext";

    queryKey: ["/api/locations"],

  });import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";import { Lokasi } from "@shared/schema";import { Card, CardContent } from "@/components/ui/card";import { Card, CardContent } from "@/components/ui/card";

  

  const queryClient = useQueryClient();import { Input } from "@/components/ui/input";

  const { toast } = useToast();

  const user = useUser();import { useState } from "react";import { Skeleton } from "@/components/ui/skeleton";

  const isAdminOrPetugas = user?.level === "admin" || user?.level === "petugas";

  const isAdmin = user?.level === "admin";import { apiRequest } from "@/lib/queryClient";



  // State for dialogsimport { useToast } from "@/hooks/use-toast";import { Plus, MapPin } from "lucide-react";import { Plus } from "lucide-react";

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);export default function LocationsPage() {

  const [selectedLocation, setSelectedLocation] = useState<Lokasi | null>(null);

  const [locationData, setLocationData] = useState({  const { data: locations, isLoading } = useQuery<Lokasi[]>({import { useUser } from "@/context/UserContext";

    nama_lokasi: "",

    deskripsi: "",    queryKey: ["/api/locations"],

    kapasitas: ""

  });  });import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";import { Lokasi } from "@shared/schema";import { Rak } from "@shared/schema";



  // Add location mutation  

  const addMutation = useMutation({

    mutationFn: async (data: { nama_lokasi: string; deskripsi: string; kapasitas: string }) =>  const queryClient = useQueryClient();import { Input } from "@/components/ui/input";

      apiRequest("POST", "/api/locations", {

        nama_lokasi: data.nama_lokasi,  const { toast } = useToast();

        deskripsi: data.deskripsi || null,

        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null  const user = useUser();import { useState } from "react";import { Skeleton } from "@/components/ui/skeleton";import { Skeleton } from "@/components/ui/skeleton";

      }),

    onSuccess: () => {  const isAdminOrPetugas = user?.level === "admin" || user?.level === "petugas";

      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });

      setAddDialogOpen(false);  const isAdmin = user?.level === "admin";import { apiRequest } from "@/lib/queryClient";

      setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });

      toast({ title: "Location added successfully" });

    },

    onError: () => {  // State for dialogsimport { useToast } from "@/hooks/use-toast";import { useToast } from "@/hooks/use-toast";

      toast({ title: "Failed to add location", variant: "destructive" });

    },  const [addDialogOpen, setAddDialogOpen] = useState(false);

  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);export default function LocationsPage() {

  // Edit location mutation

  const editMutation = useMutation({  const [selectedLocation, setSelectedLocation] = useState<Lokasi | null>(null);

    mutationFn: async (data: { id: number; nama_lokasi: string; deskripsi: string; kapasitas: string }) =>

      apiRequest("PATCH", `/api/locations/${data.id}`, {  const [locationData, setLocationData] = useState({  const { data: locations, isLoading } = useQuery<Lokasi[]>({import { useUser } from "@/context/UserContext";import { useUser } from "@/context/UserContext";

        nama_lokasi: data.nama_lokasi,

        deskripsi: data.deskripsi || null,    nama_lokasi: "",

        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null

      }),    deskripsi: "",    queryKey: ["/api/locations"],

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });    kapasitas: ""

      setEditDialogOpen(false);

      setSelectedLocation(null);  });  });import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

      setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });

      toast({ title: "Location updated successfully" });

    },

    onError: () => {  // Add location mutation  

      toast({ title: "Failed to update location", variant: "destructive" });

    },  const addMutation = useMutation({

  });

    mutationFn: async (data: { nama_lokasi: string; deskripsi: string; kapasitas: string }) =>  const queryClient = useQueryClient();import { Input } from "@/components/ui/input";import { Input } from "@/components/ui/input";

  // Delete location mutation

  const deleteMutation = useMutation({      apiRequest("POST", "/api/locations", {

    mutationFn: async (id: number) =>

      apiRequest("DELETE", `/api/locations/${id}`),        nama_lokasi: data.nama_lokasi,  const { toast } = useToast();

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });        deskripsi: data.deskripsi || null,

      toast({ title: "Location deleted successfully" });

    },        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null  const user = useUser();import { useState } from "react";import { useState } from "react";

    onError: () => {

      toast({ title: "Failed to delete location", variant: "destructive" });      }),

    },

  });    onSuccess: () => {  const isAdminOrPetugas = user?.level === "admin" || user?.level === "petugas";



  const handleAddLocation = () => {      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });

    setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });

    setAddDialogOpen(true);      setAddDialogOpen(false);  const isAdmin = user?.level === "admin";import { apiRequest } from "@/lib/queryClient";import { apiRequest } from "@/lib/queryClient";

  };

      setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });

  const handleSubmit = () => {

    if (locationData.nama_lokasi.trim()) {      toast({ title: "Location added successfully" });

      addMutation.mutate(locationData);

    }    },

  };

    onError: () => {  // State for dialogs

  const handleEditLocation = (location: Lokasi) => {

    setSelectedLocation(location);      toast({ title: "Failed to add location", variant: "destructive" });

    setLocationData({

      nama_lokasi: location.nama_lokasi,    },  const [addDialogOpen, setAddDialogOpen] = useState(false);

      deskripsi: location.deskripsi || "",

      kapasitas: location.kapasitas?.toString() || ""  });

    });

    setEditDialogOpen(true);  const [editDialogOpen, setEditDialogOpen] = useState(false);export default function LocationsPage() {export default function ShelvesPage() {

  };

  // Edit location mutation

  const handleUpdate = () => {

    if (selectedLocation && locationData.nama_lokasi.trim()) {  const editMutation = useMutation({  const [selectedLocation, setSelectedLocation] = useState<Lokasi | null>(null);

      editMutation.mutate({

        id: selectedLocation.id_lokasi,     mutationFn: async (data: { id: number; nama_lokasi: string; deskripsi: string; kapasitas: string }) =>

        ...locationData 

      });      apiRequest("PATCH", `/api/locations/${data.id}`, {  const [locationData, setLocationData] = useState({  const { data: locations, isLoading } = useQuery<Lokasi[]>({  const { data: shelves, isLoading } = useQuery<Rak[]>({

    }

  };        nama_lokasi: data.nama_lokasi,



  const handleDeleteLocation = (location: Lokasi) => {        deskripsi: data.deskripsi || null,    nama_lokasi: "",

    if (confirm(`Are you sure you want to delete "${location.nama_lokasi}"?`)) {

      deleteMutation.mutate(location.id_lokasi);        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null

    }

  };      }),    deskripsi: "",    queryKey: ["/api/locations"],    queryKey: ["/api/shelves"],



  return (    onSuccess: () => {

    <div className="min-h-screen">

      {/* Header */}      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });    kapasitas: ""

      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">

        <div className="flex items-center justify-between">      setEditDialogOpen(false);

          <div className="flex items-center space-x-3">

            <MapPin className="w-6 h-6 text-primary" />      setSelectedLocation(null);  });  });  });

            <h1 className="text-2xl font-bold text-slate-900">Document Locations</h1>

          </div>      setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });

          {isAdmin && (

            <Button       toast({ title: "Location updated successfully" });

              onClick={handleAddLocation}

              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"    },

            >

              <Plus className="w-4 h-4 mr-2" />    onError: () => {  // Add location mutation    

              Add New Location

            </Button>      toast({ title: "Failed to update location", variant: "destructive" });

          )}

        </div>    },  const addMutation = useMutation({

      </div>

  });

      {/* Content */}

      <div className="p-6">    mutationFn: async (data: { nama_lokasi: string; deskripsi: string; kapasitas: string }) =>  const queryClient = useQueryClient();  const queryClient = useQueryClient();

        <div className="max-w-4xl mx-auto">

          <div className="mb-6">  // Delete location mutation

            <p className="text-slate-600">

              Manage document storage locations. Each location can have a name, description, and capacity limit.  const deleteMutation = useMutation({      apiRequest("POST", "/api/locations", {

            </p>

          </div>    mutationFn: async (id: number) =>



          <Card>      apiRequest("DELETE", `/api/locations/${id}`),        nama_lokasi: data.nama_lokasi,  const { toast } = useToast();  const { toast } = useToast();

            <CardContent className="p-6">

              {isLoading ? (    onSuccess: () => {

                <div className="space-y-4">

                  {[...Array(5)].map((_, i) => (      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });        deskripsi: data.deskripsi || null,

                    <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">

                      <div className="flex-1">      toast({ title: "Location deleted successfully" });

                        <Skeleton className="h-5 w-48 mb-2" />

                        <Skeleton className="h-4 w-96" />    },        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null  const user = useUser();  const user = useUser();

                      </div>

                      <div className="flex space-x-2">    onError: () => {

                        <Skeleton className="h-8 w-16" />

                        <Skeleton className="h-8 w-16" />      toast({ title: "Failed to delete location", variant: "destructive" });      }),

                      </div>

                    </div>    },

                  ))}

                </div>  });    onSuccess: () => {  const isAdminOrPetugas = user?.level === "admin" || user?.level === "petugas";  const isAdminOrPetugas = user?.level === "admin" || user?.level === "petugas";

              ) : locations && locations.length > 0 ? (

                <div className="space-y-4">

                  {locations.map((location) => (

                    <div key={location.id_lokasi} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">  const handleAddLocation = () => {      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });

                      <div className="flex-1">

                        <h3 className="font-medium text-slate-900">{location.nama_lokasi}</h3>    setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });

                        <p className="text-sm text-slate-500 mt-1">

                          Description: {location.deskripsi || "Not specified"} •     setAddDialogOpen(true);      setAddDialogOpen(false);  const isAdmin = user?.level === "admin";  const isAdmin = user?.level === "admin";

                          Capacity: {location.kapasitas || "Unlimited"}

                        </p>  };

                      </div>

                      {isAdmin && (      setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });

                        <div className="flex space-x-2">

                          <Button variant="outline" size="sm" onClick={() => handleEditLocation(location)}>Edit</Button>  const handleSubmit = () => {

                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteLocation(location)}>Delete</Button>

                        </div>    if (locationData.nama_lokasi.trim()) {      toast({ title: "Location added successfully" });

                      )}

                    </div>      addMutation.mutate(locationData);

                  ))}

                </div>    }    },

              ) : (

                <div className="text-center py-12">  };

                  <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />

                  <h3 className="text-lg font-medium text-slate-900 mb-2">No locations found</h3>    onError: () => {  // State for dialogs  // State for dialogs

                  <p className="text-slate-500 mb-4">

                    Get started by adding your first document location.  const handleEditLocation = (location: Lokasi) => {

                  </p>

                  {isAdmin && (    setSelectedLocation(location);      toast({ title: "Failed to add location", variant: "destructive" });

                    <Button onClick={handleAddLocation}>

                      <Plus className="w-4 h-4 mr-2" />    setLocationData({

                      Add Location

                    </Button>      nama_lokasi: location.nama_lokasi,    },  const [addDialogOpen, setAddDialogOpen] = useState(false);  const [addDialogOpen, setAddDialogOpen] = useState(false);

                  )}

                </div>      deskripsi: location.deskripsi || "",

              )}

            </CardContent>      kapasitas: location.kapasitas?.toString() || ""  });

          </Card>

        </div>    });

      </div>

    setEditDialogOpen(true);  const [editDialogOpen, setEditDialogOpen] = useState(false);  const [editDialogOpen, setEditDialogOpen] = useState(false);

      {/* Add Location Dialog */}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>  };

        <DialogContent className="sm:max-w-[500px]">

          <DialogHeader>  // Edit location mutation

            <DialogTitle>Add New Location</DialogTitle>

          </DialogHeader>  const handleUpdate = () => {

          <div className="space-y-4 py-4">

            <div>    if (selectedLocation && locationData.nama_lokasi.trim()) {  const editMutation = useMutation({  const [selectedLocation, setSelectedLocation] = useState<Lokasi | null>(null);  const [selectedShelf, setSelectedShelf] = useState<Rak | null>(null);

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Location Name *      editMutation.mutate({

              </label>

              <Input        id: selectedLocation.id_lokasi,     mutationFn: async (data: { id: number; nama_lokasi: string; deskripsi: string; kapasitas: string }) =>

                type="text"

                placeholder="Enter location name"        ...locationData 

                value={locationData.nama_lokasi}

                onChange={(e) => setLocationData(prev => ({ ...prev, nama_lokasi: e.target.value }))}      });      apiRequest("PATCH", `/api/locations/${data.id}`, {  const [locationData, setLocationData] = useState({  const [shelfData, setShelfData] = useState({

                className="w-full"

              />    }

            </div>

            <div>  };        nama_lokasi: data.nama_lokasi,

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Description

              </label>

              <Input  const handleDeleteLocation = (location: Lokasi) => {        deskripsi: data.deskripsi || null,    nama_lokasi: "",    nama_rak: "",

                type="text"

                placeholder="Enter location description"    if (confirm(`Are you sure you want to delete "${location.nama_lokasi}"?`)) {

                value={locationData.deskripsi}

                onChange={(e) => setLocationData(prev => ({ ...prev, deskripsi: e.target.value }))}      deleteMutation.mutate(location.id_lokasi);        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null

                className="w-full"

              />    }

            </div>

            <div>  };      }),    deskripsi: "",    lokasi: "",

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Capacity

              </label>

              <Input  return (    onSuccess: () => {

                type="number"

                placeholder="Enter capacity (optional)"    <div className="min-h-screen">

                value={locationData.kapasitas}

                onChange={(e) => setLocationData(prev => ({ ...prev, kapasitas: e.target.value }))}      {/* Header */}      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });    kapasitas: ""    kapasitas: ""

                className="w-full"

              />      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">

            </div>

          </div>        <div className="flex items-center justify-between">      setEditDialogOpen(false);

          <DialogFooter>

            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>          <div className="flex items-center space-x-3">

              Cancel

            </Button>            <MapPin className="w-6 h-6 text-primary" />      setSelectedLocation(null);  });  });

            <Button 

              onClick={handleSubmit}            <h1 className="text-2xl font-bold text-slate-900">Document Locations</h1>

              disabled={!locationData.nama_lokasi.trim() || addMutation.isPending}

            >          </div>      setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });

              {addMutation.isPending ? "Adding..." : "Add Location"}

            </Button>          {isAdmin && (

          </DialogFooter>

        </DialogContent>            <Button       toast({ title: "Location updated successfully" });

      </Dialog>

              onClick={handleAddLocation}

      {/* Edit Location Dialog */}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"    },

        <DialogContent className="sm:max-w-[500px]">

          <DialogHeader>            >

            <DialogTitle>Edit Location</DialogTitle>

          </DialogHeader>              <Plus className="w-4 h-4 mr-2" />    onError: () => {  // Add location mutation  // Add shelf mutation

          <div className="space-y-4 py-4">

            <div>              Add New Location

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Location Name *            </Button>      toast({ title: "Failed to update location", variant: "destructive" });

              </label>

              <Input          )}

                type="text"

                placeholder="Enter location name"        </div>    },  const addMutation = useMutation({  const addMutation = useMutation({

                value={locationData.nama_lokasi}

                onChange={(e) => setLocationData(prev => ({ ...prev, nama_lokasi: e.target.value }))}      </div>

                className="w-full"

              />  });

            </div>

            <div>      {/* Content */}

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Description      <div className="p-6">    mutationFn: async (data: { nama_lokasi: string; deskripsi: string; kapasitas: string }) =>    mutationFn: async (data: { nama_rak: string; lokasi: string; kapasitas: string }) =>

              </label>

              <Input        <div className="max-w-4xl mx-auto">

                type="text"

                placeholder="Enter location description"          <div className="mb-6">  // Delete location mutation

                value={locationData.deskripsi}

                onChange={(e) => setLocationData(prev => ({ ...prev, deskripsi: e.target.value }))}            <p className="text-slate-600">

                className="w-full"

              />              Manage document storage locations. Each location can have a name, description, and capacity limit.  const deleteMutation = useMutation({      apiRequest("POST", "/api/locations", {      apiRequest("POST", "/api/shelves", {

            </div>

            <div>            </p>

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Capacity          </div>    mutationFn: async (id: number) =>

              </label>

              <Input

                type="number"

                placeholder="Enter capacity (optional)"          <Card>      apiRequest("DELETE", `/api/locations/${id}`),        nama_lokasi: data.nama_lokasi,        nama_rak: data.nama_rak,

                value={locationData.kapasitas}

                onChange={(e) => setLocationData(prev => ({ ...prev, kapasitas: e.target.value }))}            <CardContent className="p-6">

                className="w-full"

              />              {isLoading ? (    onSuccess: () => {

            </div>

          </div>                <div className="space-y-4">

          <DialogFooter>

            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>                  {[...Array(5)].map((_, i) => (      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });        deskripsi: data.deskripsi || null,        lokasi: data.lokasi || null,

              Cancel

            </Button>                    <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">

            <Button 

              onClick={handleUpdate}                      <div className="flex-1">      toast({ title: "Location deleted successfully" });

              disabled={!locationData.nama_lokasi.trim() || editMutation.isPending}

            >                        <Skeleton className="h-5 w-48 mb-2" />

              {editMutation.isPending ? "Updating..." : "Update Location"}

            </Button>                        <Skeleton className="h-4 w-96" />    },        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null

          </DialogFooter>

        </DialogContent>                      </div>

      </Dialog>

    </div>                      <div className="flex space-x-2">    onError: () => {

  );

}                        <Skeleton className="h-8 w-16" />

                        <Skeleton className="h-8 w-16" />      toast({ title: "Failed to delete location", variant: "destructive" });      }),      }),

                      </div>

                    </div>    },

                  ))}

                </div>  });    onSuccess: () => {    onSuccess: () => {

              ) : locations && locations.length > 0 ? (

                <div className="space-y-4">

                  {locations.map((location) => (

                    <div key={location.id_lokasi} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">  const handleAddLocation = () => {      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });

                      <div className="flex-1">

                        <h3 className="font-medium text-slate-900">{location.nama_lokasi}</h3>    setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });

                        <p className="text-sm text-slate-500 mt-1">

                          Description: {location.deskripsi || "Not specified"} •     setAddDialogOpen(true);      setAddDialogOpen(false);      setAddDialogOpen(false);

                          Capacity: {location.kapasitas || "Unlimited"}

                        </p>  };

                      </div>

                      {isAdmin && (      setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });      setShelfData({ nama_rak: "", lokasi: "", kapasitas: "" });

                        <div className="flex space-x-2">

                          <Button variant="outline" size="sm" onClick={() => handleEditLocation(location)}>Edit</Button>  const handleSubmit = () => {

                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteLocation(location)}>Delete</Button>

                        </div>    if (locationData.nama_lokasi.trim()) {      toast({ title: "Location added successfully" });      toast({ title: "Location added successfully" });

                      )}

                    </div>      addMutation.mutate(locationData);

                  ))}

                </div>    }    },    },

              ) : (

                <div className="text-center py-12">  };

                  <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />

                  <h3 className="text-lg font-medium text-slate-900 mb-2">No locations found</h3>    onError: () => {    onError: () => {

                  <p className="text-slate-500 mb-4">

                    Get started by adding your first document location.  const handleEditLocation = (location: Lokasi) => {

                  </p>

                  {isAdmin && (    setSelectedLocation(location);      toast({ title: "Failed to add location", variant: "destructive" });      toast({ title: "Failed to add location", variant: "destructive" });

                    <Button onClick={handleAddLocation}>

                      <Plus className="w-4 h-4 mr-2" />    setLocationData({

                      Add Location

                    </Button>      nama_lokasi: location.nama_lokasi,    },    },

                  )}

                </div>      deskripsi: location.deskripsi || "",

              )}

            </CardContent>      kapasitas: location.kapasitas?.toString() || ""  });  });

          </Card>

        </div>    });

      </div>

    setEditDialogOpen(true);

      {/* Add Location Dialog */}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>  };

        <DialogContent className="sm:max-w-[500px]">

          <DialogHeader>  // Edit location mutation  // Edit shelf mutation

            <DialogTitle>Add New Location</DialogTitle>

          </DialogHeader>  const handleUpdate = () => {

          <div className="space-y-4 py-4">

            <div>    if (selectedLocation && locationData.nama_lokasi.trim()) {  const editMutation = useMutation({  const editMutation = useMutation({

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Location Name *      editMutation.mutate({

              </label>

              <Input        id: selectedLocation.id_lokasi,     mutationFn: async (data: { id: number; nama_lokasi: string; deskripsi: string; kapasitas: string }) =>    mutationFn: async (data: { id: number; nama_rak: string; lokasi: string; kapasitas: string }) =>

                type="text"

                placeholder="Enter location name"        ...locationData 

                value={locationData.nama_lokasi}

                onChange={(e) => setLocationData(prev => ({ ...prev, nama_lokasi: e.target.value }))}      });      apiRequest("PATCH", `/api/locations/${data.id}`, {      apiRequest("PATCH", `/api/shelves/${data.id}`, {

                className="w-full"

              />    }

            </div>

            <div>  };        nama_lokasi: data.nama_lokasi,        nama_rak: data.nama_rak,

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Description

              </label>

              <Input  const handleDeleteLocation = (location: Lokasi) => {        deskripsi: data.deskripsi || null,        lokasi: data.lokasi || null,

                type="text"

                placeholder="Enter location description"    if (confirm(`Are you sure you want to delete "${location.nama_lokasi}"?`)) {

                value={locationData.deskripsi}

                onChange={(e) => setLocationData(prev => ({ ...prev, deskripsi: e.target.value }))}      deleteMutation.mutate(location.id_lokasi);        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null        kapasitas: data.kapasitas ? parseInt(data.kapasitas) : null

                className="w-full"

              />    }

            </div>

            <div>  };      }),      }),

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Capacity

              </label>

              <Input  return (    onSuccess: () => {    onSuccess: () => {

                type="number"

                placeholder="Enter capacity (optional)"    <div className="min-h-screen">

                value={locationData.kapasitas}

                onChange={(e) => setLocationData(prev => ({ ...prev, kapasitas: e.target.value }))}      {/* Header */}      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });

                className="w-full"

              />      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">

            </div>

          </div>        <div className="flex items-center justify-between">      setEditDialogOpen(false);      setEditDialogOpen(false);

          <DialogFooter>

            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>          <div className="flex items-center space-x-3">

              Cancel

            </Button>            <MapPin className="w-6 h-6 text-primary" />      setSelectedLocation(null);      setSelectedShelf(null);

            <Button 

              onClick={handleSubmit}            <h1 className="text-2xl font-bold text-slate-900">Document Locations</h1>

              disabled={!locationData.nama_lokasi.trim() || addMutation.isPending}

            >          </div>      setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });      setShelfData({ nama_rak: "", lokasi: "", kapasitas: "" });

              {addMutation.isPending ? "Adding..." : "Add Location"}

            </Button>          {isAdmin && (

          </DialogFooter>

        </DialogContent>            <Button       toast({ title: "Location updated successfully" });      toast({ title: "Location updated successfully" });

      </Dialog>

              onClick={handleAddLocation}

      {/* Edit Location Dialog */}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"    },    },

        <DialogContent className="sm:max-w-[500px]">

          <DialogHeader>            >

            <DialogTitle>Edit Location</DialogTitle>

          </DialogHeader>              <Plus className="w-4 h-4 mr-2" />    onError: () => {    onError: () => {

          <div className="space-y-4 py-4">

            <div>              Add New Location

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Location Name *            </Button>      toast({ title: "Failed to update location", variant: "destructive" });      toast({ title: "Failed to update location", variant: "destructive" });

              </label>

              <Input          )}

                type="text"

                placeholder="Enter location name"        </div>    },    },

                value={locationData.nama_lokasi}

                onChange={(e) => setLocationData(prev => ({ ...prev, nama_lokasi: e.target.value }))}      </div>

                className="w-full"

              />  });  });

            </div>

            <div>      {/* Content */}

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Description      <div className="p-6">

              </label>

              <Input        <div className="max-w-4xl mx-auto">

                type="text"

                placeholder="Enter location description"          <div className="mb-6">  // Delete location mutation  // Delete shelf mutation

                value={locationData.deskripsi}

                onChange={(e) => setLocationData(prev => ({ ...prev, deskripsi: e.target.value }))}            <p className="text-slate-600">

                className="w-full"

              />              Manage document storage locations. Each location can have a name, description, and capacity limit.  const deleteMutation = useMutation({  const deleteMutation = useMutation({

            </div>

            <div>            </p>

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Capacity          </div>    mutationFn: async (id: number) =>    mutationFn: async (id: number) =>

              </label>

              <Input

                type="number"

                placeholder="Enter capacity (optional)"          <Card>      apiRequest("DELETE", `/api/locations/${id}`),      apiRequest("DELETE", `/api/shelves/${id}`),

                value={locationData.kapasitas}

                onChange={(e) => setLocationData(prev => ({ ...prev, kapasitas: e.target.value }))}            <CardContent className="p-6">

                className="w-full"

              />              {isLoading ? (    onSuccess: () => {    onSuccess: () => {

            </div>

          </div>                <div className="space-y-4">

          <DialogFooter>

            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>                  {[...Array(5)].map((_, i) => (      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });

              Cancel

            </Button>                    <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">

            <Button 

              onClick={handleUpdate}                      <div className="flex-1">      toast({ title: "Location deleted successfully" });      toast({ title: "Location deleted successfully" });

              disabled={!locationData.nama_lokasi.trim() || editMutation.isPending}

            >                        <Skeleton className="h-5 w-48 mb-2" />

              {editMutation.isPending ? "Updating..." : "Update Location"}

            </Button>                        <Skeleton className="h-4 w-96" />    },    },

          </DialogFooter>

        </DialogContent>                      </div>

      </Dialog>

    </div>                      <div className="flex space-x-2">    onError: () => {    onError: () => {

  );

}                        <Skeleton className="h-8 w-16" />

                        <Skeleton className="h-8 w-16" />      toast({ title: "Failed to delete location", variant: "destructive" });      toast({ title: "Failed to delete location", variant: "destructive" });

                      </div>

                    </div>    },    },

                  ))}

                </div>  });  });

              ) : locations && locations.length > 0 ? (

                <div className="space-y-4">

                  {locations.map((location) => (

                    <div key={location.id_lokasi} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">  const handleAddLocation = () => {  // Handlers

                      <div className="flex-1">

                        <h3 className="font-medium text-slate-900">{location.nama_lokasi}</h3>    setLocationData({ nama_lokasi: "", deskripsi: "", kapasitas: "" });  const handleAddShelf = () => {

                        <p className="text-sm text-slate-500 mt-1">

                          Description: {location.deskripsi || "Not specified"} •     setAddDialogOpen(true);    setShelfData({ nama_rak: "", lokasi: "", kapasitas: "" });

                          Capacity: {location.kapasitas || "Unlimited"}

                        </p>  };    setAddDialogOpen(true);

                      </div>

                      {isAdmin && (  };

                        <div className="flex space-x-2">

                          <Button variant="outline" size="sm" onClick={() => handleEditLocation(location)}>Edit</Button>  const handleSubmit = () => {

                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteLocation(location)}>Delete</Button>

                        </div>    if (locationData.nama_lokasi.trim()) {  const handleSaveAdd = () => {

                      )}

                    </div>      addMutation.mutate(locationData);    if (shelfData.nama_rak.trim()) {

                  ))}

                </div>    }      addMutation.mutate(shelfData);

              ) : (

                <div className="text-center py-12">  };    }

                  <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />

                  <h3 className="text-lg font-medium text-slate-900 mb-2">No locations found</h3>  };

                  <p className="text-slate-500 mb-4">

                    Get started by adding your first document location.  const handleEditLocation = (location: Lokasi) => {

                  </p>

                  {isAdmin && (    setSelectedLocation(location);  const handleEditShelf = (shelf: Rak) => {

                    <Button onClick={handleAddLocation}>

                      <Plus className="w-4 h-4 mr-2" />    setLocationData({    setSelectedShelf(shelf);

                      Add Location

                    </Button>      nama_lokasi: location.nama_lokasi,    setShelfData({

                  )}

                </div>      deskripsi: location.deskripsi || "",      nama_rak: shelf.nama_rak,

              )}

            </CardContent>      kapasitas: location.kapasitas?.toString() || ""      lokasi: shelf.lokasi || "",

          </Card>

        </div>    });      kapasitas: shelf.kapasitas?.toString() || ""

      </div>

    setEditDialogOpen(true);    });

      {/* Add Location Dialog */}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>  };    setEditDialogOpen(true);

        <DialogContent className="sm:max-w-[500px]">

          <DialogHeader>  };

            <DialogTitle>Add New Location</DialogTitle>

          </DialogHeader>  const handleUpdate = () => {

          <div className="space-y-4 py-4">

            <div>    if (selectedLocation && locationData.nama_lokasi.trim()) {  const handleSaveEdit = () => {

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Location Name *      editMutation.mutate({    if (selectedShelf && shelfData.nama_rak.trim()) {

              </label>

              <Input        id: selectedLocation.id_lokasi,       editMutation.mutate({ 

                type="text"

                placeholder="Enter location name"        ...locationData         id: selectedShelf.id_rak, 

                value={locationData.nama_lokasi}

                onChange={(e) => setLocationData(prev => ({ ...prev, nama_lokasi: e.target.value }))}      });        ...shelfData 

                className="w-full"

              />    }      });

            </div>

            <div>  };    }

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Description  };

              </label>

              <Input  const handleDeleteLocation = (location: Lokasi) => {

                type="text"

                placeholder="Enter location description"    if (confirm(`Are you sure you want to delete "${location.nama_lokasi}"?`)) {  const handleDeleteShelf = (shelf: Rak) => {

                value={locationData.deskripsi}

                onChange={(e) => setLocationData(prev => ({ ...prev, deskripsi: e.target.value }))}      deleteMutation.mutate(location.id_lokasi);    if (window.confirm("Are you sure you want to delete this location?")) {

                className="w-full"

              />    }      deleteMutation.mutate(shelf.id_rak);

            </div>

            <div>  };    }

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Capacity  };

              </label>

              <Input  return (

                type="number"

                placeholder="Enter capacity (optional)"    <div className="min-h-screen">  return (

                value={locationData.kapasitas}

                onChange={(e) => setLocationData(prev => ({ ...prev, kapasitas: e.target.value }))}      {/* Header */}    <div className="min-h-screen">

                className="w-full"

              />      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">

            </div>

          </div>        <div className="flex items-center justify-between">        <div className="flex items-center justify-between">

          <DialogFooter>

            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>          <div className="flex items-center space-x-3">          <h1 className="text-2xl font-bold text-slate-900">Location Management</h1>

              Cancel

            </Button>            <MapPin className="w-6 h-6 text-primary" />          {isAdminOrPetugas && ( // <-- Only show Add Location for admin/petugas

            <Button 

              onClick={handleSubmit}            <h1 className="text-2xl font-bold text-slate-900">Document Locations</h1>            <Button 

              disabled={!locationData.nama_lokasi.trim() || addMutation.isPending}

            >          </div>              onClick={handleAddShelf}

              {addMutation.isPending ? "Adding..." : "Add Location"}

            </Button>          {isAdmin && (              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"

          </DialogFooter>

        </DialogContent>            <Button             >

      </Dialog>

              onClick={handleAddLocation}              <Plus className="w-4 h-4 mr-2" />

      {/* Edit Location Dialog */}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"              Add Location

        <DialogContent className="sm:max-w-[500px]">

          <DialogHeader>            >            </Button>

            <DialogTitle>Edit Location</DialogTitle>

          </DialogHeader>              <Plus className="w-4 h-4 mr-2" />          )}

          <div className="space-y-4 py-4">

            <div>              Add New Location        </div>

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Location Name *            </Button>      </div>

              </label>

              <Input          )}      

                type="text"

                placeholder="Enter location name"        </div>      <div className="p-6">

                value={locationData.nama_lokasi}

                onChange={(e) => setLocationData(prev => ({ ...prev, nama_lokasi: e.target.value }))}      </div>        <Card>

                className="w-full"

              />          <CardContent className="p-6">

            </div>

            <div>      {/* Content */}            {isLoading ? (

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Description      <div className="p-6">              <div className="space-y-4">

              </label>

              <Input        <div className="max-w-4xl mx-auto">                {[...Array(5)].map((_, i) => (

                type="text"

                placeholder="Enter location description"          <div className="mb-6">                  <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">

                value={locationData.deskripsi}

                onChange={(e) => setLocationData(prev => ({ ...prev, deskripsi: e.target.value }))}            <p className="text-slate-600">                    <div className="space-y-2">

                className="w-full"

              />              Manage document storage locations. Each location can have a name, description, and capacity limit.                      <Skeleton className="h-4 w-48" />

            </div>

            <div>            </p>                      <Skeleton className="h-3 w-32" />

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Capacity          </div>                    </div>

              </label>

              <Input                    <Skeleton className="h-8 w-20" />

                type="number"

                placeholder="Enter capacity (optional)"          <Card>                  </div>

                value={locationData.kapasitas}

                onChange={(e) => setLocationData(prev => ({ ...prev, kapasitas: e.target.value }))}            <CardContent className="p-6">                ))}

                className="w-full"

              />              {isLoading ? (              </div>

            </div>

          </div>                <div className="space-y-4">            ) : (

          <DialogFooter>

            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>                  {[...Array(5)].map((_, i) => (              <div className="space-y-4">

              Cancel

            </Button>                    <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">                {shelves?.map((shelf) => (

            <Button 

              onClick={handleUpdate}                      <div className="flex-1">                  <div key={shelf.id_rak} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">

              disabled={!locationData.nama_lokasi.trim() || editMutation.isPending}

            >                        <Skeleton className="h-5 w-48 mb-2" />                    <div>

              {editMutation.isPending ? "Updating..." : "Update Location"}

            </Button>                        <Skeleton className="h-4 w-96" />                      <h3 className="font-medium text-slate-900">{shelf.nama_rak}</h3>

          </DialogFooter>

        </DialogContent>                      </div>                      <p className="text-sm text-slate-500">

      </Dialog>

    </div>                      <div className="flex space-x-2">                        Location: {shelf.lokasi || "Not specified"} • 

  );

}                        <Skeleton className="h-8 w-16" />                        Capacity: {shelf.kapasitas || "Unlimited"}

                        <Skeleton className="h-8 w-16" />                      </p>

                      </div>                    </div>

                    </div>                    {isAdmin && ( // <-- Only show Edit/Delete for admin

                  ))}                      <div className="flex space-x-2">

                </div>                        <Button variant="outline" size="sm" onClick={() => handleEditShelf(shelf)}>Edit</Button>

              ) : locations && locations.length > 0 ? (                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteShelf(shelf)}>Delete</Button>

                <div className="space-y-4">                      </div>

                  {locations.map((location) => (                    )}

                    <div key={location.id_lokasi} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">                  </div>

                      <div className="flex-1">                ))}

                        <h3 className="font-medium text-slate-900">{location.nama_lokasi}</h3>              </div>

                        <p className="text-sm text-slate-500 mt-1">            )}

                          Description: {location.deskripsi || "Not specified"} •           </CardContent>

                          Capacity: {location.kapasitas || "Unlimited"}        </Card>

                        </p>      </div>

                      </div>

                      {isAdmin && (      {/* Add Location Dialog */}

                        <div className="flex space-x-2">      {isAdmin && (

                          <Button variant="outline" size="sm" onClick={() => handleEditLocation(location)}>Edit</Button>        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>

                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteLocation(location)}>Delete</Button>          <DialogContent>

                        </div>            <DialogHeader>

                      )}              <DialogTitle>Add New Location</DialogTitle>

                    </div>            </DialogHeader>

                  ))}            <div className="space-y-4 mt-4">

                </div>              <div>

              ) : (                <label className="block text-sm font-medium text-slate-700 mb-2">Location Name *</label>

                <div className="text-center py-12">                <Input

                  <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />                  value={shelfData.nama_rak}

                  <h3 className="text-lg font-medium text-slate-900 mb-2">No locations found</h3>                  onChange={(e) => setShelfData(prev => ({ ...prev, nama_rak: e.target.value }))}

                  <p className="text-slate-500 mb-4">                  placeholder="Enter location name"

                    Get started by adding your first document location.                />

                  </p>              </div>

                  {isAdmin && (              <div>

                    <Button onClick={handleAddLocation}>                <label className="block text-sm font-medium text-slate-700 mb-2">Address/Description</label>

                      <Plus className="w-4 h-4 mr-2" />                <Input

                      Add Location                  value={shelfData.lokasi}

                    </Button>                  onChange={(e) => setShelfData(prev => ({ ...prev, lokasi: e.target.value }))}

                  )}                  placeholder="Enter location address or description"

                </div>                />

              )}              </div>

            </CardContent>              <div>

          </Card>                <label className="block text-sm font-medium text-slate-700 mb-2">Capacity</label>

        </div>                <Input

      </div>                  type="number"

                  value={shelfData.kapasitas}

      {/* Add Location Dialog */}                  onChange={(e) => setShelfData(prev => ({ ...prev, kapasitas: e.target.value }))}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>                  placeholder="Enter capacity (optional)"

        <DialogContent className="sm:max-w-[500px]">                />

          <DialogHeader>              </div>

            <DialogTitle>Add New Location</DialogTitle>            </div>

          </DialogHeader>            <DialogFooter>

          <div className="space-y-4 py-4">              <Button onClick={handleSaveAdd} disabled={addMutation.isPending}>

            <div>                Save

              <label className="block text-sm font-medium text-slate-700 mb-2">              </Button>

                Location Name *            </DialogFooter>

              </label>          </DialogContent>

              <Input        </Dialog>

                type="text"      )}

                placeholder="Enter location name"

                value={locationData.nama_lokasi}      {/* Edit Location Dialog */}

                onChange={(e) => setLocationData(prev => ({ ...prev, nama_lokasi: e.target.value }))}      {isAdmin && (

                className="w-full"        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>

              />          <DialogContent>

            </div>            <DialogHeader>

            <div>              <DialogTitle>Edit Location</DialogTitle>

              <label className="block text-sm font-medium text-slate-700 mb-2">            </DialogHeader>

                Description            <div className="space-y-4 mt-4">

              </label>              <div>

              <Input                <label className="block text-sm font-medium text-slate-700 mb-2">Location Name *</label>

                type="text"                <Input

                placeholder="Enter location description"                  value={shelfData.nama_rak}

                value={locationData.deskripsi}                  onChange={(e) => setShelfData(prev => ({ ...prev, nama_rak: e.target.value }))}

                onChange={(e) => setLocationData(prev => ({ ...prev, deskripsi: e.target.value }))}                  placeholder="Enter location name"

                className="w-full"                />

              />              </div>

            </div>              <div>

            <div>                <label className="block text-sm font-medium text-slate-700 mb-2">Address/Description</label>

              <label className="block text-sm font-medium text-slate-700 mb-2">                <Input

                Capacity                  value={shelfData.lokasi}

              </label>                  onChange={(e) => setShelfData(prev => ({ ...prev, lokasi: e.target.value }))}

              <Input                  placeholder="Enter location address or description"

                type="number"                />

                placeholder="Enter capacity (optional)"              </div>

                value={locationData.kapasitas}              <div>

                onChange={(e) => setLocationData(prev => ({ ...prev, kapasitas: e.target.value }))}                <label className="block text-sm font-medium text-slate-700 mb-2">Capacity</label>

                className="w-full"                <Input

              />                  type="number"

            </div>                  value={shelfData.kapasitas}

          </div>                  onChange={(e) => setShelfData(prev => ({ ...prev, kapasitas: e.target.value }))}

          <DialogFooter>                  placeholder="Enter capacity (optional)"

            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>                />

              Cancel              </div>

            </Button>            </div>

            <Button             <DialogFooter>

              onClick={handleSubmit}              <Button onClick={handleSaveEdit} disabled={editMutation.isPending}>

              disabled={!locationData.nama_lokasi.trim() || addMutation.isPending}                Save

            >              </Button>

              {addMutation.isPending ? "Adding..." : "Add Location"}            </DialogFooter>

            </Button>          </DialogContent>

          </DialogFooter>        </Dialog>

        </DialogContent>      )}

      </Dialog>    </div>

  );

      {/* Edit Location Dialog */}}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location Name *
              </label>
              <Input
                type="text"
                placeholder="Enter location name"
                value={locationData.nama_lokasi}
                onChange={(e) => setLocationData(prev => ({ ...prev, nama_lokasi: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <Input
                type="text"
                placeholder="Enter location description"
                value={locationData.deskripsi}
                onChange={(e) => setLocationData(prev => ({ ...prev, deskripsi: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Capacity
              </label>
              <Input
                type="number"
                placeholder="Enter capacity (optional)"
                value={locationData.kapasitas}
                onChange={(e) => setLocationData(prev => ({ ...prev, kapasitas: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={!locationData.nama_lokasi.trim() || editMutation.isPending}
            >
              {editMutation.isPending ? "Updating..." : "Update Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}