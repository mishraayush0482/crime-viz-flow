import { useState } from "react";
import { FileDown, Download, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ReportGeneratorProps {
  onGenerateReport: () => Promise<Blob>;
  transactionCount: number;
  suspiciousCount: number;
}

export const ReportGenerator = ({ 
  onGenerateReport, 
  transactionCount, 
  suspiciousCount 
}: ReportGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const reportBlob = await onGenerateReport();
      
      // Create download link
      const url = URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AML_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "PDF report has been downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const reportStats = [
    {
      label: "Total Transactions",
      value: transactionCount.toLocaleString(),
      icon: <CheckCircle className="h-4 w-4 text-safe" />
    },
    {
      label: "Suspicious Transactions",
      value: suspiciousCount.toLocaleString(),
      icon: <FileDown className="h-4 w-4 text-danger" />
    },
    {
      label: "Risk Percentage",
      value: transactionCount > 0 ? `${((suspiciousCount / transactionCount) * 100).toFixed(1)}%` : "0%",
      icon: <Calendar className="h-4 w-4 text-warning" />
    }
  ];

  return (
    <Card className="bg-surface-elevated border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5 text-primary" />
          Suspicious Activity Report
        </CardTitle>
        <CardDescription>
          Generate comprehensive PDF report for regulatory compliance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Report Statistics */}
        <div className="grid grid-cols-1 gap-3">
          {reportStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
              <div className="flex items-center gap-2">
                {stat.icon}
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className="font-semibold font-mono">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Report Contents Preview */}
        <div className="text-sm text-muted-foreground bg-surface p-3 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">Report Contents:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Executive Summary</li>
            <li>Transaction Analysis Overview</li>
            <li>Detailed Suspicious Activity Findings</li>
            <li>Risk Assessment Matrix</li>
            <li>Network Visualization Charts</li>
            <li>Regulatory Compliance Notes</li>
          </ul>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateReport}
          disabled={isGenerating || suspiciousCount === 0}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              Generating PDF...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate PDF Report
            </div>
          )}
        </Button>

        {suspiciousCount === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Upload transaction data to generate reports
          </p>
        )}
      </CardContent>
    </Card>
  );
};