// DataTable.tsx - Main table component with folders and RTL support
import React, { useEffect, useState } from 'react';
import {
  ColumnFiltersState,
  createColumnHelper,
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
import { Box, Checkbox, Group, Table, Text, Tooltip } from '@mantine/core';
import { ActiveFilters } from './ActiveFilters';
import { EnvironmentBadge, ImpactBadge, SeverityBadge, StatusBadge } from './Badges';
import { ColumnFilter } from './ColumnFilter';
import { AddToFolderModal, CreateFolderModal, FolderRow } from './FolderComponents';
import {
  createFolder,
  createInitialFolderState,
  deleteFolder,
  generateTableRows,
  loadFolderState,
  moveRowsToFolder,
  renameFolder,
  saveFolderState,
  toggleFolderExpansion,
} from './FolderUtils';
import { generateMockData } from './mockData';
import { TableHeader } from './TableHeader';
import { TablePagination } from './TablePagination';
import {
  DataItem,
  FolderState,
  getFolderRowStyle,
  getRowStyleBySeverity,
  isFolder,
  TableRow,
} from './types';

export function DataTable() {
  // Original data
  const [originalData] = useState<DataItem[]>(() => generateMockData());

  // Folder state
  const [folderState, setFolderState] = useState<FolderState>(() => {
    const saved = loadFolderState();
    return saved || createInitialFolderState(originalData);
  });

  // Table display data
  const [displayData, setDisplayData] = useState<TableRow[]>([]);
  const [tableVersion, setTableVersion] = useState(0); // Force re-render counter

  // Table states
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

  // Modal states
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [addToFolderModalOpen, setAddToFolderModalOpen] = useState(false);

  // Update display data when folder state changes
  useEffect(() => {
    const rows = generateTableRows(folderState, originalData);
    console.log(
      'Updating display data:',
      rows.length,
      'rows',
      'folders:',
      folderState.folders.length
    );
    // Force a new array reference to trigger re-render
    setDisplayData([...rows]);
  }, [folderState, originalData]);

  // Save folder state to localStorage whenever it changes
  useEffect(() => {
    saveFolderState(folderState);
  }, [folderState]);

  // Create columns helper
  const columnHelper = createColumnHelper<TableRow>();

  // Create columns inline to handle TableRow type
  const columns = [
    // Selection column
    {
      id: 'select',
      header: ({ table }: any) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          size="sm"
        />
      ),
      cell: ({ row }: any) => {
        if (isFolder(row.original)) return null; // No checkbox for folders
        return (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            size="sm"
          />
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      size: 50,
    },
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.objectId), {
      id: 'objectId',
      header: 'שם יישות',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return (
          <Text c="grey" fw={600}>
            {info.getValue()}
          </Text>
        );
      },
      enableColumnFilter: true,
      size: 150,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.description), {
      id: 'description',
      header: 'תיאור',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return (
          <Tooltip label={info.getValue()} multiline w={300} withArrow>
            <Text
              c="black"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {info.getValue()}
            </Text>
          </Tooltip>
        );
      },
      enableColumnFilter: true,
      size: 300,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.hierarchy), {
      id: 'hierarchy',
      header: 'היררכיה',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return <Text color="black">{info.getValue()}</Text>;
      },
      enableColumnFilter: true,
      size: 250,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.lastUpdated), {
      id: 'lastUpdated',
      header: 'עודכן לאחרונה',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return <Text color="black">{info.getValue()}</Text>;
      },
      enableColumnFilter: true,
      size: 150,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.startTime), {
      id: 'startTime',
      header: 'זמן התחלה',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return <Text color="black">{info.getValue()}</Text>;
      },
      enableColumnFilter: true,
      size: 150,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.status), {
      id: 'status',
      header: 'סטטוס',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return <StatusBadge status={info.getValue() as DataItem['status']} />;
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || isFolder(row.original)) return true;
        const status = (row.original as DataItem).status;
        return status === filterValue;
      },
      size: 120,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.impact), {
      id: 'impact',
      header: 'אימפקט עסקי',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return <ImpactBadge impact={info.getValue() as DataItem['impact']} />;
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || isFolder(row.original)) return true;
        const impact = (row.original as DataItem).impact;
        return impact === filterValue;
      },
      size: 120,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.environment), {
      id: 'environment',
      header: 'סביבה',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return <EnvironmentBadge environment={info.getValue() as DataItem['environment']} />;
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || isFolder(row.original)) return true;
        const environment = (row.original as DataItem).environment;
        return environment === filterValue;
      },
      size: 150,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.origin), {
      id: 'origin',
      header: 'מקור התראה',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return <Text color="black">{info.getValue()}</Text>;
      },
      enableColumnFilter: true,
      size: 120,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.snId), {
      id: 'snId',
      header: 'SN מזהה',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return <Text color="black">{info.getValue()}</Text>;
      },
      enableColumnFilter: true,
      size: 150,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.identities), {
      id: 'identities',
      header: 'מזהים',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        const identities = info.getValue() as string[];
        return <Text color="black">{identities?.join(', ') || ''}</Text>;
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || isFolder(row.original)) return true;
        const identities = (row.original as DataItem).identities;
        return identities.some((identity) =>
          identity.toLowerCase().includes(filterValue.toLowerCase())
        );
      },
      size: 250,
    }),
    columnHelper.accessor((row) => (isFolder(row) ? '' : row.severity), {
      id: 'severity',
      header: 'חומרה',
      cell: (info) => {
        if (isFolder(info.row.original)) return null;
        return <SeverityBadge severity={info.getValue() as DataItem['severity']} />;
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || isFolder(row.original)) return true;
        const severity = (row.original as DataItem).severity;
        return severity === filterValue;
      },
      size: 120,
    }),
  ];

  const table = useReactTable<TableRow>({
    data: displayData,
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
    enableRowSelection: (row) => !isFolder(row.original), // Only allow data rows to be selected
    getRowId: (row) => row.id,
    // Force table to update when data changes
    autoResetPageIndex: false,
    manualPagination: false,
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
  const selectedRowIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);

  // Folder operations
  const handleCreateFolder = (folderName: string) => {
    console.log('Creating folder:', folderName);
    setFolderState((prev) => {
      const newState = createFolder(prev, folderName);
      console.log(
        'Previous folders:',
        prev.folders.length,
        'New folders:',
        newState.folders.length
      );
      // Force table re-render
      setTableVersion((v) => v + 1);
      // Force immediate localStorage save
      setTimeout(() => saveFolderState(newState), 0);
      return newState;
    });
  };

  const handleAddToFolder = (folderId: string) => {
    if (selectedRowIds.length > 0) {
      setFolderState((prev) => moveRowsToFolder(prev, selectedRowIds, folderId));
      setRowSelection({}); // Clear selection after moving
    }
  };

  const handleToggleFolderExpansion = (folderId: string) => {
    setFolderState((prev) => toggleFolderExpansion(prev, folderId));
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolderState((prev) => renameFolder(prev, folderId, newName));
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolderState((prev) => deleteFolder(prev, folderId, originalData));
  };

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
        data={originalData}
        // Folder props
        folders={folderState.folders}
        hasSelectedRows={selectedRowsCount > 0}
        onCreateFolder={() => setCreateFolderModalOpen(true)}
        onAddToFolder={() => setAddToFolderModalOpen(true)}
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
            key={`table-${tableVersion}`} // Force re-render when version changes
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
                        // Remove border but add subtle separator on hover
                        borderLeft: 'none',
                        userSelect: 'none',
                        textAlign: 'right',
                        direction: 'rtl',
                        // Add hover effect to show it's interactive
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
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
                              const delta = startX - moveEvent.clientX;
                              const newSize = Math.max(50, startSize + delta);

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
                              const delta = startX - moveEvent.touches[0].clientX;
                              const newSize = Math.max(50, startSize + delta);

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
                            left: 0,
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
                const isRowFolder = isFolder(row.original);
                const rowStyle = isRowFolder
                  ? getFolderRowStyle()
                  : getRowStyleBySeverity((row.original as DataItem).severity);

                // For folder rows, render special folder content
                if (isRowFolder) {
                  const folder = row.original;
                  const isExpanded = folderState.expandedFolders.has(folder.id);

                  return (
                    <tr key={row.id} style={{ ...rowStyle, borderRadius: '8px' }}>
                      <td
                        colSpan={row.getVisibleCells().length}
                        style={{
                          padding: '16px',
                          backgroundColor: 'inherit',
                          borderRadius: '8px',
                          textAlign: 'right',
                          direction: 'rtl',
                        }}
                      >
                        <FolderRow
                          folder={folder}
                          isExpanded={isExpanded}
                          onToggleExpansion={handleToggleFolderExpansion}
                          onRename={handleRenameFolder}
                          onDelete={handleDeleteFolder}
                        />
                      </td>
                    </tr>
                  );
                }

                // Regular data row
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
                      // Add indentation for rows inside folders
                      paddingLeft: (row.original as any).isInFolder ? '20px' : '0',
                    }}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
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
                            paddingRight:
                              (row.original as any).isInFolder && isFirstCell ? '40px' : '16px',
                            backgroundColor: 'inherit',
                            borderTopRightRadius: isFirstCell ? '8px' : 0,
                            borderBottomRightRadius: isFirstCell ? '8px' : 0,
                            borderTopLeftRadius: isLastCell ? '8px' : 0,
                            borderBottomLeftRadius: isLastCell ? '8px' : 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: 'right',
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

      {/* Modals */}
      <CreateFolderModal
        opened={createFolderModalOpen}
        onClose={() => setCreateFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      <AddToFolderModal
        opened={addToFolderModalOpen}
        onClose={() => setAddToFolderModalOpen(false)}
        onAddToFolder={handleAddToFolder}
        folders={folderState.folders}
        selectedCount={selectedRowsCount}
      />
    </div>
  );
}
