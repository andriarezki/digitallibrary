import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, FileText } from "lucide-react";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfPath?: string;
}

export function PDFViewer({ isOpen, onClose, title, pdfPath }: PDFViewerProps) {
  // Only show if pdfPath is truthy and ends with .pdf
  const isValidPdf = pdfPath && pdfPath.endsWith('.pdf');
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-[95vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-slate-900 truncate pr-4">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden p-2">
          {isValidPdf ? (
            <iframe
              src={`/api/pdfs/${pdfPath}`}
              className="w-full h-full border-0 rounded-lg shadow-sm"
              title={title}
              style={{ minHeight: '500px' }}
            />
          ) : (
            <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-lg text-slate-600 mb-2">PDF file not available</p>
                <p className="text-sm text-slate-500">
                  File: {pdfPath || "No file specified"}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
