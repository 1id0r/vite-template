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
import { DataItem, FolderItem, FolderState, isFolder, TableRow } from './types';

// Default visible columns
const DEFAULT_VISIBLE_COLUMNS = [
  'select',
  'objectId',
  'description',
  'hierarchy',
  'startTime',
  'lastUpdated',
  'severity',
];

// Storage key for column visibility
const COLUMN_VISIBILITY_STORAGE_KEY = 'table-column-visibility';

// Helper functions for column visibility persistence
const saveColumnVisibility = (visibility: VisibilityState) => {
  try {
    localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(visibility));
  } catch (error) {
    console.error('Failed to save column visibility:', error);
  }
};

const loadColumnVisibility = (): VisibilityState => {
  try {
    const saved = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load column visibility:', error);
  }

  // Return default visibility state - hide all columns except the default ones
  const defaultVisibility: VisibilityState = {};

  // Hide all columns that are not in the default list
  const allPossibleColumns = [
    'select',
    'objectId',
    'description',
    'hierarchy',
    'startTime',
    'lastUpdated',
    'severity',
    'impact',
    'environment',
    'origin',
    'snId',
  ];

  allPossibleColumns.forEach((columnId) => {
    if (!DEFAULT_VISIBLE_COLUMNS.includes(columnId)) {
      defaultVisibility[columnId] = false;
    }
  });

  return defaultVisibility;
};

const getDefaultColumnVisibility = (): VisibilityState => {
  const defaultVisibility: VisibilityState = {};

  // Hide all columns that are not in the default list
  const allPossibleColumns = [
    'select',
    'objectId',
    'description',
    'hierarchy',
    'startTime',
    'lastUpdated',
    'severity',
    'impact',
    'environment',
    'origin',
    'snId',
  ];

  allPossibleColumns.forEach((columnId) => {
    if (!DEFAULT_VISIBLE_COLUMNS.includes(columnId)) {
      defaultVisibility[columnId] = false;
    }
  });

  return defaultVisibility;
};

// Hook for managing table data and folder state
export const useTableData = () => {
  const [originalData, setOriginalData] = useState<DataItem[]>(() => generateMockData());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  const [folderState, setFolderState] = useState<FolderState>(() => {
    const saved = loadFolderState();
    return saved || createInitialFolderState(originalData);
  });

  const [displayData, setDisplayData] = useState<TableRow[]>([]);
  const [tableVersion, setTableVersion] = useState(0);
  const [sortingState, setSortingState] = useState<SortingState>([]);

  // Update generateTableRows call to include sorting state
  const memoizedDisplayData = useMemo(
    () => generateTableRows(folderState, originalData, sortingState),
    [folderState, originalData, sortingState]
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
    sortingState,
    setSortingState,
  };
};

// Hook for managing table state (filters, sorting, etc.)
export const useTableState = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Initialize column visibility with saved state or defaults
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    loadColumnVisibility()
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    saveColumnVisibility(columnVisibility);
  }, [columnVisibility]);

  // Function to reset to default column visibility
  const resetToDefaultColumns = useCallback(() => {
    const defaultVisibility = getDefaultColumnVisibility();
    setColumnVisibility(defaultVisibility);
  }, []);

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
    resetToDefaultColumns,
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
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  const handleCreateFolder = useCallback(
    (folderName?: string) => {
      const tempFolderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newFolder: FolderItem = {
        id: tempFolderId,
        name: folderName || '', // Allow empty name
        type: 'folder',
        isExpanded: false,
        rowIds: [],
        criticalCount: 0,
        majorCount: 0,
        warningCount: 0,
        disabledCount: 0,
      };

      setFolderState((prev) => ({
        ...prev,
        folders: [...prev.folders, newFolder],
      }));

      // Start editing immediately if no name provided
      if (!folderName) {
        setEditingFolderId(tempFolderId);
      }

      setTableVersion((v) => v + 1);
    },
    [setFolderState, setTableVersion]
  );

  const handleSaveFolderName = useCallback(
    (folderId: string, newName: string) => {
      if (!newName.trim()) {
        // Delete folder if no name provided - NO ALERT HERE
        setFolderState((prev) => ({
          ...prev,
          folders: prev.folders.filter((f) => f.id !== folderId),
        }));

        setEditingFolderId(null);
        setTableVersion((v) => v + 1);
        return;
      }

      // Save the folder name
      setFolderState((prev) => ({
        ...prev,
        folders: prev.folders.map((folder) =>
          folder.id === folderId ? { ...folder, name: newName.trim() } : folder
        ),
      }));

      setEditingFolderId(null);
      setTableVersion((v) => v + 1);
    },
    [setFolderState, setTableVersion]
  );

  const handleCancelFolderEdit = useCallback(
    (folderId: string) => {
      const folder = folderState.folders.find((f) => f.id === folderId);

      if (folder && !folder.name.trim()) {
        // Delete folder if it has no name and show alert only here
        setFolderState((prev) => ({
          ...prev,
          folders: prev.folders.filter((f) => f.id !== folderId),
        }));

        // Show alert only when cancelling, not when saving
        alert('שם התיקייה נדרש. התיקייה נמחקה.');
        setTableVersion((v) => v + 1);
      }

      setEditingFolderId(null);
    },
    [folderState.folders, setFolderState, setTableVersion]
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

  const handleStartEdit = useCallback((folderId: string) => {
    setEditingFolderId(folderId);
  }, []);

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
    editingFolderId,
    handleCreateFolder,
    handleSaveFolderName,
    handleCancelFolderEdit,
    handleStartEdit,
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
  tableState: ReturnType<typeof useTableState>,
  setSortingState: (sorting: SortingState) => void
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
    resetToDefaultColumns,
  } = tableState;

  // Custom sorting handler that updates both table sorting and our custom sorting
  const handleSortingChange = useCallback(
    (updaterOrValue: any) => {
      const newSorting =
        typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
      setSorting(newSorting);
      setSortingState(newSorting);
    },
    [sorting, setSorting, setSortingState]
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
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: setColumnSizing,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    enableRowSelection: (row) => !isFolder(row.original),
    getRowId: (row) => row.id,
    manualSorting: true,
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

  // Get ALL columns for reordering (including non-hidable ones)
  // But only return hidable columns for the column selector UI controls
  const allColumns = useMemo(
    () => table.getAllColumns(), // Return ALL columns for drag & drop
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
    resetToDefaultColumns,
  };
};
