// Updated DataTable.tsx with severity column and row coloring
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconCheck,
  IconChevronDown,
  IconColumns,
  IconFilter,
  IconGripVertical,
  IconListDetails,
  IconSearch,
} from '@tabler/icons-react';
import {
  Column,
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
  VisibilityState,
} from '@tanstack/react-table';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Menu,
  Pagination,
  Paper,
  Popover,
  rem,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';

// Define the data type for our table - update severity types
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
  isNew?: boolean;
  severity: 'warning' | 'major' | 'critical'; // Updated severity field
};

// Generate mock data
const generateMockData = (): DataItem[] => {
  const statuses = ['active', 'inactive', 'pending', 'resolved'] as const;
  const impacts = ['high', 'medium', 'low'] as const;
  const environments = ['production', 'staging', 'development'] as const;
  const severities = ['warning', 'major', 'critical'] as const; // New severity values

  return Array.from({ length: 50 }, (_, i) => ({
    id: `id-${i + 1}`,
    objectId: `OBJ-${Math.floor(10000 + Math.random() * 90000)}`,
    description: `Issue description for item ${i + 1} - This is a longer description to test the column width and text wrapping behavior`,
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
    severity: severities[Math.floor(Math.random() * severities.length)], // Add random severity
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

// New Severity Badge component
const SeverityBadge = ({ severity }: { severity: DataItem['severity'] }) => {
  const colorMap = {
    warning: 'blue',
    major: 'yellow',
    critical: 'red',
  };

  return (
    <Badge color={colorMap[severity]} variant="filled" radius="md" size="sm">
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};

// Create column definitions using a column helper
const columnHelper = createColumnHelper<DataItem>();

// Define the columns for our table with larger sizes
const columns = [
  columnHelper.accessor('objectId', {
    header: 'שם יישות',
    cell: (info) => (
      <Text c="grey" fw={600}>
        {info.getValue()}
      </Text>
    ),
    enableColumnFilter: true,
    size: 150,
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: (info) => (
      <Tooltip label={info.getValue()} multiline w={300} withArrow>
        <Text
          c="black"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '300px',
          }}
        >
          {info.getValue()}
        </Text>
      </Tooltip>
    ),
    enableColumnFilter: true,
    size: 300,
  }),
  columnHelper.accessor('hierarchy', {
    header: 'היררכיה',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    size: 250,
  }),
  columnHelper.accessor('lastUpdated', {
    header: 'עודכן לאחרונה',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    size: 150,
  }),
  columnHelper.accessor('startTime', {
    header: 'זמן התחלה',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    size: 150,
  }),
  columnHelper.accessor('status', {
    header: 'סטטוס',
    cell: (info) => <StatusBadge status={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
    size: 120,
  }),
  columnHelper.accessor('impact', {
    header: 'אימפקט עסקי',
    cell: (info) => <ImpactBadge impact={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
    size: 120,
  }),
  columnHelper.accessor('environment', {
    header: 'סביבה',
    cell: (info) => <EnvironmentBadge environment={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
    size: 150,
  }),
  columnHelper.accessor('origin', {
    header: 'מקור התראה',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    size: 120,
  }),
  columnHelper.accessor('snId', {
    header: 'SN מזהה',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    size: 150,
  }),
  columnHelper.accessor('identities', {
    header: 'Identities',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const identities = row.getValue(columnId) as string[];
      return identities.some((identity) =>
        identity.toLowerCase().includes(filterValue.toLowerCase())
      );
    },
    size: 250,
  }),
  // New Severity column
  columnHelper.accessor('severity', {
    header: 'חומרה',
    cell: (info) => <SeverityBadge severity={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
    size: 120,
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

    // Handle enum values like status, impact, environment, severity
    if (
      column.id === 'status' ||
      column.id === 'impact' ||
      column.id === 'environment' ||
      column.id === 'severity'
    ) {
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
    column.id === 'severity' ||
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
          <Stack>
            <Text size="sm">Filter {column.columnDef.header}</Text>
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
        <Stack gap="xs">
          <Text size="sm" fw={500}>
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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
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
      columnVisibility,
      pagination,
      columnOrder,
    },
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Enable column resizing
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  useEffect(() => {
    if (table && !columnOrder.length) {
      const initialColumnOrder = table.getAllLeafColumns().map((column) => column.id);
      setColumnOrder(initialColumnOrder);
    }
  }, [table]);

  // Calculate total width based on column sizes
  const totalWidth =
    table.getHeaderGroups()[0]?.headers.reduce((sum, header) => sum + header.getSize(), 0) || 0;

  // Column visibility controls
  const allColumns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());

  const showAllColumns = () => {
    setColumnVisibility({});
  };

  // const hasHiddenColumns = allColumns.some((column) => !column.getIsVisible());

  // Updated ColumnSelector component with fixed issues
  const ColumnSelector = () => {
    // Create a ref for the dropdown container
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Track if the dropdown is open
    const [opened, setOpened] = useState(false);

    // Check if any columns are hidden
    const hasHiddenColumns = allColumns.some((column) => !column.getIsVisible());

    // Handle column reordering
    const handleColumnReorder = (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(columnOrder);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setColumnOrder(items);
    };

    // Direct state update for column visibility
    const toggleColumnVisibility = (columnId: string) => {
      const newState = { ...columnVisibility };

      if (columnId in newState) {
        delete newState[columnId]; // Make visible
      } else {
        newState[columnId] = false; // Hide column
      }

      setColumnVisibility(newState);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setOpened(false);
        }
      }

      // Only add the event listener when the dropdown is open
      if (opened) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [opened]);

    return (
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <Button
          variant="outline"
          leftSection={<IconColumns size={16} />}
          rightSection={<IconChevronDown size={16} />}
          onClick={() => setOpened(!opened)}
        >
          עמודות
        </Button>

        {opened && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: 0,
              width: 280,
              backgroundColor: 'white',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            <div
              style={{ padding: 16, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text fw={600} size="sm">
                  הגדרות עמודות
                </Text>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    size="xs"
                    variant="subtle"
                    disabled={!hasHiddenColumns}
                    onClick={() => showAllColumns()}
                  >
                    אפס
                  </Button>
                  <Button
                    size="xs"
                    color="green"
                    variant="filled"
                    leftSection={<IconCheck size={14} />}
                    onClick={() => setOpened(false)}
                  >
                    אישור
                  </Button>
                </div>
              </div>
            </div>

            <div
              style={{
                maxHeight: '400px',
                overflow: 'auto',
                direction: 'rtl',
              }}
            >
              <DragDropContext onDragEnd={handleColumnReorder}>
                <Droppable droppableId="columns">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {allColumns.map((column, index) => {
                        const isVisible = !(column.id in columnVisibility);
                        const header =
                          typeof column.columnDef.header === 'string'
                            ? column.columnDef.header
                            : column.id;

                        return (
                          <Draggable key={column.id} draggableId={column.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{
                                  padding: '12px 16px',
                                  borderBottom: '1px solid #f0f0f0',
                                  backgroundColor: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => toggleColumnVisibility(column.id)}
                                  >
                                    <div
                                      style={{
                                        width: '18px',
                                        height: '18px',
                                        marginRight: '8px',
                                        border: '2px solid #228be6',
                                        borderRadius: '4px',
                                        backgroundColor: isVisible ? '#228be6' : 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                      }}
                                    >
                                      {isVisible && <IconCheck size={12} />}
                                    </div>
                                    <Text size="sm">{header}</Text>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <IconListDetails size={16} style={{ opacity: 0.5 }} />
                                  <div {...provided.dragHandleProps}>
                                    <IconGripVertical
                                      size={16}
                                      style={{ opacity: 0.5, cursor: 'grab' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <div style={{ width: '100%' }}>
      <Group mb="md" justify="apart">
        <Group>
          <TextInput
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.currentTarget.value)}
            leftSection={<IconSearch size={'16px'} />}
            style={{ width: '300px' }}
          />
          <ColumnSelector />
        </Group>

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
        <Group gap="xs" mb="md">
          <Text size="sm" fw={500}>
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

      {/* Single scrollable table container */}
      <div
        style={{
          width: '100%',
          border: '1px solid var(--mantine-color-gray-3)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '70vh',
            overflow: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <Table
            striped={false}
            highlightOnHover={false}
            withColumnBorders={false}
            style={{
              minWidth: `${totalWidth}px`,
              marginBottom: 0,
              borderCollapse: 'separate',
              borderSpacing: '0 8px',
            }}
          >
            <thead
              style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'transparent',
                zIndex: 10,
              }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        cursor: 'pointer',
                        position: 'relative',
                        width: `${header.getSize()}px`,
                        minWidth: `${header.getSize()}px`,
                        maxWidth: `${header.getSize()}px`,
                        padding: '12px 16px',
                        fontWeight: 500,
                        backgroundColor: 'transparent',
                        borderRight: '1px solid black',
                        // borderBottom: '2px solid black',
                        userSelect: 'none',
                        textAlign: 'left',
                      }}
                    >
                      <Group justify="apart" wrap="nowrap">
                        <Box onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === 'asc' && ' ↑'}
                          {header.column.getIsSorted() === 'desc' && ' ↓'}
                        </Box>
                        {header.column.getCanFilter() && (
                          <ColumnFilter column={header.column} table={table} />
                        )}
                      </Group>

                      {/* Column resizer */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            height: '100%',
                            width: '2px',
                            background: 'transparent',
                            cursor: 'col-resize',
                            userSelect: 'none',
                            touchAction: 'none',
                            color: 'black',
                            zIndex: 1,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'grey';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                // Set background color based on severity instead of impact
                const severity = row.original.severity;
                let rowStyle = {};

                // Color rows based on severity
                if (severity === 'critical') {
                  rowStyle = {
                    backgroundColor: '#ffebee', // Light red for critical severity
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  };
                } else if (severity === 'major') {
                  rowStyle = {
                    backgroundColor: '#fffde7', // Light yellow for major severity
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  };
                } else if (severity === 'warning') {
                  rowStyle = {
                    backgroundColor: '#e3f2fd', // Light blue for warning severity
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  };
                } else {
                  rowStyle = {
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  };
                }

                return (
                  <tr
                    key={row.id}
                    style={{
                      ...rowStyle,
                      borderRadius: '8px',
                    }}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      // First cell in the row - apply left border radius
                      // Last cell in the row - apply right border radius
                      const isFirstCell = cellIndex === 0;
                      const isLastCell = cellIndex === row.getVisibleCells().length - 1;

                      return (
                        <td
                          key={cell.id}
                          style={{
                            width: `${cell.column.getSize()}px`,
                            minWidth: `${cell.column.getSize()}px`,
                            maxWidth: `${cell.column.getSize()}px`,
                            padding: '16px',
                            backgroundColor: 'inherit',
                            borderTopLeftRadius: isFirstCell ? '8px' : 0,
                            borderBottomLeftRadius: isFirstCell ? '8px' : 0,
                            borderTopRightRadius: isLastCell ? '8px' : 0,
                            borderBottomRightRadius: isLastCell ? '8px' : 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>

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
