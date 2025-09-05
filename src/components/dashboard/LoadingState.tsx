import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading..."
}) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
      <span className="text-base font-medium text-muted-foreground">{message}</span>
    </div>
  );
};