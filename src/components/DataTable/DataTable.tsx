// DataTable.tsx - Main table component with row selection (RTL)
import React, { useEffect, useState } from 'react';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { Box, Group, Table, Text } from '@mantine/core';
import { ActiveFilters } from './ActiveFilters';
import { ColumnFilter } from './ColumnFilter';
import { createColumns } from './DataTableDefinition';
import { generateMockData } from './mockData';
import { TableHeader } from './TableHeader';
import { TablePagination } from './TablePagination';
import { DataItem, getRowStyleBySeverity } from './types';

export function DataTable() {
  const [data] = useState<DataItem[]>(() => generateMockData());
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Create columns
  const columns = createColumns();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      columnOrder,
      columnSizing,
    },
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: setColumnSizing,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Enable column resizing
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    // Enable row selection
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  useEffect(() => {
    if (table && !columnOrder.length) {
      const initialColumnOrder = table.getAllLeafColumns().map((column) => column.id);
      setColumnOrder(initialColumnOrder);
    }
  }, [table, columnOrder.length]);

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

  // Selection info
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalFilteredRows = table.getFilteredRowModel().rows.length;

  return (
    <div style={{ width: '100%', direction: 'rtl' }}>
      {/* Table Header */}
      <TableHeader
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        allColumns={allColumns}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        columnOrder={columnOrder}
        setColumnOrder={setColumnOrder}
        showAllColumns={showAllColumns}
        pageSize={pagination.pageSize}
        setPageSize={(size) => table.setPageSize(size)}
        table={table}
        data={data}
      />

      {/* Selection Info */}
      {selectedRowsCount > 0 && (
        <Group mb="md" justify="flex-start">
          <Text size="sm" fw={500} c="blue">
            {selectedRowsCount} נבחרו מתוך {totalFilteredRows} רשומות
          </Text>
        </Group>
      )}

      {/* Active Filters */}
      <ActiveFilters table={table} setColumnFilters={setColumnFilters} />

      {/* Table Container */}
      <div
        style={{
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          direction: 'rtl',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '75vh',
            overflow: 'auto',
            scrollbarWidth: 'thin',
            msOverflowStyle: 'none',
            direction: 'rtl',
          }}
        >
          <Table
            striped={false}
            highlightOnHover={false}
            withColumnBorders={true}
            style={{
              minWidth: `${totalWidth}px`,
              marginBottom: 0,
              borderCollapse: 'separate',
              borderSpacing: '0 8px',
              direction: 'rtl',
            }}
          >
            {/* Table Header */}
            <thead
              style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'mantine.grey.0',
                zIndex: 10,
              }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        position: 'relative',
                        width: `${header.getSize()}px`,
                        minWidth: `${header.getSize()}px`,
                        maxWidth: `${header.getSize()}px`,
                        padding: '12px 16px',
                        fontWeight: 500,
                        backgroundColor: 'transparent',
                        borderLeft: '1px solid black', // Changed from borderRight to borderLeft for RTL
                        userSelect: 'none',
                        textAlign: 'right', // Changed from left to right for RTL
                        direction: 'rtl',
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Box
                          onClick={
                            header.column.getCanSort()
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                          style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                        >
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
                          onMouseDown={(e) => {
                            // Custom resize handler for RTL
                            const startX = e.clientX;
                            const startSize = header.getSize();
                            const columnId = header.column.id;

                            const onMouseMove = (moveEvent: MouseEvent) => {
                              // Invert the delta for RTL behavior
                              const delta = startX - moveEvent.clientX; // Reversed for RTL
                              const newSize = Math.max(50, startSize + delta); // Minimum width of 50px

                              // Update column sizing state using table API
                              table.setColumnSizing((prev) => ({
                                ...prev,
                                [columnId]: newSize,
                              }));
                            };

                            const onMouseUp = () => {
                              document.removeEventListener('mousemove', onMouseMove);
                              document.removeEventListener('mouseup', onMouseUp);
                            };

                            document.addEventListener('mousemove', onMouseMove);
                            document.addEventListener('mouseup', onMouseUp);
                          }}
                          onTouchStart={(e) => {
                            // Custom touch handler for RTL
                            const startX = e.touches[0].clientX;
                            const startSize = header.getSize();
                            const columnId = header.column.id;

                            const onTouchMove = (moveEvent: TouchEvent) => {
                              // Invert the delta for RTL behavior
                              const delta = startX - moveEvent.touches[0].clientX; // Reversed for RTL
                              const newSize = Math.max(50, startSize + delta); // Minimum width of 50px

                              // Update column sizing state using table API
                              table.setColumnSizing((prev) => ({
                                ...prev,
                                [columnId]: newSize,
                              }));
                            };

                            const onTouchEnd = () => {
                              document.removeEventListener('touchmove', onTouchMove);
                              document.removeEventListener('touchend', onTouchEnd);
                            };

                            document.addEventListener('touchmove', onTouchMove);
                            document.addEventListener('touchend', onTouchEnd);
                          }}
                          style={{
                            position: 'absolute',
                            left: 0, // Changed from right to left for RTL
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
            {/* Table Body */}
            <tbody>
              {table.getRowModel().rows.map((row) => {
                // Get row style based on severity
                const rowStyle = getRowStyleBySeverity(row.original.severity);

                return (
                  <tr
                    key={row.id}
                    style={{
                      ...rowStyle,
                      borderRadius: '8px',
                      opacity: row.getIsSelected() ? 0.8 : 1,
                      transform: row.getIsSelected() ? 'scale(0.99)' : 'scale(1)',
                      transition: 'all 0.1s ease',
                      direction: 'rtl',
                    }}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      // First cell in the row (rightmost in RTL) - apply right border radius
                      // Last cell in the row (leftmost in RTL) - apply left border radius
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
                            // RTL: First cell gets right radius, last cell gets left radius
                            borderTopRightRadius: isFirstCell ? '8px' : 0,
                            borderBottomRightRadius: isFirstCell ? '8px' : 0,
                            borderTopLeftRadius: isLastCell ? '8px' : 0,
                            borderBottomLeftRadius: isLastCell ? '8px' : 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: 'right', // Right align text for RTL
                            direction: 'rtl',
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

      <TablePagination table={table} />
    </div>
  );
}
