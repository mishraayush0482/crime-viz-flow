import { useState } from "react";
import { AlertTriangle, Eye, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Transaction {
  id: string;
  amount: number;
  from_account: string;
  to_account: string;
  timestamp: string;
  risk_score: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  reason_codes: string[];
  status: 'FLAGGED' | 'CLEARED' | 'PENDING';
}

interface SuspiciousTransactionsTableProps {
  transactions: Transaction[];
  onViewDetails: (transaction: Transaction) => void;
}

export const SuspiciousTransactionsTable = ({ 
  transactions, 
  onViewDetails 
}: SuspiciousTransactionsTableProps) => {
  const [sortField, setSortField] = useState<keyof Transaction>('risk_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedTransactions = transactions
    .filter(tx => {
      const matchesSearch = 
        tx.from_account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to_account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRisk = filterRisk === 'all' || tx.risk_level === filterRisk;
      
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * multiplier;
      }
      
      return String(aVal).localeCompare(String(bVal)) * multiplier;
    });

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskRowClass = (level: string) => {
    switch (level) {
      case 'HIGH': return 'risk-high glow-danger';
      case 'MEDIUM': return 'risk-medium glow-warning';
      case 'LOW': return 'risk-low glow-safe';
      default: return '';
    }
  };

  const SortableHeader = ({ field, children }: { field: keyof Transaction; children: React.ReactNode }) => (
    <th 
      className="text-left p-3 cursor-pointer hover:bg-muted/10 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </th>
  );

  return (
    <Card className="bg-surface-elevated border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger" />
          Suspicious Transactions
        </CardTitle>
        <CardDescription>
          {filteredAndSortedTransactions.length} transactions flagged for review
        </CardDescription>
        
        {/* Filters */}
        <div className="flex gap-4 pt-4">
          <Input
            placeholder="Search accounts or transaction IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-surface border-border"
          />
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-40 bg-surface border-border">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="HIGH">High Risk</SelectItem>
              <SelectItem value="MEDIUM">Medium Risk</SelectItem>
              <SelectItem value="LOW">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-sm text-muted-foreground">
                <SortableHeader field="id">Transaction ID</SortableHeader>
                <SortableHeader field="amount">Amount</SortableHeader>
                <SortableHeader field="from_account">From</SortableHeader>
                <SortableHeader field="to_account">To</SortableHeader>
                <SortableHeader field="risk_score">Risk Score</SortableHeader>
                <SortableHeader field="risk_level">Risk Level</SortableHeader>
                <th className="text-left p-3">Reason Codes</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTransactions.map((tx) => (
                <tr 
                  key={tx.id} 
                  className={`border-b border-border hover:bg-muted/5 transition-all ${getRiskRowClass(tx.risk_level)}`}
                >
                  <td className="p-3 font-mono text-sm">{tx.id}</td>
                  <td className="p-3 font-mono">${tx.amount.toLocaleString()}</td>
                  <td className="p-3 font-mono text-sm truncate max-w-32">{tx.from_account}</td>
                  <td className="p-3 font-mono text-sm truncate max-w-32">{tx.to_account}</td>
                  <td className="p-3">
                    <span className="font-bold">{(tx.risk_score * 100).toFixed(1)}%</span>
                  </td>
                  <td className="p-3">
                    <Badge variant={getRiskBadgeVariant(tx.risk_level)} className="font-medium">
                      {tx.risk_level}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {tx.reason_codes.slice(0, 2).map((code, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {code}
                        </Badge>
                      ))}
                      {tx.reason_codes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{tx.reason_codes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewDetails(tx)}
                      className="hover:bg-primary/10 hover:border-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No suspicious transactions found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};