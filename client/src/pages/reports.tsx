import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <Button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center py-12 text-slate-500">
          Reports interface will be implemented here
        </div>
      </div>
    </div>
  );
}
