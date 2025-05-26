// FolderUtils.ts - Utilities for folder management

import { DataItem, FolderItem, FolderState, TableRow } from './types';

const STORAGE_KEY = 'table-folders';

// Save folder state to localStorage
export const saveFolderState = (state: FolderState) => {
  try {
    // Convert Set to Array for serialization
    const stateToSave = {
      ...state,
      expandedFolders: Array.from(state.expandedFolders),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save folder state:', error);
  }
};

// Load folder state from localStorage
export const loadFolderState = (): FolderState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert expandedFolders array back to Set if it exists
      if (parsed.expandedFolders && Array.isArray(parsed.expandedFolders)) {
        parsed.expandedFolders = new Set(parsed.expandedFolders);
      } else {
        parsed.expandedFolders = new Set();
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load folder state:', error);
  }
  return null;
};

// Create initial folder state
export const createInitialFolderState = (data: DataItem[]): FolderState => {
  return {
    folders: [],
    unassignedRows: data,
    expandedFolders: new Set(),
  };
};

// Generate table rows for display (folders + their contents + unassigned rows)
export const generateTableRows = (folderState: FolderState, allData: DataItem[]): TableRow[] => {
  const rows: TableRow[] = [];

  // Create a map of data by ID for quick lookup
  const dataMap = new Map(allData.map((item) => [item.id, item]));

  // Add folders and their contents
  folderState.folders.forEach((folder) => {
    // Add folder row
    rows.push(folder);

    // If folder is expanded, add its rows
    if (folderState.expandedFolders.has(folder.id)) {
      folder.rowIds.forEach((rowId) => {
        const dataItem = dataMap.get(rowId);
        if (dataItem) {
          rows.push({ ...dataItem, isInFolder: true });
        }
      });
    }
  });

  // Add unassigned rows
  folderState.unassignedRows.forEach((row) => {
    rows.push(row);
  });

  return rows;
};

// Create a new folder
export const createFolder = (folderState: FolderState, folderName: string): FolderState => {
  const newFolder: FolderItem = {
    id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
    name: folderName,
    type: 'folder',
    isExpanded: false,
    rowIds: [],
  };

  const newState = {
    ...folderState,
    folders: [...folderState.folders, newFolder],
  };

  return newState;
};

// Move rows to folder
export const moveRowsToFolder = (
  folderState: FolderState,
  rowIds: string[],
  folderId: string
): FolderState => {
  console.log('=== MOVE ROWS TO FOLDER DEBUG ===');
  console.log('Input rowIds:', rowIds);
  console.log('Target folderId:', folderId);
  console.log(
    'Current unassigned rows:',
    folderState.unassignedRows.map((r) => r.id)
  );

  const targetFolder = folderState.folders.find((f) => f.id === folderId);
  console.log('Target folder found:', !!targetFolder);

  if (!targetFolder) {
    console.log('Target folder not found!');
    return folderState;
  }

  // Remove rows from unassigned and other folders
  const newUnassignedRows = folderState.unassignedRows.filter((row) => {
    const shouldKeep = !rowIds.includes(row.id);
    console.log(`Row ${row.id}: ${shouldKeep ? 'keeping' : 'removing'}`);
    return shouldKeep;
  });

  console.log('New unassigned count:', newUnassignedRows.length);
  console.log('Original unassigned count:', folderState.unassignedRows.length);

  const newFolders = folderState.folders.map((folder) => {
    if (folder.id === folderId) {
      // Add rows to target folder
      const newRowIds = [...folder.rowIds, ...rowIds].filter(
        (id, index, arr) => arr.indexOf(id) === index // Remove duplicates
      );
      console.log(`Target folder ${folder.name} new row count:`, newRowIds.length);
      return { ...folder, rowIds: newRowIds };
    } else {
      // Remove rows from other folders
      const filteredRowIds = folder.rowIds.filter((id) => !rowIds.includes(id));
      if (filteredRowIds.length !== folder.rowIds.length) {
        console.log(
          `Removed ${folder.rowIds.length - filteredRowIds.length} rows from folder ${folder.name}`
        );
      }
      return {
        ...folder,
        rowIds: filteredRowIds,
      };
    }
  });

  const result = {
    ...folderState,
    folders: newFolders,
    unassignedRows: newUnassignedRows,
  };

  console.log('=== MOVE RESULT ===');
  console.log(
    'Final result folders:',
    result.folders.map((f) => ({ name: f.name, count: f.rowIds.length }))
  );
  console.log('Final unassigned count:', result.unassignedRows.length);
  console.log('=== END MOVE DEBUG ===');

  return result;
};

// Toggle folder expansion
export const toggleFolderExpansion = (folderState: FolderState, folderId: string): FolderState => {
  const newExpandedFolders = new Set(folderState.expandedFolders);

  if (newExpandedFolders.has(folderId)) {
    newExpandedFolders.delete(folderId);
  } else {
    newExpandedFolders.add(folderId);
  }

  return {
    ...folderState,
    expandedFolders: newExpandedFolders,
  };
};

// Rename folder
export const renameFolder = (
  folderState: FolderState,
  folderId: string,
  newName: string
): FolderState => {
  const newFolders = folderState.folders.map((folder) =>
    folder.id === folderId ? { ...folder, name: newName } : folder
  );

  return {
    ...folderState,
    folders: newFolders,
  };
};

// Delete folder (move rows back to unassigned)
export const deleteFolder = (
  folderState: FolderState,
  folderId: string,
  allData: DataItem[]
): FolderState => {
  const folderToDelete = folderState.folders.find((f) => f.id === folderId);
  if (!folderToDelete) return folderState;

  // Get rows that were in the deleted folder
  const dataMap = new Map(allData.map((item) => [item.id, item]));
  const rowsToRestore = folderToDelete.rowIds
    .map((id) => dataMap.get(id))
    .filter(Boolean) as DataItem[];

  const newFolders = folderState.folders.filter((f) => f.id !== folderId);
  const newExpandedFolders = new Set(folderState.expandedFolders);
  newExpandedFolders.delete(folderId);

  return {
    ...folderState,
    folders: newFolders,
    unassignedRows: [...folderState.unassignedRows, ...rowsToRestore],
    expandedFolders: newExpandedFolders,
  };
};
