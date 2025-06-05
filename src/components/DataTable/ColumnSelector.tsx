import React, { useEffect, useRef, useState } from 'react';
import { IconCheck, IconGripVertical, IconSettings } from '@tabler/icons-react';
import { Button, Text } from '@mantine/core';

interface ColumnSelectorProps {
  allColumns: any[];
  columnVisibility: any;
  setColumnVisibility: (visibility: any) => void;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  showAllColumns: () => void;
}

const pinnedColumnIds = ['select', 'newBadge', 'objectId', 'description'];

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  allColumns,
  columnVisibility,
  setColumnVisibility,
  columnOrder,
  setColumnOrder,
  showAllColumns,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const hasHiddenColumns = allColumns.some((column) => !column.getIsVisible());

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  // Split columns into pinned and reorderable
  const pinnedColumns = allColumns.filter((col) => pinnedColumnIds.includes(col.id));

  // Sort reorderable columns according to columnOrder (after pinned)
  const reorderableColumns = allColumns
    .filter((col) => !pinnedColumnIds.includes(col.id))
    .sort((a, b) => {
      const aIdx = columnOrder.indexOf(a.id);
      const bIdx = columnOrder.indexOf(b.id);
      return aIdx - bIdx;
    });

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedItem(columnId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', columnId);

    // Add some visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDragOverItem(null);

    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(columnId);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetColumnId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Get current reorderable column IDs
    const reorderableIds = reorderableColumns.map((col) => col.id);

    // Find indices
    const draggedIndex = reorderableIds.indexOf(draggedItem);
    const targetIndex = reorderableIds.indexOf(targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newOrder = [...reorderableIds];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    // Update column order with pinned columns first
    setColumnOrder([...pinnedColumnIds, ...newOrder]);

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const toggleColumnVisibility = (columnId: string) => {
    // Prevent hiding pinned columns
    if (pinnedColumnIds.includes(columnId)) return;
    const newState = { ...columnVisibility };

    if (columnId in newState) {
      delete newState[columnId];
    } else {
      newState[columnId] = false;
    }

    setColumnVisibility(newState);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpened(false);
      }
    }

    if (opened) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [opened]);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <Button
        onClick={() => setOpened(!opened)}
        variant="outline"
        color="#687aaf"
        style={{ borderRadius: '8px', backgroundColor: '#f9fafc' }}
      >
        <IconSettings size={18} />
      </Button>

      {opened && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            width: 280,
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <div
            style={{ padding: 16, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text fw={600} size="sm">
                הגדרות עמודות
              </Text>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  size="xs"
                  variant="subtle"
                  disabled={!hasHiddenColumns}
                  onClick={() => showAllColumns()}
                >
                  אפס
                </Button>
                <Button
                  size="xs"
                  color="blue"
                  variant="filled"
                  leftSection={<IconCheck size={14} />}
                  onClick={() => setOpened(false)}
                >
                  אישור
                </Button>
              </div>
            </div>
          </div>

          <div
            style={{
              maxHeight: '400px',
              overflow: 'auto',
              direction: 'rtl',
            }}
          >
            {/* Render pinned columns (not draggable, not hideable) */}
            {pinnedColumns.map((column) => {
              const header =
                typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id;
              return (
                <div
                  key={column.id}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f8f9fa',
                    fontWeight: 600,
                    opacity: 0.7,
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{header}</span>
                  <Text size="xs" c="dimmed">
                    קבוע
                  </Text>
                </div>
              );
            })}

            {/* Render reorderable columns (draggable, hideable) */}
            {reorderableColumns.map((column, index) => {
              const isVisible = !(column.id in columnVisibility);
              const header =
                typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id;

              const isDraggedOver = dragOverItem === column.id;
              const isDragging = draggedItem === column.id;

              return (
                <div
                  key={column.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, column.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: isDraggedOver ? '#e3f2fd' : isDragging ? '#f5f5f5' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'move',
                    transition: 'background-color 0.2s ease',
                    border: isDraggedOver ? '2px dashed #2196f3' : '2px solid transparent',
                    transform: isDragging ? 'rotate(5deg)' : 'none',
                  }}
                >
                  {/* Left side - Checkbox and Text */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      flex: 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent drag when clicking checkbox
                      toggleColumnVisibility(column.id);
                    }}
                  >
                    <input type="checkbox" checked={isVisible} readOnly style={{ marginLeft: 8 }} />
                    <span>{header}</span>
                  </div>

                  {/* Drag handle */}
                  <div
                    style={{
                      cursor: 'grab',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseDown={(e) => {
                      // Change cursor to grabbing when mouse down
                      e.currentTarget.style.cursor = 'grabbing';
                    }}
                    onMouseUp={(e) => {
                      // Reset cursor when mouse up
                      e.currentTarget.style.cursor = 'grab';
                    }}
                  >
                    <IconGripVertical size={16} color="#666" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
