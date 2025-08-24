import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MemoizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const MemoizedCard: React.FC<MemoizedCardProps> = React.memo(({ 
  title, 
  children, 
  className,
  headerClassName,
  contentClassName 
}) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader className={headerClassName}>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
});

MemoizedCard.displayName = 'MemoizedCard';

export default MemoizedCard;