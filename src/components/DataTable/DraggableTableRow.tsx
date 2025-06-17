import React from 'react';
import { flexRender } from '@tanstack/react-table';
import { createDragProps } from './DragDropHooks';
import { DataItem, FolderState, getRowStyleBySeverity, isDataItem } from './types';

interface DraggableTableRowProps {
  row: any; // TanStack table row
  virtualRow: any; // Virtual row from virtualizer
  shouldStretchColumns: boolean;
  stretchRatio: number;
  folderState: FolderState;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const DraggableTableRow: React.FC<DraggableTableRowProps> = ({
  row,
  virtualRow,
  shouldStretchColumns,
  stretchRatio,
  folderState,
  onClick,
  onContextMenu,
}) => {
  const rowData = row.original as DataItem;
  const isInFolder = rowData.isInFolder || false;

  // Get drag props without using hooks
  const dragProps = createDragProps(rowData, isInFolder);

  return (
    <div
      {...dragProps}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${virtualRow.size}px`,
        display: 'flex',
        direction: 'rtl',
        transform: `translateY(${virtualRow.start}px) ${row.getIsSelected() ? 'scale(0.99)' : 'scale(1)'}`,
        transition: 'opacity 0.1s ease, transform 0.1s ease',
        cursor: 'grab',
        paddingTop: '0px',
        paddingRight: '0px',
        paddingBottom:
          isDataItem(row.original) &&
          row.original.isInFolder &&
          row.original.folderId &&
          folderState.expandedFolders.has(row.original.folderId)
            ? '0px'
            : '2px',
        opacity: row.getIsSelected() ? 0.8 : 1,
        zIndex: 'auto',
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <div
        style={{
          width: '100%',
          height: 'calc(100% - 8px)',
          display: 'flex',
          direction: 'rtl',
          backgroundColor: getRowStyleBySeverity(rowData.severity).backgroundColor,
          borderRadius: '8px',
          border: '1px solid #e0e0e0', // Single border here
          // Override for folder items
          ...(isDataItem(row.original) &&
          row.original.isInFolder &&
          row.original.folderId &&
          folderState.expandedFolders.has(row.original.folderId)
            ? {
                borderLeft: '1px solid #1f3a8a',
                borderRight: '1px solid #1f3a8a',
                borderTop: 'none',
                borderBottom: row.original.isLastInFolderGroup ? '1px solid #8E9CC5' : 'none',
                borderTopRightRadius: '8px',
                borderTopLeftRadius: '8px',
                borderBottomRightRadius: '8px',
                borderBottomLeftRadius: '8px',
              }
            : {}),
          cursor: 'grab',
        }}
      >
        {row.getVisibleCells().map((cell: any, cellIndex: number) => {
          const isFirstCell = cellIndex === 0;
          const isLastCell = cellIndex === row.getVisibleCells().length - 1;
          const cellWidth = shouldStretchColumns
            ? Math.floor(cell.column.getSize() * stretchRatio)
            : cell.column.getSize();

          return (
            <div
              key={cell.id}
              style={{
                width: `${cellWidth}px`,
                minWidth: `${cellWidth}px`,
                maxWidth: `${cellWidth}px`,
                padding: '12px',
                paddingRight: (row.original as any).isInFolder && isFirstCell ? '30px' : '16px',
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
                userSelect: 'auto',

                border: 'none',
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          );
        })}
      </div>
    </div>
  );
};
