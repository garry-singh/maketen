import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface LoadingErrorViewProps {
  message?: string;
  showRefresh?: boolean;
}

const LoadingErrorView: React.FC<LoadingErrorViewProps> = ({
  message = "Loading puzzle...",
  showRefresh = false,
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <p className="mt-4 text-lg text-muted-foreground">{message}</p>
    {showRefresh && (
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh Page
      </Button>
    )}
  </div>
);

export default LoadingErrorView;
