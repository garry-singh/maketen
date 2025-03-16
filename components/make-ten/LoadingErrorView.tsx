import React from "react";
import { Button } from "@/components/ui/button";

interface LoadingErrorViewProps {
  title?: string;
  message?: string;
  showRefresh?: boolean;
}

/**
 * Component to display loading states or errors
 */
const LoadingErrorView: React.FC<LoadingErrorViewProps> = ({
  title = "Make 10",
  message,
  showRefresh = false,
}) => (
  <div className="w-full max-w-4xl mx-auto px-4 py-8">
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{title}</h1>
        {message && <p className="text-lg text-destructive">{message}</p>}
        {showRefresh && (
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="lg"
          >
            Refresh Page
          </Button>
        )}
      </div>
    </div>
  </div>
);

export default LoadingErrorView;
