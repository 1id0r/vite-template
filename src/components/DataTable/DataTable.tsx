// DataTable.tsx - Main table component (simplified)
import React, { useEffect, useState } from 'react';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
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

  return (
    <div style={{ width: '100%' }}>
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
      />

      {/* Active Filters */}
      <ActiveFilters table={table} setColumnFilters={setColumnFilters} />

      {/* Table Container */}
      <div
        style={{
          width: '100%',
          //   border: '1px solid var(--mantine-color-gray-3)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '75vh',
            overflow: 'auto',
            scrollbarWidth: 'thin',
            msOverflowStyle: 'none',
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
                        cursor: 'pointer',
                        position: 'relative',
                        width: `${header.getSize()}px`,
                        minWidth: `${header.getSize()}px`,
                        maxWidth: `${header.getSize()}px`,
                        padding: '12px 16px',
                        fontWeight: 500,
                        backgroundColor: 'transparent',
                        borderRight: '1px solid black',
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

      {/* Table Pagination */}
      <TablePagination table={table} />
    </div>
  );
}
