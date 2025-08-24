import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Memoized Badge component for status indicators
export const MemoizedBadge = React.memo<React.ComponentProps<typeof Badge>>(Badge);
MemoizedBadge.displayName = 'MemoizedBadge';

// Memoized Button component for actions
export const MemoizedButton = React.memo<React.ComponentProps<typeof Button>>(Button);
MemoizedButton.displayName = 'MemoizedButton';

// Memoized Card components
export const MemoizedCard = React.memo<React.ComponentProps<typeof Card>>(Card);
MemoizedCard.displayName = 'MemoizedCard';

export const MemoizedCardContent = React.memo<React.ComponentProps<typeof CardContent>>(CardContent);
MemoizedCardContent.displayName = 'MemoizedCardContent';

export const MemoizedCardHeader = React.memo<React.ComponentProps<typeof CardHeader>>(CardHeader);
MemoizedCardHeader.displayName = 'MemoizedCardHeader';

export const MemoizedCardTitle = React.memo<React.ComponentProps<typeof CardTitle>>(CardTitle);
MemoizedCardTitle.displayName = 'MemoizedCardTitle';