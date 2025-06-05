import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconFolderPlus, IconX } from '@tabler/icons-react';
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
import {
  ActionIcon,
  Badge,
  Box,
  Checkbox,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
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

// Format date as d/m and hour:minute
function formatDateDMHour(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month} ${hour}:${minute}`;
}

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

  const [selectedRow, setSelectedRow] = useState<DataItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // State for context menu
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [contextMenuRowId, setContextMenuRowId] = useState<string | null>(null);

  // New state to hold row IDs to move to a folder (from selection or context menu)
  const [rowIdsToMove, setRowIdsToMove] = useState<string[]>([]);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const tableOuterContainerRef = useRef<HTMLDivElement>(null);

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
        header: () => null,
        cell: ({ row }: any) => {
          if (isFolder(row.original)) return null;
          return (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              size="sm"
              onClick={(e) => e.stopPropagation()}
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
        enableColumnFilter: false,
        size: 250,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.lastUpdated), {
        id: 'lastUpdated',
        header: 'עודכן לאחרונה',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return <Text color="black">{formatDateDMHour(info.getValue())}</Text>;
        },
        enableColumnFilter: true,
        size: 150,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.startTime), {
        id: 'startTime',
        header: 'זמן התחלה',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return <Text color="black">{formatDateDMHour(info.getValue())}</Text>;
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
      table
        .getHeaderGroups()[0]
        ?.headers.filter((header) => header.column.getIsVisible())
        .reduce((sum, header) => sum + header.getSize(), 0) || 0,
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

  // Helper to get row info for modal (on left click)
  const handleRowClick = (row: TableRow) => {
    if (!isFolder(row)) {
      setSelectedRow(row as DataItem);
      setModalOpen(true);
    }
  };

  // Handle right-click on a row to open context menu
  const handleContextMenu = (event: React.MouseEvent, rowId: string) => {
    event.preventDefault(); // Prevent default browser context menu
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuRowId(rowId);
  };

  // Handle Add to Folder action from context menu
  const handleAddToFolderFromContextMenu = () => {
    if (contextMenuRowId) {
      // Combine currently selected rows with the right-clicked row
      const currentSelectionIds = Object.keys(rowSelection); // Get IDs from rowSelection state
      const idsToMove = new Set([...currentSelectionIds, contextMenuRowId]);
      setRowIdsToMove(Array.from(idsToMove));
      setAddToFolderModalOpen(true);
    }
    setContextMenuPosition(null); // Close the context menu
    setContextMenuRowId(null);
  };

  // Handle Remove from Folder action
  const handleRemoveFromFolder = useCallback(
    (rowId: string) => {
      setFolderState((prev) => {
        // Find the folder the item is in
        const folderContainingItem = prev.folders.find((folder) => folder.rowIds.includes(rowId));

        if (!folderContainingItem) {
          // Item is not in a folder, do nothing
          return prev;
        }

        // Find the original data item to get its severity for count updates
        const originalDataItem = originalData.find((item) => item.id === rowId);

        const newState = {
          ...prev,
          folders: prev.folders.map((folder) => {
            if (folder.id === folderContainingItem.id) {
              // Remove the item from the folder's rowIds list and update counts
              return {
                ...folder,
                rowIds: folder.rowIds.filter((id) => id !== rowId),
                criticalCount:
                  folder.criticalCount - (originalDataItem?.severity === 'critical' ? 1 : 0),
                majorCount: folder.majorCount - (originalDataItem?.severity === 'major' ? 1 : 0),
                warningCount:
                  folder.warningCount - (originalDataItem?.severity === 'warning' ? 1 : 0),
              };
            }
            return folder;
          }),
          unassignedRows: [
            ...prev.unassignedRows,
            originalDataItem!, // Add the item back to unassigned rows
          ].filter(Boolean) as DataItem[], // Filter out any undefined in case item is not found (shouldn't happen)
        };

        setTableVersion((v) => v + 1); // Trigger re-render
        return newState;
      });
      // Clear selection and context menu after action
      setRowSelection({});
      setContextMenuPosition(null);
      setContextMenuRowId(null);
    },
    [originalData] // Depend on originalData to find the severity
  );

  // Close context menu when clicking elsewhere
  useEffect(() => {
    if (!contextMenuPosition) return;

    const handleClick = () => {
      setContextMenuPosition(null);
      setContextMenuRowId(null);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenuPosition]);

  useEffect(() => {
    if (!tableOuterContainerRef.current) return;
    const handleResize = () => {
      setContainerWidth(tableOuterContainerRef.current?.offsetWidth || 0);
    };
    handleResize();
    const resizeObserver = new window.ResizeObserver(handleResize);
    resizeObserver.observe(tableOuterContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const tableWidth = Math.max(totalWidth, containerWidth);

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

      {modalOpen && selectedRow && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: 400,
            background: 'white',
            boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
            zIndex: 10,
            padding: 24,
            overflowY: 'auto',
            borderRadius: 0,
          }}
        >
          <Group justify="space-between" mb="md">
            <Text fw={700} size="lg">
              פרטי רשומה
            </Text>
            <ActionIcon onClick={() => setModalOpen(false)} variant="subtle">
              <IconX />
            </ActionIcon>
          </Group>
          <Stack gap="xs">
            <Text>שם יישות: {selectedRow.objectId}</Text>
            <Text>תיאור: {selectedRow.description}</Text>
            <Text>היררכיה: {selectedRow.hierarchy}</Text>
            <Text>עודכן לאחרונה: {formatDateDMHour(selectedRow.lastUpdated)}</Text>
            <Text>זמן התחלה: {formatDateDMHour(selectedRow.startTime)}</Text>
            <Text>סטטוס: {selectedRow.status}</Text>
            <Text>אימפקט עסקי: {selectedRow.impact}</Text>
            <Text>סביבה: {selectedRow.environment}</Text>
            <Text>מקור התראה: {selectedRow.origin}</Text>
            <Text>SN מזהה: {selectedRow.snId}</Text>
            <Text>מזהים: {selectedRow.identities?.join(', ')}</Text>
            <Text>חומרה: {selectedRow.severity}</Text>
          </Stack>
        </Box>
      )}

      {/* Context Menu */}
      {contextMenuPosition && (
        <Menu
          opened={!!contextMenuPosition}
          onClose={() => setContextMenuPosition(null)}
          position="bottom-start"
          offset={0} // Offset relative to mouse position
          styles={{
            dropdown: {
              // Use 'dropdown' key for styling the dropdown panel
              position: 'fixed',
              top: contextMenuPosition.y,
              left: contextMenuPosition.x,
              zIndex: 1000, // Ensure it's above other elements
            },
          }}
          withArrow
        >
          <Menu.Target>
            {/* This target is just to anchor the menu, not visible */}
            <div
              style={{
                position: 'fixed',
                top: contextMenuPosition.y,
                left: contextMenuPosition.x,
                width: 1,
                height: 1,
                zIndex: -1,
              }}
            />
          </Menu.Target>
          <Menu.Dropdown>
            {contextMenuRowId &&
              !folderState.folders.some((folder) => folder.rowIds.includes(contextMenuRowId)) && (
                <Menu.Item
                  leftSection={<IconFolderPlus size={14} />}
                  onClick={handleAddToFolderFromContextMenu}
                >
                  הוסף לתיקייה
                </Menu.Item>
              )}
            {contextMenuRowId &&
              folderState.folders.some((folder) => folder.rowIds.includes(contextMenuRowId)) && (
                <Menu.Item
                  leftSection={<IconX size={14} />}
                  onClick={() => handleRemoveFromFolder(contextMenuRowId)}
                >
                  הסר מתיקייה
                </Menu.Item>
              )}
            {/* Add other context menu items here */}
          </Menu.Dropdown>
        </Menu>
      )}

      <div
        ref={tableOuterContainerRef}
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
              width: totalWidth < containerWidth ? '100%' : `${totalWidth}px`,
              minWidth: 'unset',
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
              width: `${totalWidth}px`,
              minWidth: 'unset',
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
                    paddingBottom: '4px',
                    paddingRight: '0px',
                    transform: `translateY(${virtualRow.start}px) ${row.getIsSelected() ? 'scale(0.99)' : 'scale(1)'}`,
                    transition: 'opacity 0.1s ease, transform 0.1s ease',
                    cursor: !isRowFolder ? 'pointer' : undefined,
                  }}
                  onClick={() => handleRowClick(row.original)}
                  onContextMenu={(e) => !isRowFolder && handleContextMenu(e, row.original.id)} // Add right-click handler
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
            סה"כ {tableRows.length} רשומות
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
        onClose={() => {
          setAddToFolderModalOpen(false);
          // Clear temporary state used for context menu or header action
          setRowIdsToMove([]);
          setContextMenuRowId(null);
          setContextMenuPosition(null);
        }}
        onAddToFolder={(folderId) => {
          const idsToMove = rowIdsToMove.length > 0 ? rowIdsToMove : selectionInfo.selectedRowIds; // Use rowIdsToMove if set, otherwise use selectionInfo
          if (idsToMove.length > 0) {
            setFolderState((prev) => moveRowsToFolder(prev, idsToMove, folderId));
            // Always clear selection after adding to folder
            setRowSelection({});
          }
          setAddToFolderModalOpen(false);
          setRowIdsToMove([]); // Clear rowIdsToMove after action
          setContextMenuRowId(null); // Clear context menu row id
          setContextMenuPosition(null); // Clear context menu position
        }}
        folders={folderState.folders}
        selectedCount={
          rowIdsToMove.length > 0 ? rowIdsToMove.length : selectionInfo.selectedRowsCount
        } // Show count from rowIdsToMove or selectionInfo
      />
    </div>
  );
}
