import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Kategori } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

// Predefined categories list
const PREDEFINED_CATEGORIES = [
  "Book",
  "Journal", 
  "Proceeding",
  "Audio Visual",
  "Catalogue",
  "Flyer",
  "Training",
  "Poster", 
  "Thesis",
  "Report",
  "Newspaper"
];

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery<Kategori[]>({
    queryKey: ["/api/categories"],
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useUser();
  const isAdmin = user?.level === "admin";

  // State for dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Kategori | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Add category mutation
  const addMutation = useMutation({
    mutationFn: async (data: { nama_kategori: string }) =>
      apiRequest("POST", "/api/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setAddDialogOpen(false);
      setCategoryName("");
      toast({ title: "Category added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add category", variant: "destructive" });
    },
  });

  // Edit category mutation
  const editMutation = useMutation({
    mutationFn: async (data: { id: number; nama_kategori: string }) =>
      apiRequest("PATCH", `/api/categories/${data.id}`, { nama_kategori: data.nama_kategori }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setEditDialogOpen(false);
      setSelectedCategory(null);
      setCategoryName("");
      toast({ title: "Category updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update category", variant: "destructive" });
    },
  });

  // Delete category mutation (optional)
  const deleteMutation = useMutation({
    mutationFn: async (id: number) =>
      apiRequest("DELETE", `/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    },
  });

  // Handlers
  const handleAddCategory = () => {
    setCategoryName("");
    setIsCustomCategory(false);
    setAddDialogOpen(true);
  };

  const handleSaveAdd = () => {
    if (categoryName.trim()) {
      addMutation.mutate({ nama_kategori: categoryName });
    }
  };

  const handleEditCategory = (category: Kategori) => {
    setSelectedCategory(category);
    setCategoryName(category.nama_kategori);
    
    // Check if current category is one of the predefined ones
    const isPredefined = PREDEFINED_CATEGORIES.includes(category.nama_kategori);
    setIsCustomCategory(!isPredefined);
    
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedCategory && categoryName.trim()) {
      editMutation.mutate({ id: selectedCategory.id_kategori, nama_kategori: categoryName });
    }
  };

  const handleDeleteCategory = (category: Kategori) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(category.id_kategori);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Categories Management</h1>
          {isAdmin && (
            <Button 
              onClick={handleAddCategory}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
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
                {categories?.map((category) => (
                  <div key={category.id_kategori} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <h3 className="font-medium text-slate-900">{category.nama_kategori}</h3>
                      <p className="text-sm text-slate-500">ID: {category.id_kategori}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteCategory(category)}>Delete</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Category Dialog */}
  {isAdmin && (
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">
                  Category Type
                </label>
                <Select
                  value={isCustomCategory ? "custom" : "predefined"}
                  onValueChange={(value) => {
                    setIsCustomCategory(value === "custom");
                    if (value === "predefined") {
                      setCategoryName("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="predefined">Predefined Category</SelectItem>
                    <SelectItem value="custom">Custom Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isCustomCategory ? (
                <div>
                  <label className="text-sm font-medium text-slate-900 block mb-2">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter custom category name"
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-slate-900 block mb-2">
                    Select Predefined Category
                  </label>
                  <Select value={categoryName} onValueChange={setCategoryName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSaveAdd} disabled={addMutation.isPending || !categoryName.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Category Dialog */}
  {isAdmin && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">
                  Category Type
                </label>
                <Select
                  value={isCustomCategory ? "custom" : "predefined"}
                  onValueChange={(value) => {
                    setIsCustomCategory(value === "custom");
                    if (value === "predefined") {
                      // If switching to predefined, try to find matching predefined category
                      const matchingPredefined = PREDEFINED_CATEGORIES.find(cat => 
                        cat.toLowerCase() === categoryName.toLowerCase()
                      );
                      setCategoryName(matchingPredefined || "");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="predefined">Predefined Category</SelectItem>
                    <SelectItem value="custom">Custom Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isCustomCategory ? (
                <div>
                  <label className="text-sm font-medium text-slate-900 block mb-2">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter custom category name"
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-slate-900 block mb-2">
                    Select Predefined Category
                  </label>
                  <Select value={categoryName} onValueChange={setCategoryName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit} disabled={editMutation.isPending || !categoryName.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
