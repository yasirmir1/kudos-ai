import React from 'react';

interface EmptyStateProps {
  message: string;
  submessage?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  submessage,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 text-muted-foreground/50">
          {icon}
        </div>
      )}
      <p className="text-base font-medium text-muted-foreground mb-2">{message}</p>
      {submessage && (
        <p className="text-sm text-muted-foreground/70">{submessage}</p>
      )}
    </div>
  );
};