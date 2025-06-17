import { DataItem, FolderItem, FolderState, TableRow, isFolder } from './types';

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

// Helper function to sort data items based on current table sorting
const sortDataItems = (items: DataItem[], sortingState: any[]): DataItem[] => {
  if (!sortingState || sortingState.length === 0) {
    return items;
  }

  return [...items].sort((a, b) => {
    for (const sort of sortingState) {
      const { id: columnId, desc } = sort;
      
      let aValue = a[columnId as keyof DataItem];
      let bValue = b[columnId as keyof DataItem];

      // Handle arrays (like identities)
      if (Array.isArray(aValue)) aValue = aValue.join(', ');
      if (Array.isArray(bValue)) bValue = bValue.join(', ');

      // Convert to strings for comparison
      const aString = String(aValue || '').trim();
      const bString = String(bValue || '').trim();

      let comparison = 0;

      // Date sorting for specific columns
      if (columnId === 'startTime' || columnId === 'lastUpdated') {
        const aDate = new Date(aString);
        const bDate = new Date(bString);
        
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          comparison = aDate.getTime() - bDate.getTime();
        } else {
          comparison = aString.localeCompare(bString);
        }
      }
      // Severity sorting
      else if (columnId === 'severity') {
        const severityOrder = { critical: 4, major: 3, warning: 2, disabled: 1 };
        const aRank = severityOrder[aValue as keyof typeof severityOrder] || 0;
        const bRank = severityOrder[bValue as keyof typeof severityOrder] || 0;
        comparison = bRank - aRank; // Higher severity first
      }
      // Impact sorting
      else if (columnId === 'impact') {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        const aRank = impactOrder[aValue as keyof typeof impactOrder] || 0;
        const bRank = impactOrder[bValue as keyof typeof impactOrder] || 0;
        comparison = bRank - aRank; // Higher impact first
      }
      // Text sorting with Hebrew support
      else {
        // Check if text starts with Hebrew
        const startsWithHebrew = (text: string): boolean => {
          if (!text) return false;
          const firstChar = text.trim().charAt(0);
          return /[\u0590-\u05FF]/.test(firstChar);
        };

        const aIsHebrew = startsWithHebrew(aString);
        const bIsHebrew = startsWithHebrew(bString);

        if (aIsHebrew === bIsHebrew) {
          // Both same script type
          if (aIsHebrew) {
            comparison = aString.localeCompare(bString, 'he-IL', {
              sensitivity: 'base',
              ignorePunctuation: true,
            });
          } else {
            comparison = aString.localeCompare(bString, 'en-US', {
              sensitivity: 'base',
              ignorePunctuation: true,
            });
          }
        } else {
          // Hebrew first, then English
          comparison = aIsHebrew ? -1 : 1;
        }
      }

      if (comparison !== 0) {
        return desc ? -comparison : comparison;
      }
    }
    return 0;
  });
};

// Generate table rows for display with proper sorting (UPDATED)
export const generateTableRows = (
  folderState: FolderState, 
  allData: DataItem[], 
  sortingState?: any[]
): TableRow[] => {
  console.log('=== GENERATE TABLE ROWS DEBUG ===');
  console.log('Sorting state:', sortingState);
  console.log('Folder count:', folderState.folders.length);
  console.log('Unassigned count:', folderState.unassignedRows.length);
  
  const rows: TableRow[] = [];

  // Create a map of data by ID for quick lookup
  const dataMap = new Map(allData.map((item) => [item.id, item]));

  // Sort folders alphabetically by name
  const sortedFolders = [...folderState.folders].sort((a, b) => 
    a.name.localeCompare(b.name, 'he-IL', {
      sensitivity: 'base',
      ignorePunctuation: true,
    })
  );

  console.log('Sorted folders:', sortedFolders.map(f => ({ name: f.name, expanded: folderState.expandedFolders.has(f.id) })));

  // Add folders and their contents
  sortedFolders.forEach((folder) => {
    // Calculate severity counts for the folder
    let criticalCount = 0;
    let majorCount = 0;
    let warningCount = 0;
    let disabledCount = 0;

    // Get folder items and apply sorting
    const folderItems = folder.rowIds
      .map((rowId) => dataMap.get(rowId))
      .filter(Boolean) as DataItem[];

    // Sort items within the folder
    const sortedFolderItems = sortDataItems(folderItems, sortingState || []);

    // Calculate counts from sorted items
    sortedFolderItems.forEach((dataItem) => {
      if (dataItem.severity === 'critical') criticalCount++;
      else if (dataItem.severity === 'major') majorCount++;
      else if (dataItem.severity === 'warning') warningCount++;
      else if (dataItem.severity === 'disabled') disabledCount++;
    });

    // Add folder row with counts
    rows.push({
      ...folder,
      criticalCount,
      majorCount,
      warningCount,
      disabledCount,
    } as FolderItem);

    console.log(`Added folder ${folder.name} at position ${rows.length - 1}`);

    // If folder is expanded, add its sorted rows
    if (folderState.expandedFolders.has(folder.id)) {
      console.log(`Folder ${folder.name} is expanded, adding ${sortedFolderItems.length} items`);
      sortedFolderItems.forEach((dataItem, index) => {
        rows.push({
          ...dataItem,
          isInFolder: true,
          folderId: folder.id,
          isFirstInFolderGroup: index === 0,
          isLastInFolderGroup: index === sortedFolderItems.length - 1,
        });
        console.log(`Added folder item ${dataItem.objectId} at position ${rows.length - 1}`);
      });
    }
  });

  // Add sorted unassigned rows at the end
  const sortedUnassignedRows = sortDataItems(folderState.unassignedRows, sortingState || []);
  console.log(`Adding ${sortedUnassignedRows.length} unassigned rows`);
  sortedUnassignedRows.forEach((row) => {
    rows.push(row);
  });

  console.log('Final row structure:');
  rows.forEach((row, index) => {
    if (isFolder(row)) {
      console.log(`${index}: FOLDER - ${row.name}`);
    } else {
      console.log(`${index}: DATA - ${row.objectId} ${row.isInFolder ? `(in folder ${row.folderId})` : '(unassigned)'}`);
    }
  });
  console.log('=== END GENERATE TABLE ROWS DEBUG ===');

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
    // Initialize new severity counts
    criticalCount: 0,
    majorCount: 0,
    warningCount: 0,
    disabledCount: 0, // Added disabled count
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