import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export interface CSVUploadProps {
  onUpload: (data: any[]) => void;
  isProcessing?: boolean;
}

export const CSVUpload = ({ onUpload, isProcessing = false }: CSVUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      processFile(droppedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
    }
  }, [toast]);

  const processFile = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            const row: any = { id: index + 1 };
            headers.forEach((header, i) => {
              row[header] = values[i] || '';
            });
            return row;
          });

        onUpload(data);
        toast({
          title: "File uploaded successfully",
          description: `Processed ${data.length} transactions`
        });
      } catch (error) {
        toast({
          title: "Error processing file",
          description: "Please check your CSV format",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const getStatusIcon = () => {
    if (isProcessing) return <div className="animate-spin h-5 w-5 border-2 border-warning rounded-full border-t-transparent" />;
    if (file) return <CheckCircle className="h-5 w-5 text-safe" />;
    return <Upload className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (isProcessing) return "Processing...";
    if (file) return file.name;
    return "Drop CSV file or click to browse";
  };

  return (
    <Card className="bg-surface-elevated border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Transaction Data Upload
        </CardTitle>
        <CardDescription>
          Upload your transaction CSV file for analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging 
              ? 'border-primary bg-primary/5 glow-danger' 
              : file 
                ? 'border-safe bg-safe/5 glow-safe'
                : 'border-border hover:border-muted-foreground bg-muted/5'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <div className="flex flex-col items-center gap-4">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium">{getStatusText()}</p>
              {!file && (
                <p className="text-xs text-muted-foreground mt-1">
                  CSV files with transaction data accepted
                </p>
              )}
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
              disabled={isProcessing}
            />
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={isProcessing}
              className="hover:bg-primary/10 hover:border-primary"
            >
              <label htmlFor="csv-upload" className="cursor-pointer">
                {file ? "Change File" : "Browse Files"}
              </label>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};