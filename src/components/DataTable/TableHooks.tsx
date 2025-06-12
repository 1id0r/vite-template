import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
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
import { DataItem, FolderState, isFolder, TableRow } from './types';

// Hook for managing table data and folder state
export const useTableData = () => {
  const [originalData, setOriginalData] = useState<DataItem[]>(() => generateMockData());

  const [folderState, setFolderState] = useState<FolderState>(() => {
    const saved = loadFolderState();
    return saved || createInitialFolderState(originalData);
  });

  const [displayData, setDisplayData] = useState<TableRow[]>([]);
  const [tableVersion, setTableVersion] = useState(0);

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

  const handleAddManualAlert = useCallback((alertData: Partial<DataItem>) => {
    const newAlert = alertData as DataItem;
    setOriginalData((prev) => [newAlert, ...prev]);

    setFolderState((prev) => ({
      ...prev,
      unassignedRows: [newAlert, ...prev.unassignedRows],
    }));
  }, []);

  return {
    originalData,
    setOriginalData,
    folderState,
    setFolderState,
    displayData,
    tableVersion,
    setTableVersion,
    handleAddManualAlert,
  };
};

// Hook for managing table state (filters, sorting, etc.)
export const useTableState = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

  return {
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
  };
};

// Hook for managing modal states
export const useModalStates = () => {
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [addToFolderModalOpen, setAddToFolderModalOpen] = useState(false);
  const [manualAlertModalOpen, setManualAlertModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return {
    createFolderModalOpen,
    setCreateFolderModalOpen,
    addToFolderModalOpen,
    setAddToFolderModalOpen,
    manualAlertModalOpen,
    setManualAlertModalOpen,
    selectedRow,
    setSelectedRow,
    modalOpen,
    setModalOpen,
  };
};

// Hook for managing context menu
export const useContextMenu = () => {
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [contextMenuRowId, setContextMenuRowId] = useState<string | null>(null);
  const [rowIdsToMove, setRowIdsToMove] = useState<string[]>([]);

  return {
    contextMenuPosition,
    setContextMenuPosition,
    contextMenuRowId,
    setContextMenuRowId,
    rowIdsToMove,
    setRowIdsToMove,
  };
};

// Hook for folder operations
export const useFolderOperations = (
  folderState: FolderState,
  setFolderState: React.Dispatch<React.SetStateAction<FolderState>>,
  originalData: DataItem[],
  setTableVersion: React.Dispatch<React.SetStateAction<number>>
) => {
  const handleCreateFolder = useCallback(
    (folderName: string) => {
      setFolderState((prev) => {
        const newState = createFolder(prev, folderName);
        setTableVersion((v) => v + 1);
        return newState;
      });
    },
    [setFolderState, setTableVersion]
  );

  const handleToggleFolderExpansion = useCallback(
    (folderId: string) => {
      setFolderState((prev) => toggleFolderExpansion(prev, folderId));
    },
    [setFolderState]
  );

  const handleRenameFolder = useCallback(
    (folderId: string, newName: string) => {
      setFolderState((prev) => renameFolder(prev, folderId, newName));
    },
    [setFolderState]
  );

  const handleDeleteFolder = useCallback(
    (folderId: string) => {
      setFolderState((prev) => deleteFolder(prev, folderId, originalData));
    },
    [setFolderState, originalData]
  );

  const handleMoveRowsToFolder = useCallback(
    (rowIds: string[], folderId: string) => {
      setFolderState((prev) => moveRowsToFolder(prev, rowIds, folderId));
    },
    [setFolderState]
  );

  // Drag and drop operations
  const handleMoveRowToFolder = useCallback(
    (rowId: string, folderId: string) => {
      setFolderState((prev) => moveRowsToFolder(prev, [rowId], folderId));
    },
    [setFolderState]
  );

  const handleMoveRowToUnassigned = useCallback(
    (rowId: string) => {
      setFolderState((prev) => {
        const folderContainingItem = prev.folders.find((folder) => folder.rowIds.includes(rowId));

        if (!folderContainingItem) {
          return prev;
        }

        const originalDataItem = originalData.find((item) => item.id === rowId);
        if (!originalDataItem) {
          return prev;
        }

        const newState = {
          ...prev,
          folders: prev.folders.map((folder) => {
            if (folder.id === folderContainingItem.id) {
              return {
                ...folder,
                rowIds: folder.rowIds.filter((id) => id !== rowId),
                criticalCount:
                  folder.criticalCount - (originalDataItem.severity === 'critical' ? 1 : 0),
                majorCount: folder.majorCount - (originalDataItem.severity === 'major' ? 1 : 0),
                warningCount:
                  folder.warningCount - (originalDataItem.severity === 'warning' ? 1 : 0),
                disabledCount:
                  folder.disabledCount - (originalDataItem.severity === 'disabled' ? 1 : 0),
              };
            }
            return folder;
          }),
          unassignedRows: [...prev.unassignedRows, originalDataItem],
        };

        setTableVersion((v) => v + 1);
        return newState;
      });
    },
    [setFolderState, originalData, setTableVersion]
  );

  return {
    handleCreateFolder,
    handleToggleFolderExpansion,
    handleRenameFolder,
    handleDeleteFolder,
    handleMoveRowsToFolder,
    handleMoveRowToFolder,
    handleMoveRowToUnassigned,
  };
};

// Hook for table instance and related computations
export const useTable = (
  displayData: TableRow[],
  columns: any[],
  tableState: ReturnType<typeof useTableState>
) => {
  const {
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
  } = tableState;

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
  });

  // Initialize column order
  useEffect(() => {
    if (table && !columnOrder.length) {
      const initialColumnOrder = table.getAllLeafColumns().map((column) => column.id);
      setColumnOrder(initialColumnOrder);
    }
  }, [table, columnOrder.length, setColumnOrder]);

  // Compute selection info
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

  // Get columns that can be hidden
  const allColumns = useMemo(
    () =>
      table.getAllColumns().filter((column) => {
        return (
          typeof column.accessorFn !== 'undefined' &&
          column.getCanHide() &&
          column.id !== 'select' &&
          column.id !== 'objectId' &&
          column.id !== 'description' &&
          column.id !== 'startTime'
        );
      }),
    [table]
  );

  const showAllColumns = useCallback(() => {
    setColumnVisibility({});
  }, [setColumnVisibility]);

  return {
    table,
    selectionInfo,
    allColumns,
    showAllColumns,
  };
};
