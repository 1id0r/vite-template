// DragDropUtils.ts - Drag and Drop functionality using native HTML5 API

import { DataItem, FolderItem, FolderState } from './types';

// Drag and drop data transfer types
export const DRAG_TYPES = {
  ROW: 'application/row-data',
  FOLDER: 'application/folder-data',
} as const;

// Drag data interface
export interface DragData {
  type: 'row' | 'folder';
  id: string;
  data: DataItem | FolderItem;
}

// Create drag data for transfer
export const createDragData = (type: 'row' | 'folder', id: string, data: DataItem | FolderItem): DragData => ({
  type,
  id,
  data,
});

// Serialize drag data for data transfer
export const serializeDragData = (dragData: DragData): string => {
  return JSON.stringify(dragData);
};

// Parse drag data from data transfer
export const parseDragData = (serializedData: string): DragData | null => {
  try {
    return JSON.parse(serializedData);
  } catch {
    return null;
  }
};

// Check if an element or its parents have a specific data attribute
export const findDropTarget = (element: Element, targetAttribute: string): Element | null => {
  let currentElement: Element | null = element;
  
  while (currentElement) {
    if (currentElement.hasAttribute(targetAttribute)) {
      return currentElement;
    }
    currentElement = currentElement.parentElement;
  }
  
  return null;
};

// Get drop zone info from element
export const getDropZoneInfo = (element: Element): { type: 'folder' | 'unassigned' | null; folderId?: string } => {
  if (element.hasAttribute('data-folder-drop-zone')) {
    return {
      type: 'folder',
      folderId: element.getAttribute('data-folder-id') || undefined,
    };
  }
  
  if (element.hasAttribute('data-unassigned-drop-zone')) {
    return { type: 'unassigned' };
  }
  
  return { type: null };
};

// Check if a row can be dropped into a folder
export const canDropInFolder = (dragData: DragData, folderId: string, folderState: FolderState): boolean => {
  // Only allow dropping data rows (not folders)
  if (dragData.type !== 'row') {
    return false;
  }
  
  // Check if the folder exists
  const targetFolder = folderState.folders.find(f => f.id === folderId);
  if (!targetFolder) {
    return false;
  }
  
  // Check if the row is already in this specific folder
  if (targetFolder.rowIds.includes(dragData.id)) {
    return false;
  }
  
  // Allow dropping - even if the row is in another folder or unassigned
  return true;
};

// Check if a row can be dropped into unassigned area
export const canDropInUnassigned = (dragData: DragData, folderState: FolderState): boolean => {
  // Only allow dropping data rows (not folders)
  if (dragData.type !== 'row') {
    return false;
  }
  
  // Check if the row is already in unassigned
  const isInUnassigned = folderState.unassignedRows.some(row => row.id === dragData.id);
  if (isInUnassigned) {
    return false;
  }
  
  return true;
};

// Visual feedback classes
export const DRAG_CLASSES = {
  DRAGGING: 'dragging',
  DRAG_OVER: 'drag-over',
  DROP_ALLOWED: 'drop-allowed',
  DROP_FORBIDDEN: 'drop-forbidden',
} as const;

// CSS styles for drag and drop visual feedback
export const getDragDropStyles = () => `
  .${DRAG_CLASSES.DRAGGING} {
    opacity: 0.5;
    transform: rotate(2deg);
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .${DRAG_CLASSES.DRAG_OVER} {
    background-color: rgba(34, 139, 230, 0.1);
    border: 2px dashed #228be6;
  }
  
  .${DRAG_CLASSES.DROP_ALLOWED} {
    background-color: rgba(34, 139, 230, 0.05);
    border: 2px dashed #228be6;
  }
  
  .${DRAG_CLASSES.DROP_FORBIDDEN} {
    background-color: rgba(250, 82, 82, 0.05);
    border: 2px dashed #fa5252;
  }
`;

// Inject styles into document head
export const injectDragDropStyles = () => {
  const styleId = 'drag-drop-styles';
  
  // Remove existing styles if any
  const existingStyles = document.getElementById(styleId);
  if (existingStyles) {
    existingStyles.remove();
  }
  
  // Create and inject new styles
  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = getDragDropStyles();
  document.head.appendChild(styleElement);
};