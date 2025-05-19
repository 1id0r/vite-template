// TableHeader.tsx - Table header with search and controls
import React from 'react';
import { IconSearch } from '@tabler/icons-react';
import { Group, Select, Text, TextInput } from '@mantine/core';
import { ColumnSelector } from './ColumnSelector';

interface TableHeaderProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  allColumns: any[];
  columnVisibility: any;
  setColumnVisibility: (visibility: any) => void;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  showAllColumns: () => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  globalFilter,
  setGlobalFilter,
  allColumns,
  columnVisibility,
  setColumnVisibility,
  columnOrder,
  setColumnOrder,
  showAllColumns,
  pageSize,
  setPageSize,
}) => {
  return (
    <Group mb="md" justify="apart">
      <Group>
        <TextInput
          placeholder="Search all columns..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.currentTarget.value)}
          leftSection={<IconSearch size={'16px'} />}
          style={{ width: '300px' }}
        />
        <ColumnSelector
          allColumns={allColumns}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          columnOrder={columnOrder}
          setColumnOrder={setColumnOrder}
          showAllColumns={showAllColumns}
        />
      </Group>

      <Group>
        <Text size="sm">Items per page:</Text>
        <Select
          value={String(pageSize)}
          onChange={(value) => {
            setPageSize(Number(value));
          }}
          data={['5', '10', '20', '50']}
          style={{ width: '80px' }}
        />
      </Group>
    </Group>
  );
};
