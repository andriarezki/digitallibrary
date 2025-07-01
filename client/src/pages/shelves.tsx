import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Rak } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function ShelvesPage() {
  const { data: shelves, isLoading } = useQuery<Rak[]>({
    queryKey: ["/api/shelves"],
  });
  
  const { toast } = useToast();

  const handleAddShelf = () => {
    toast({
      title: "Add New Shelf",
      description: "Shelf management functionality will be implemented soon",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Shelves Management</h1>
          <Button 
            onClick={handleAddShelf}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Shelf
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
