// DragDropHooks.ts - React hooks for drag and drop functionality

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  canDropInFolder,
  canDropInUnassigned,
  createDragData,
  DRAG_CLASSES,
  DRAG_TYPES,
  DragData,
  findDropTarget,
  getDropZoneInfo,
  injectDragDropStyles,
  parseDragData,
  serializeDragData,
} from './DragDropUtils';
import { DataItem, FolderState, isDataItem } from './types';

// Create drag props without using hooks
export const createDragProps = (
  rowData: DataItem,
  isInFolder: boolean = false
) => {
  const handleDragStart = (e: React.DragEvent) => {
    const dragData = createDragData('row', rowData.id, rowData);
    e.dataTransfer.setData(DRAG_TYPES.ROW, serializeDragData(dragData));
    e.dataTransfer.effectAllowed = 'move';

    // Add dragging class after a small delay to ensure the drag image is captured first
    setTimeout(() => {
      const element = e.currentTarget as HTMLElement;
      element.classList.add(DRAG_CLASSES.DRAGGING);
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.classList.remove(DRAG_CLASSES.DRAGGING);
  };

  return {
    draggable: true,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
  };
};

// Hook for making folders drop targets
export const useDropTarget = (
  folderId: string,
  folderState: FolderState,
  onDropRow: (rowId: string, targetFolderId: string) => void
) => {
  const [isOver, setIsOver] = useState(false);
  const [canDrop, setCanDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      
      const dragData = parseDragData(e.dataTransfer.getData(DRAG_TYPES.ROW));
      if (!dragData) {
        setCanDrop(false);
        return;
      }

      const canDropHere = canDropInFolder(dragData, folderId, folderState);
      setCanDrop(canDropHere);
      
      e.dataTransfer.dropEffect = canDropHere ? 'move' : 'none';
    },
    [folderId, folderState]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set isOver to false if we're leaving the drop target entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsOver(false);
      setCanDrop(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      setCanDrop(false);

      const dragData = parseDragData(e.dataTransfer.getData(DRAG_TYPES.ROW));
      if (!dragData || dragData.type !== 'row') return;

      if (canDropInFolder(dragData, folderId, folderState)) {
        onDropRow(dragData.id, folderId);
      }
    },
    [folderId, folderState, onDropRow]
  );

  // Update element classes based on state
  useEffect(() => {
    const element = dropRef.current;
    if (!element) return;

    // Remove all drag classes first
    element.classList.remove(
      DRAG_CLASSES.DRAG_OVER,
      DRAG_CLASSES.DROP_ALLOWED,
      DRAG_CLASSES.DROP_FORBIDDEN
    );

    // Add appropriate class based on current state
    if (isOver) {
      if (canDrop) {
        element.classList.add(DRAG_CLASSES.DROP_ALLOWED);
      } else {
        element.classList.add(DRAG_CLASSES.DROP_FORBIDDEN);
      }
    }
  }, [isOver, canDrop]);

  return {
    dropRef,
    isOver,
    canDrop,
    dropProps: {
      'data-folder-drop-zone': true,
      'data-folder-id': folderId,
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};

// Hook for unassigned area drop target
export const useUnassignedDropTarget = (
  folderState: FolderState,
  onDropRow: (rowId: string) => void
) => {
  const [isOver, setIsOver] = useState(false);
  const [canDrop, setCanDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      
      const dragData = parseDragData(e.dataTransfer.getData(DRAG_TYPES.ROW));
      if (!dragData) return;

      const canDropHere = canDropInUnassigned(dragData, folderState);
      setCanDrop(canDropHere);
      
      e.dataTransfer.dropEffect = canDropHere ? 'move' : 'none';
    },
    [folderState]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsOver(false);
      setCanDrop(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      setCanDrop(false);

      const dragData = parseDragData(e.dataTransfer.getData(DRAG_TYPES.ROW));
      if (!dragData || dragData.type !== 'row') return;

      if (canDropInUnassigned(dragData, folderState)) {
        onDropRow(dragData.id);
      }
    },
    [folderState, onDropRow]
  );

  // Update element classes based on state
  useEffect(() => {
    const element = dropRef.current;
    if (!element) return;

    element.classList.remove(
      DRAG_CLASSES.DRAG_OVER,
      DRAG_CLASSES.DROP_ALLOWED,
      DRAG_CLASSES.DROP_FORBIDDEN
    );

    if (isOver) {
      if (canDrop) {
        element.classList.add(DRAG_CLASSES.DROP_ALLOWED);
      } else {
        element.classList.add(DRAG_CLASSES.DROP_FORBIDDEN);
      }
    }
  }, [isOver, canDrop]);

  return {
    dropRef,
    isOver,
    canDrop,
    dropProps: {
      'data-unassigned-drop-zone': true,
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};

// Hook to initialize drag and drop styles
export const useDragDropStyles = () => {
  useEffect(() => {
    injectDragDropStyles();
  }, []);
};

// Main drag and drop hook that combines all functionality
export const useDragAndDrop = (
  folderState: FolderState,
  onMoveRowToFolder: (rowId: string, folderId: string) => void,
  onMoveRowToUnassigned: (rowId: string) => void
) => {
  // Initialize styles
  useDragDropStyles();

  // Create draggable row function (not a hook)
  const createDraggableRow = useCallback(
    (rowData: DataItem, isInFolder: boolean = false) => {
      return {
        dragProps: createDragProps(rowData, isInFolder),
      };
    },
    []
  );

  // Create folder drop target hook
  const createFolderDropTarget = useCallback(
    (folderId: string) => {
      return useDropTarget(folderId, folderState, onMoveRowToFolder);
    },
    [folderState, onMoveRowToFolder]
  );

  // Create unassigned drop target hook
  const createUnassignedDropTarget = useCallback(() => {
    return useUnassignedDropTarget(folderState, onMoveRowToUnassigned);
  }, [folderState, onMoveRowToUnassigned]);

  return {
    createDraggableRow,
    createFolderDropTarget,
    createUnassignedDropTarget,
  };
};