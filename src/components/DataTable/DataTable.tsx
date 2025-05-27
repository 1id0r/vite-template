import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Box, Checkbox, Group, Text, Tooltip } from '@mantine/core';
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
import {
  DataItem,
  FolderItem,
  FolderState,
  getFolderRowStyle,
  getRowStyleBySeverity,
  isFolder,
  TableRow,
} from './types';

export function DataTable() {
  const [originalData] = useState<DataItem[]>(() => generateMockData());

  const [folderState, setFolderState] = useState<FolderState>(() => {
    const saved = loadFolderState();
    return saved || createInitialFolderState(originalData);
  });

  const [displayData, setDisplayData] = useState<TableRow[]>([]);
  const [tableVersion, setTableVersion] = useState(0);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 1000,
  });

  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [addToFolderModalOpen, setAddToFolderModalOpen] = useState(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const memoizedDisplayData = useMemo(
    () => generateTableRows(folderState, originalData),
    [folderState, originalData]
  );

  useEffect(() => {
    setDisplayData(memoizedDisplayData);
  }, [memoizedDisplayData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => saveFolderState(folderState), 300);
    return () => clearTimeout(timeoutId);
  }, [folderState]);

  const columnHelper = useMemo(() => createColumnHelper<TableRow>(), []);

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }: any) => {
          const dataRows = table
            .getFilteredRowModel()
            .rows.filter((row: any) => !isFolder(row.original));
          const isAllDataRowsSelected =
            dataRows.length > 0 && dataRows.every((row: any) => row.getIsSelected());
          const isSomeDataRowsSelected = dataRows.some((row: any) => row.getIsSelected());

          return (
            <Checkbox
              checked={isAllDataRowsSelected}
              indeterminate={isSomeDataRowsSelected && !isAllDataRowsSelected}
              onChange={(event) => {
                dataRows.forEach((row: any) => {
                  row.toggleSelected(event.currentTarget.checked);
                });
              }}
              size="sm"
            />
          );
        },
        cell: ({ row }: any) => {
          if (isFolder(row.original)) return null;
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
        enableHiding: false,
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
        enableHiding: false,
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
          return <Text c="black">{info.getValue()}</Text>;
        },
        enableColumnFilter: true,
        size: 120,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.snId), {
        id: 'snId',
        header: 'SN מזהה',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return <Text c="black">{info.getValue()}</Text>;
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
          return <Text c="black">{identities?.join(', ') || ''}</Text>;
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
    ],
    [columnHelper]
  );

  const table = useReactTable<TableRow>({
    data: displayData,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnOrder,
      columnSizing,
    },
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
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    enableRowSelection: (row) => !isFolder(row.original),
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
  });

  const tableRows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: useCallback(() => 76, []),
    overscan: 5,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  useEffect(() => {
    if (table && !columnOrder.length) {
      const initialColumnOrder = table.getAllLeafColumns().map((column) => column.id);
      setColumnOrder(initialColumnOrder);
    }
  }, [table, columnOrder.length]);

  const totalWidth = useMemo(
    () =>
      table.getHeaderGroups()[0]?.headers.reduce((sum, header) => sum + header.getSize(), 0) || 0,
    [table]
  );

  const allColumns = useMemo(
    () =>
      table.getAllColumns().filter((column) => {
        return (
          typeof column.accessorFn !== 'undefined' &&
          column.getCanHide() &&
          column.id !== 'objectId' &&
          column.id !== 'description'
        );
      }),
    [table]
  );

  const showAllColumns = useCallback(() => {
    setColumnVisibility({});
  }, []);

  const selectionInfo = useMemo(() => {
    const allRows = table.getRowModel().rows;
    const dataRows = allRows.filter((row) => !isFolder(row.original));
    const selectedDataRows = dataRows.filter((row) => row.getIsSelected());

    const selectedRowsCount = selectedDataRows.length;
    const totalFilteredRows = table
      .getFilteredRowModel()
      .rows.filter((row) => !isFolder(row.original)).length;
    const selectedRowIds = selectedDataRows.map((row) => row.original.id);

    return { selectedRowsCount, totalFilteredRows, selectedRowIds };
  }, [table, rowSelection]);

  const handleCreateFolder = useCallback((folderName: string) => {
    setFolderState((prev) => {
      const newState = createFolder(prev, folderName);
      setTableVersion((v) => v + 1);
      return newState;
    });
  }, []);

  const handleAddToFolder = useCallback(
    (folderId: string) => {
      if (selectionInfo.selectedRowIds.length > 0) {
        setFolderState((prev) => moveRowsToFolder(prev, selectionInfo.selectedRowIds, folderId));
        setRowSelection({});
      }
    },
    [selectionInfo.selectedRowIds]
  );

  const handleToggleFolderExpansion = useCallback((folderId: string) => {
    setFolderState((prev) => toggleFolderExpansion(prev, folderId));
  }, []);

  const handleRenameFolder = useCallback((folderId: string, newName: string) => {
    setFolderState((prev) => renameFolder(prev, folderId, newName));
  }, []);

  const handleDeleteFolder = useCallback(
    (folderId: string) => {
      setFolderState((prev) => deleteFolder(prev, folderId, originalData));
    },
    [originalData]
  );

  return (
    <div style={{ width: '100%', direction: 'rtl' }}>
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
        folders={folderState.folders}
        hasSelectedRows={selectionInfo.selectedRowsCount > 0}
        onCreateFolder={() => setCreateFolderModalOpen(true)}
        onAddToFolder={() => setAddToFolderModalOpen(true)}
      />

      <ActiveFilters table={table} setColumnFilters={setColumnFilters} />

      <div
        style={{
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          direction: 'rtl',
        }}
      >
        <div
          ref={tableContainerRef}
          style={{
            width: '100%',
            height: '75vh',
            overflow: 'auto',
            direction: 'rtl',
            contain: 'strict',
            willChange: 'scroll-position',
          }}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 10,
              minWidth: `${totalWidth}px`,
              borderBottom: '1px solid #e9ecef',
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <div
                key={headerGroup.id}
                style={{
                  display: 'flex',
                  direction: 'rtl',
                }}
              >
                {headerGroup.headers.map((header) => (
                  <div
                    key={header.id}
                    style={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      position: 'relative',
                      width: `${header.getSize()}px`,
                      minWidth: `${header.getSize()}px`,
                      maxWidth: `${header.getSize()}px`,
                      padding: '12px 16px',
                      fontWeight: 500,
                      backgroundColor: 'white',
                      borderLeft: 'none',
                      userSelect: 'none',
                      textAlign: 'right',
                      direction: 'rtl',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <Box
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      style={{
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' ↑'}
                      {header.column.getIsSorted() === 'desc' && ' ↓'}
                    </Box>
                    <div style={{ flexShrink: 0 }}>
                      {header.column.getCanFilter() && (
                        <ColumnFilter column={header.column} table={table} />
                      )}
                    </div>

                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={(e) => {
                          const startX = e.clientX;
                          const startSize = header.getSize();
                          const columnId = header.column.id;

                          const onMouseMove = (moveEvent: MouseEvent) => {
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
                        style={{
                          position: 'absolute',
                          left: '-2px',
                          top: 0,
                          height: '100%',
                          width: '4px',
                          background: 'transparent',
                          cursor: 'col-resize',
                          userSelect: 'none',
                          touchAction: 'none',
                          zIndex: 1,
                          borderLeft: '2px solid transparent',
                          transition: 'border-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderLeft = '2px solid #228be6';
                          e.currentTarget.style.background = 'rgba(34, 139, 230, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderLeft = '2px solid transparent';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = tableRows[virtualRow.index];
              const isRowFolder = isFolder(row.original);
              const rowStyle = isRowFolder
                ? getFolderRowStyle()
                : getRowStyleBySeverity((row.original as DataItem).severity);

              return (
                <div
                  key={row.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    display: 'flex',
                    direction: 'rtl',
                    paddingBottom: '8px',
                    transform: `translateY(${virtualRow.start}px) ${row.getIsSelected() ? 'scale(0.99)' : 'scale(1)'}`,
                    transition: 'opacity 0.1s ease, transform 0.1s ease',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: 'calc(100% - 8px)',
                      display: 'flex',
                      direction: 'rtl',
                      ...rowStyle,
                      borderRadius: '8px',
                      opacity: row.getIsSelected() ? 0.8 : 1,
                    }}
                  >
                    {isRowFolder ? (
                      <div
                        style={{
                          width: '100%',
                          padding: '16px',
                          backgroundColor: 'inherit',
                          borderRadius: '8px',
                          textAlign: 'right',
                          direction: 'rtl',
                        }}
                      >
                        <FolderRow
                          folder={row.original as FolderItem}
                          isExpanded={folderState.expandedFolders.has(
                            (row.original as FolderItem).id
                          )}
                          onToggleExpansion={handleToggleFolderExpansion}
                          onRename={handleRenameFolder}
                          onDelete={handleDeleteFolder}
                        />
                      </div>
                    ) : (
                      row.getVisibleCells().map((cell, cellIndex) => {
                        const isFirstCell = cellIndex === 0;
                        const isLastCell = cellIndex === row.getVisibleCells().length - 1;

                        return (
                          <div
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
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Group justify="center" mt="md">
        {selectionInfo.selectedRowsCount > 0 ? (
          <Group mb="md" justify="flex-start">
            <Text size="sm" fw={500} c="blue">
              {selectionInfo.selectedRowsCount} נבחרו מתוך {selectionInfo.totalFilteredRows} רשומות
            </Text>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            סה"כ {tableRows.length - 1} רשומות
          </Text>
        )}
      </Group>

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
        selectedCount={selectionInfo.selectedRowsCount}
      />
    </div>
  );
}
