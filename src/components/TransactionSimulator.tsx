import { useState } from "react";
import { Calculator, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SimulationResult {
  risk_score: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_factors: string[];
  explanation: string;
}

interface TransactionSimulatorProps {
  onSimulate: (transaction: any) => Promise<SimulationResult>;
}

export const TransactionSimulator = ({ onSimulate }: TransactionSimulatorProps) => {
  const [formData, setFormData] = useState({
    amount: '',
    from_account: '',
    to_account: '',
    transaction_type: 'transfer'
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear result when inputs change
    setResult(null);
  };

  const handleSimulate = async () => {
    if (!formData.amount || !formData.from_account || !formData.to_account) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        timestamp: new Date().toISOString()
      };
      
      const simulationResult = await onSimulate(transaction);
      setResult(simulationResult);
    } catch (error) {
      toast({
        title: "Simulation Error",
        description: "Failed to analyze transaction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'HIGH': return <AlertTriangle className="h-5 w-5 text-danger" />;
      case 'MEDIUM': return <TrendingUp className="h-5 w-5 text-warning" />;
      case 'LOW': return <CheckCircle className="h-5 w-5 text-safe" />;
      default: return null;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-danger glow-danger';
      case 'MEDIUM': return 'text-warning glow-warning';
      case 'LOW': return 'text-safe glow-safe';
      default: return '';
    }
  };

  return (
    <Card className="bg-surface-elevated border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          What-If Simulator
        </CardTitle>
        <CardDescription>
          Test hypothetical transactions for risk assessment
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="amount" className="text-sm font-medium">
              Transaction Amount ($)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="10000"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="bg-surface border-border font-mono"
            />
          </div>
          
          <div>
            <Label htmlFor="from_account" className="text-sm font-medium">
              From Account
            </Label>
            <Input
              id="from_account"
              placeholder="ACC-001234"
              value={formData.from_account}
              onChange={(e) => handleInputChange('from_account', e.target.value)}
              className="bg-surface border-border font-mono"
            />
          </div>
          
          <div>
            <Label htmlFor="to_account" className="text-sm font-medium">
              To Account
            </Label>
            <Input
              id="to_account"
              placeholder="ACC-005678"
              value={formData.to_account}
              onChange={(e) => handleInputChange('to_account', e.target.value)}
              className="bg-surface border-border font-mono"
            />
          </div>
        </div>

        <Button 
          onClick={handleSimulate}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              Analyzing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Simulate Transaction
            </div>
          )}
        </Button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg border transition-all ${getRiskColor(result.risk_level)}`}>
            <div className="flex items-center gap-3 mb-3">
              {getRiskIcon(result.risk_level)}
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  Risk Assessment
                  <Badge variant={result.risk_level === 'HIGH' ? 'destructive' : result.risk_level === 'MEDIUM' ? 'secondary' : 'outline'}>
                    {result.risk_level}
                  </Badge>
                </h4>
                <p className="text-sm opacity-90">
                  Risk Score: {(result.risk_score * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            
            {result.risk_factors.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-2">Risk Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {result.risk_factors.map((factor, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm opacity-90 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};