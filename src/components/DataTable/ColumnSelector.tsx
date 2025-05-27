import React, { useEffect, useRef, useState } from 'react';
import {
  IconCheck,
  IconChevronDown,
  IconColumns,
  IconGripHorizontal,
  IconGripVertical,
  IconListDetails,
} from '@tabler/icons-react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { ActionIcon, Button, Text } from '@mantine/core';

interface ColumnSelectorProps {
  allColumns: any[];
  columnVisibility: any;
  setColumnVisibility: (visibility: any) => void;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  showAllColumns: () => void;
}

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

  const handleColumnReorder = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(columnOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setColumnOrder(items);
  };

  const toggleColumnVisibility = (columnId: string) => {
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
      <Button onClick={() => setOpened(!opened)} variant="subtle">
        <IconColumns size={18} />
        <IconChevronDown size={18} />
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
            <DragDropContext onDragEnd={handleColumnReorder}>
              <Droppable droppableId="columns">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {allColumns.map((column, index) => {
                      const isVisible = !(column.id in columnVisibility);
                      const header =
                        typeof column.columnDef.header === 'string'
                          ? column.columnDef.header
                          : column.id;

                      return (
                        <Draggable key={column.id} draggableId={column.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #f0f0f0',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                ...provided.draggableProps.style,
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
                                onClick={() => toggleColumnVisibility(column.id)}
                              >
                                <div
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    marginLeft: '8px',
                                    border: '2px solid #228be6',
                                    borderRadius: '4px',
                                    backgroundColor: isVisible ? '#228be6' : 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    flexShrink: 0,
                                  }}
                                >
                                  {isVisible && <IconCheck size={12} />}
                                </div>
                                <Text size="sm" style={{ marginLeft: '8px' }}>
                                  {header}
                                </Text>
                              </div>

                              {/* Right side - Drag handle */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexShrink: 0,
                                }}
                                {...provided.dragHandleProps}
                              >
                                <IconGripVertical
                                  size={18}
                                  style={{
                                    opacity: 0.5,
                                    cursor: 'grab',
                                    display: 'block',
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      )}
    </div>
  );
};
