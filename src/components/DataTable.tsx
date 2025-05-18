// src/components/DataTable.tsx
import { useMemo, useState } from 'react';
import { IconChevronDown, IconFilter, IconSearch } from '@tabler/icons-react';
import {
  ColumnFiltersState,
  createColumnHelper,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Pagination,
  Popover,
  rem,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';

// Define the data type for our table
export type DataItem = {
  id: string;
  objectId: string;
  description: string;
  hierarchy: string;
  lastUpdated: string;
  startTime: string;
  status: 'active' | 'inactive' | 'pending' | 'resolved';
  impact: 'high' | 'medium' | 'low';
  environment: 'production' | 'staging' | 'development';
  origin: string;
  snId: string;
  identities: string[];
};

// Generate mock data
const generateMockData = (): DataItem[] => {
  const statuses = ['active', 'inactive', 'pending', 'resolved'] as const;
  const impacts = ['high', 'medium', 'low'] as const;
  const environments = ['production', 'staging', 'development'] as const;

  return Array.from({ length: 50 }, (_, i) => ({
    id: `id-${i + 1}`,
    objectId: `OBJ-${Math.floor(10000 + Math.random() * 90000)}`,
    description: `Issue description for item ${i + 1}`,
    hierarchy: `Root / Level ${Math.floor(Math.random() * 3) + 1} / Sublevel ${Math.floor(Math.random() * 5) + 1}`,
    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    startTime: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    impact: impacts[Math.floor(Math.random() * impacts.length)],
    environment: environments[Math.floor(Math.random() * environments.length)],
    origin: `System-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    snId: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
    identities: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      (_, j) => `Identity-${i}-${j}`
    ),
  }));
};

// Create status badge with appropriate color
const StatusBadge = ({ status }: { status: DataItem['status'] }) => {
  const colorMap = {
    active: 'green',
    inactive: 'gray',
    pending: 'yellow',
    resolved: 'blue',
  };

  return (
    <Badge color={colorMap[status]} variant="filled" radius="md" size="sm">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Create impact badge with appropriate color
const ImpactBadge = ({ impact }: { impact: DataItem['impact'] }) => {
  const colorMap = {
    high: 'red',
    medium: 'orange',
    low: 'blue',
  };

  return (
    <Badge color={colorMap[impact]} variant="filled" radius="md" size="sm">
      {impact.charAt(0).toUpperCase() + impact.slice(1)}
    </Badge>
  );
};

// Create environment badge with appropriate color
const EnvironmentBadge = ({ environment }: { environment: DataItem['environment'] }) => {
  const colorMap = {
    production: 'purple',
    staging: 'cyan',
    development: 'indigo',
  };

  return (
    <Badge color={colorMap[environment]} variant="filled" radius="md" size="sm">
      {environment.charAt(0).toUpperCase() + environment.slice(1)}
    </Badge>
  );
};

// Create column definitions using a column helper
const columnHelper = createColumnHelper<DataItem>();

// Define the columns for our table
const columns = [
  columnHelper.accessor('objectId', {
    header: 'Object ID',
    cell: (info) => info.getValue(),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: (info) => <Text lineClamp={2}>{info.getValue()}</Text>,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('hierarchy', {
    header: 'Hierarchy',
    cell: (info) => info.getValue(),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('lastUpdated', {
    header: 'Last Updated',
    cell: (info) => info.getValue(),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('startTime', {
    header: 'Start Time',
    cell: (info) => info.getValue(),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
  }),
  columnHelper.accessor('impact', {
    header: 'Impact',
    cell: (info) => <ImpactBadge impact={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
  }),
  columnHelper.accessor('environment', {
    header: 'Environment',
    cell: (info) => <EnvironmentBadge environment={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
  }),
  columnHelper.accessor('origin', {
    header: 'Origin',
    cell: (info) => info.getValue(),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('snId', {
    header: 'SN ID',
    cell: (info) => info.getValue(),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('identities', {
    header: 'Identities',
    cell: (info) => info.getValue().join(', '),
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const identities = row.getValue(columnId) as string[];
      return identities.some((identity) =>
        identity.toLowerCase().includes(filterValue.toLowerCase())
      );
    },
  }),
];

// Filter component for text columns
const ColumnFilter = ({ column, table }: { column: any; table: any }) => {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  // Get unique values for select filters
  const uniqueValues = useMemo(() => {
    // Handle arrays like identities
    if (Array.isArray(firstValue)) {
      return Array.from(
        new Set(
          table.getPreFilteredRowModel().flatRows.flatMap((row: any) => row.getValue(column.id))
        )
      ).sort();
    }

    // Handle enum values like status, impact, environment
    if (column.id === 'status' || column.id === 'impact' || column.id === 'environment') {
      return Array.from(
        new Set(table.getPreFilteredRowModel().flatRows.map((row: any) => row.getValue(column.id)))
      ).sort();
    }

    return [];
  }, [column.id, firstValue, table]);

  // For enum columns, use a select input
  if (
    column.id === 'status' ||
    column.id === 'impact' ||
    column.id === 'environment' ||
    Array.isArray(firstValue)
  ) {
    return (
      <Popover position="bottom" shadow="md" withinPortal>
        <Popover.Target>
          <ActionIcon size="sm" variant="subtle" color="gray">
            <IconFilter size={16} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack spacing="xs">
            <Text size="sm" weight={500}>
              Filter {column.columnDef.header}
            </Text>
            <Select
              placeholder="Select value"
              value={columnFilterValue?.toString() || ''}
              onChange={(value) => column.setFilterValue(value || undefined)}
              data={[
                { value: '', label: 'All' },
                ...uniqueValues.map((value: any) => ({
                  value: value.toString(),
                  label: Array.isArray(firstValue)
                    ? value
                    : value.charAt(0).toUpperCase() + value.slice(1),
                })),
              ]}
              searchable
              clearable
              size="xs"
              style={{ minWidth: '150px' }}
            />
          </Stack>
        </Popover.Dropdown>
      </Popover>
    );
  }

  // Default text filter for other columns
  return (
    <Popover position="bottom" shadow="md" withinPortal>
      <Popover.Target>
        <ActionIcon size="sm" variant="subtle" color="gray">
          <IconFilter size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack spacing="xs">
          <Text size="sm" weight={500}>
            Filter {column.columnDef.header}
          </Text>
          <TextInput
            placeholder="Filter..."
            value={(columnFilterValue ?? '') as string}
            onChange={(e) => column.setFilterValue(e.target.value)}
            size="xs"
            style={{ minWidth: '150px' }}
          />
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export function DataTable() {
  const [data] = useState<DataItem[]>(() => generateMockData());
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <Group mb="md" justify="apart">
        <TextInput
          placeholder="Search all columns..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.currentTarget.value)}
          icon={<IconSearch size={rem(16)} />}
          style={{ width: '300px' }}
        />
        <Group>
          <Text size="sm">Items per page:</Text>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onChange={(value) => {
              table.setPageSize(Number(value));
            }}
            data={['5', '10', '20', '50']}
            style={{ width: '80px' }}
          />
        </Group>
      </Group>

      {/* Active filters display */}
      {table.getState().columnFilters.length > 0 && (
        <Group spacing="xs" mb="md">
          <Text size="sm" weight={500}>
            Active filters:
          </Text>
          {table.getState().columnFilters.map((filter) => {
            const column = table.getColumn(filter.id);
            const columnName = column?.columnDef?.header as string;
            return (
              <Badge
                key={filter.id}
                rightSection={
                  <ActionIcon
                    size="xs"
                    radius="xl"
                    variant="transparent"
                    onClick={() => column?.setFilterValue(undefined)}
                  >
                    ×
                  </ActionIcon>
                }
              >
                {columnName}: {filter.value as string}
              </Badge>
            );
          })}
          <Button variant="subtle" size="xs" onClick={() => setColumnFilters([])}>
            Clear All
          </Button>
        </Group>
      )}

      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        style={{
          tableLayout: 'fixed',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        sx={{
          '& tbody tr': {
            borderBottom: '1px solid var(--mantine-color-gray-3)',
          },
          '& tbody tr:last-of-type': {
            borderBottom: 'none',
          },
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    padding: '14px 16px',
                    fontWeight: 600,
                    backgroundColor: 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Group justify="apart">
                    <Box onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' ↑'}
                      {header.column.getIsSorted() === 'desc' && ' ↓'}
                    </Box>
                    {header.column.getCanFilter() && (
                      <ColumnFilter column={header.column} table={table} />
                    )}
                  </Group>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    padding: '12px 16px',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

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
    </div>
  );
}
