import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertTriangle className="h-24 w-24 text-danger glow-danger" />
        </div>
        <div>
          <h1 className="text-6xl font-bold mb-4 text-danger">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            The requested resource could not be found in the AML system database.
          </p>
        </div>
        <Button 
          asChild 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <a href="/" className="inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return to Control Center
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
