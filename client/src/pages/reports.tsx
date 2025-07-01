import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
// Import jsPDF as a class
import jsPDF from "jspdf";
// Import autotable as a function and register it
import autoTable from "jspdf-autotable";

type Stats = {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  totalUsers: number;
  totalCategories: number;
  totalShelves: number;
};

type TopCategory = {
  id: number;
  name: string;
  count: number;
};

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const statsRes = await fetch("/api/dashboard/stats", { credentials: "include" });
      const statsData = await statsRes.json();
      setStats(statsData);

      const catRes = await fetch("/api/dashboard/top-categories", { credentials: "include" });
      const catData = await catRes.json();
      setTopCategories(catData);

      setLoading(false);
    }
    fetchData();
  }, []);

  const handleGenerateReport = () => {
    if (!stats) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Library Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Generated at: ${new Date().toLocaleString()}`, 20, 30);

    doc.setFontSize(14);
    doc.text("Summary:", 20, 45);

    doc.setFontSize(12);
    doc.text(`Total Books: ${stats.totalBooks}`, 30, 55);
    doc.text(`Available Books: ${stats.availableBooks}`, 30, 62);
    doc.text(`Borrowed Books: ${stats.borrowedBooks ?? (stats.totalBooks - stats.availableBooks)}`, 30, 69);
    doc.text(`Total Users: ${stats.totalUsers}`, 30, 76);
    doc.text(`Total Categories: ${stats.totalCategories}`, 30, 83);
    doc.text(`Total Shelves: ${stats.totalShelves}`, 30, 90);

    doc.setFontSize(14);
    doc.text("Top Categories:", 20, 105);

    // Table of top categories
    // @ts-ignore
    autoTable(doc, {
      startY: 110,
      head: [["#", "Category", "Book Count"]],
      body: topCategories.map((cat, idx) => [
        idx + 1,
        cat.name,
        cat.count,
      ]),
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 11 },
    });

    doc.save("library-report.pdf");
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <Button
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={handleGenerateReport}
            disabled={loading || !stats}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading report data...</div>
        ) : (
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Library Summary</h2>
            <ul className="mb-4 space-y-1">
              <li>Total Books: <b>{stats?.totalBooks}</b></li>
              <li>Available Books: <b>{stats?.availableBooks}</b></li>
              <li>Borrowed Books: <b>{stats?.borrowedBooks ?? (stats?.totalBooks - stats?.availableBooks)}</b></li>
              <li>Total Users: <b>{stats?.totalUsers}</b></li>
              <li>Total Categories: <b>{stats?.totalCategories}</b></li>
              <li>Total Shelves: <b>{stats?.totalShelves}</b></li>
            </ul>
            <h3 className="font-semibold mb-2">Top Categories</h3>
            <ol className="list-decimal list-inside">
              {topCategories.map((cat) => (
                <li key={cat.id}>{cat.name} ({cat.count} books)</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
