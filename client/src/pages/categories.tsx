import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Kategori } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery<Kategori[]>({
    queryKey: ["/api/categories"],
  });
  
  const { toast } = useToast();

  const handleAddCategory = () => {
    toast({
      title: "Add New Category",
      description: "Category management functionality will be implemented soon",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Categories Management</h1>
          <Button 
            onClick={handleAddCategory}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
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
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
