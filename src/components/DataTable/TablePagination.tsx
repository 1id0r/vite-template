// TablePagination.tsx - Pagination control
import React from 'react';
import { Group, Pagination, Text } from '@mantine/core';

interface TablePaginationProps {
  table: any;
}

export const TablePagination: React.FC<TablePaginationProps> = ({ table }) => {
  return (
    <Group justify="apart" mt="md">
      <Text size="sm">
        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
        to{' '}
        {Math.min(
          (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
          table.getPrePaginationRowModel().rows.length
        )}{' '}
        of {table.getPrePaginationRowModel().rows.length} records
      </Text>
      <Pagination
        total={table.getPageCount()}
        value={table.getState().pagination.pageIndex + 1}
        onChange={(page) => table.setPageIndex(page - 1)}
      />
    </Group>
  );
};
