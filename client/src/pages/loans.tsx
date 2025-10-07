import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function LoansPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Loans Management</h1>
          <Button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Loan
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center py-12 text-slate-500">
          Loans management interface will be implemented later
        </div>
      </div>
    </div>
  );
}
