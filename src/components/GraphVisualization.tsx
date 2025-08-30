import { useState } from "react";
import { Network, Maximize, Minimize, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Node {
  id: string;
  label: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  account_type: string;
  total_volume: number;
}

interface Edge {
  from: string;
  to: string;
  amount: number;
  suspicious: boolean;
}

interface GraphVisualizationProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (nodeId: string) => void;
  isLoading?: boolean;
}

export const GraphVisualization = ({ 
  nodes, 
  edges, 
  onNodeClick, 
  isLoading = false 
}: GraphVisualizationProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    onNodeClick(node.id);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'border-danger bg-danger/20 text-danger';
      case 'MEDIUM': return 'border-warning bg-warning/20 text-warning';
      case 'LOW': return 'border-safe bg-safe/20 text-safe';
      default: return 'border-muted bg-muted/20 text-muted-foreground';
    }
  };

  const getNodeGlow = (level: string) => {
    switch (level) {
      case 'HIGH': return 'glow-danger';
      case 'MEDIUM': return 'glow-warning';
      case 'LOW': return 'glow-safe';
      default: return '';
    }
  };

  // Mock graph visualization - in real implementation this would render actual network graph
  const renderMockGraph = () => (
    <div className="relative h-full min-h-[400px] bg-surface rounded-lg overflow-hidden">
      {/* Grid background for crime map effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Mock nodes positioned across the visualization */}
      <div className="relative h-full p-6">
        {nodes.map((node, index) => {
          const x = 20 + (index % 4) * 20; // Distribute nodes across width
          const y = 20 + Math.floor(index / 4) * 25; // Distribute nodes down height
          
          return (
            <div
              key={node.id}
              className={`absolute cursor-pointer transition-all hover:scale-110 ${getNodeGlow(node.risk_level)}`}
              style={{ 
                left: `${x}%`, 
                top: `${y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleNodeClick(node)}
            >
              {/* Node circle */}
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getRiskColor(node.risk_level)}`}>
                <span className="text-xs font-bold">{node.label.slice(-3)}</span>
              </div>
              
              {/* Node label */}
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2 text-xs text-center">
                <div className="bg-surface-overlay px-2 py-1 rounded border border-border">
                  {node.label}
                </div>
              </div>
            </div>
          );
        })}

        {/* Mock edges/connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            
            const fromIndex = nodes.indexOf(fromNode);
            const toIndex = nodes.indexOf(toNode);
            
            const x1 = (20 + (fromIndex % 4) * 20) * 4; // Convert % to svg coordinates
            const y1 = (20 + Math.floor(fromIndex / 4) * 25) * 4;
            const x2 = (20 + (toIndex % 4) * 20) * 4;
            const y2 = (20 + Math.floor(toIndex / 4) * 25) * 4;
            
            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={edge.suspicious ? "hsl(var(--danger))" : "hsl(var(--safe))"}
                strokeWidth={edge.suspicious ? 3 : 1}
                strokeOpacity={0.6}
                className={edge.suspicious ? "animate-pulse" : ""}
              />
            );
          })}
        </svg>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading network visualization...</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Card className="bg-surface-elevated border-border h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Transaction Network
              </CardTitle>
              <CardDescription>
                Interactive visualization of account relationships and transaction flows
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hover:bg-primary/10 hover:border-primary"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1">
          {renderMockGraph()}
        </CardContent>

        {/* Node details panel */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 bg-surface-overlay border border-border rounded-lg p-4 min-w-64">
            <h4 className="font-semibold mb-2">Account Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Account:</span>
                <span className="font-mono">{selectedNode.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span>{selectedNode.account_type}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Volume:</span>
                <span className="font-mono">${selectedNode.total_volume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Risk Level:</span>
                <Badge variant={selectedNode.risk_level === 'HIGH' ? 'destructive' : selectedNode.risk_level === 'MEDIUM' ? 'secondary' : 'outline'}>
                  {selectedNode.risk_level}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};