import { useState } from "react";
import { Shield, AlertTriangle, TrendingUp, Database } from "lucide-react";
import { CSVUpload } from "./CSVUpload";
import { SuspiciousTransactionsTable, Transaction } from "./SuspiciousTransactionsTable";
import { TransactionSimulator } from "./TransactionSimulator";
import { GraphVisualization } from "./GraphVisualization";
import { ReportGenerator } from "./ReportGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock API functions - replace with actual API calls
const mockPredict = async (data: any[]): Promise<Transaction[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock suspicious transactions
  return data.slice(0, Math.min(10, data.length)).map((row, index) => ({
    id: `TXN-${String(index + 1).padStart(6, '0')}`,
    amount: parseFloat(row.amount || Math.random() * 100000),
    from_account: row.from_account || `ACC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    to_account: row.to_account || `ACC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    timestamp: row.timestamp || new Date().toISOString(),
    risk_score: Math.random(),
    risk_level: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW' as 'HIGH' | 'MEDIUM' | 'LOW',
    reason_codes: ['LARGE_AMOUNT', 'UNUSUAL_PATTERN', 'CROSS_BORDER'].slice(0, Math.floor(Math.random() * 3) + 1),
    status: 'FLAGGED' as const
  }));
};

const mockSimulate = async (transaction: any) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const risk_score = Math.random();
  const risk_level = risk_score > 0.7 ? 'HIGH' : risk_score > 0.4 ? 'MEDIUM' : 'LOW' as 'HIGH' | 'MEDIUM' | 'LOW';
  
  return {
    risk_score,
    risk_level,
    risk_factors: ['LARGE_AMOUNT', 'UNUSUAL_TIME', 'NEW_RECIPIENT'].slice(0, Math.floor(Math.random() * 3) + 1),
    explanation: `This transaction has a ${risk_level.toLowerCase()} risk profile based on amount, timing, and recipient analysis.`
  };
};

const mockGenerateReport = async (): Promise<Blob> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create a mock PDF blob
  const pdfContent = new Blob(['Mock PDF Report Content'], { type: 'application/pdf' });
  return pdfContent;
};

export const AMLDashboard = () => {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [suspiciousTransactions, setSuspiciousTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  const handleDataUpload = async (data: any[]) => {
    setUploadedData(data);
    setIsProcessing(true);
    
    try {
      const suspicious = await mockPredict(data);
      setSuspiciousTransactions(suspicious);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${suspicious.length} suspicious transactions`
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze transactions",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    toast({
      title: "Transaction Details",
      description: `Viewing details for ${transaction.id}`
    });
  };

  // Mock graph data based on suspicious transactions
  const graphNodes = suspiciousTransactions.map((tx, index) => ({
    id: tx.from_account,
    label: tx.from_account,
    risk_level: tx.risk_level,
    account_type: 'Standard',
    total_volume: tx.amount
  }));

  const graphEdges = suspiciousTransactions.map(tx => ({
    from: tx.from_account,
    to: tx.to_account,
    amount: tx.amount,
    suspicious: tx.risk_level === 'HIGH'
  }));

  const handleNodeClick = (nodeId: string) => {
    const relatedTransactions = suspiciousTransactions.filter(
      tx => tx.from_account === nodeId || tx.to_account === nodeId
    );
    toast({
      title: "Account Analysis",
      description: `${relatedTransactions.length} transactions involving ${nodeId}`
    });
  };

  const dashboardStats = [
    {
      title: "Total Transactions",
      value: uploadedData.length.toLocaleString(),
      icon: <Database className="h-5 w-5 text-muted-foreground" />,
      trend: "+12%"
    },
    {
      title: "Suspicious Flagged",
      value: suspiciousTransactions.length.toString(),
      icon: <AlertTriangle className="h-5 w-5 text-danger" />,
      trend: "-5%"
    },
    {
      title: "High Risk",
      value: suspiciousTransactions.filter(tx => tx.risk_level === 'HIGH').length.toString(),
      icon: <Shield className="h-5 w-5 text-danger" />,
      trend: "+8%"
    },
    {
      title: "Risk Score",
      value: suspiciousTransactions.length > 0 
        ? `${(suspiciousTransactions.reduce((acc, tx) => acc + tx.risk_score, 0) / suspiciousTransactions.length * 100).toFixed(1)}%`
        : "0%",
      icon: <TrendingUp className="h-5 w-5 text-warning" />,
      trend: "+3%"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-danger glow-danger" />
              <div>
                <h1 className="text-2xl font-bold">AML Control Center</h1>
                <p className="text-sm text-muted-foreground">Anti-Money Laundering Detection System</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-safe/10 text-safe border-safe">
              System Online
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="bg-surface-elevated border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  {stat.icon}
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <span className="text-safe">{stat.trend}</span>
                  <span className="text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <CSVUpload onUpload={handleDataUpload} isProcessing={isProcessing} />
            <TransactionSimulator onSimulate={mockSimulate} />
            <ReportGenerator 
              onGenerateReport={mockGenerateReport}
              transactionCount={uploadedData.length}
              suspiciousCount={suspiciousTransactions.length}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Graph Visualization */}
            <GraphVisualization
              nodes={graphNodes}
              edges={graphEdges}
              onNodeClick={handleNodeClick}
              isLoading={isProcessing}
            />

            {/* Suspicious Transactions Table */}
            <SuspiciousTransactionsTable
              transactions={suspiciousTransactions}
              onViewDetails={handleViewTransactionDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
};