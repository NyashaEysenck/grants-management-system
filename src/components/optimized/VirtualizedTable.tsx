import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
  }[];
  itemHeight?: number;
  maxVisibleItems?: number;
  className?: string;
}

function VirtualizedTable<T extends Record<string, any>>({ 
  data, 
  columns, 
  itemHeight = 60,
  maxVisibleItems = 10,
  className 
}: VirtualizedTableProps<T>) {
  const [startIndex, setStartIndex] = React.useState(0);
  
  const visibleData = useMemo(() => {
    const endIndex = Math.min(startIndex + maxVisibleItems, data.length);
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, maxVisibleItems]);

  const totalHeight = data.length * itemHeight;
  const visibleHeight = Math.min(maxVisibleItems * itemHeight, totalHeight);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    setStartIndex(newStartIndex);
  }, [itemHeight]);

  return (
    <div className={className}>
      <div 
        style={{ height: visibleHeight, overflow: 'auto' }}
        onScroll={handleScroll}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody style={{ height: totalHeight }}>
            {visibleData.map((item, index) => (
              <TableRow 
                key={index} 
                style={{ 
                  height: itemHeight,
                  transform: `translateY(${(startIndex + index) * itemHeight}px)`,
                  position: 'absolute',
                  width: '100%'
                }}
              >
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render 
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default React.memo(VirtualizedTable) as typeof VirtualizedTable;