import React, { useEffect, useRef, useState } from 'react';
import { MdCheck, MdOutlineSettingsInputComponent, MdSettings } from 'react-icons/md';
import { RxDragHandleHorizontal } from 'react-icons/rx';
import { Button, Text } from '@mantine/core';

interface ColumnSelectorProps {
  allColumns: any[];
  columnVisibility: any;
  setColumnVisibility: (visibility: any) => void;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  showAllColumns: () => void;
  resetToDefaultColumns: () => void;
}

const pinnedColumnIds = ['select', 'newBadge', 'objectId', 'description', 'startTime'];

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  allColumns,
  columnVisibility,
  setColumnVisibility,
  columnOrder,
  setColumnOrder,
  showAllColumns,
  resetToDefaultColumns,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const hasHiddenColumns = allColumns.some((column) => !column.getIsVisible());

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const pinnedColumns = allColumns.filter((col) => pinnedColumnIds.includes(col.id));

  const reorderableColumns = allColumns
    .filter((col) => !pinnedColumnIds.includes(col.id))
    .sort((a, b) => {
      const aIdx = columnOrder.indexOf(a.id);
      const bIdx = columnOrder.indexOf(b.id);
      return aIdx - bIdx;
    });

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedItem(columnId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', columnId);

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDragOverItem(null);

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(columnId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetColumnId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const reorderableIds = reorderableColumns.map((col) => col.id);

    const draggedIndex = reorderableIds.indexOf(draggedItem);
    const targetIndex = reorderableIds.indexOf(targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...reorderableIds];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    setColumnOrder([...pinnedColumnIds, ...newOrder]);

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const toggleColumnVisibility = (columnId: string) => {
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
        color="#1f3a8a"
        size="xs"
        leftSection={<MdOutlineSettingsInputComponent size={16} />}
        style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f9fafc' }}
      >
        בחירת שדות
      </Button>

      {opened && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            width: 200,
            backgroundColor: 'white',
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 8px 0 2px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="xs" variant="subtle" onClick={() => resetToDefaultColumns()}>
                  ברירת מחדל
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  disabled={!hasHiddenColumns}
                  onClick={() => showAllColumns()}
                >
                  הצג הכל
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
            {pinnedColumns.map((column) => {
              const header =
                typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id;
              return (
                <div
                  key={column.id}
                  style={{
                    padding: '12px 16px',
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
                    padding: '8px 10px',
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
                      e.stopPropagation();
                      toggleColumnVisibility(column.id);
                    }}
                  >
                    <div
                      style={{
                        cursor: 'grab',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.cursor = 'grabbing';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.cursor = 'grab';
                      }}
                    >
                      <RxDragHandleHorizontal size={18} color="#1f3a8a" />
                    </div>
                    <input
                      type="checkbox"
                      checked={isVisible}
                      readOnly
                      style={{
                        marginLeft: 8,
                        accentColor: '#1f3a8a',
                        width: '14px',
                        height: '14px',
                      }}
                    />
                    <span>{header}</span>
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
