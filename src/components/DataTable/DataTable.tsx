import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Box, Group, Text } from '@mantine/core';
import { ActiveFilters } from './ActiveFilters';
import { ColumnFilter } from './ColumnFilter';
import { ContextMenu } from './ContextMenu';
import { createDragProps, useDragAndDrop } from './DragDropHooks';
import { DraggableFolderRow } from './DraggableFolderRow';
import { AddToFolderModal, CreateFolderModal } from './FolderComponents';
import { ManualAlertModal } from './ManualAlertModal';
import { RowDetailsModal } from './RowDetailsModal';
import { useTableColumns } from './TableColumns';
import { TableHeader } from './TableHeader';
import {
  useContextMenu,
  useFolderOperations,
  useModalStates,
  useTable,
  useTableData,
  useTableState,
} from './TableHooks';
import {
  DataItem,
  FolderItem,
  getFolderRowStyle,
  getRowStyleBySeverity,
  isDataItem,
  isFolder,
  TableRow,
} from './types';

export function DataTable() {
  // Custom hooks for data and state management
  const tableData = useTableData();
  const tableState = useTableState();
  const modalStates = useModalStates();
  const contextMenu = useContextMenu();

  // Get table columns
  const columns = useTableColumns();

  // Folder operations
  const folderOperations = useFolderOperations(
    tableData.folderState,
    tableData.setFolderState,
    tableData.originalData,
    tableData.setTableVersion
  );

  // Drag and drop functionality
  const dragAndDrop = useDragAndDrop(
    tableData.folderState,
    folderOperations.handleMoveRowToFolder,
    folderOperations.handleMoveRowToUnassigned
  );

  // Table instance and computations
  const { table, selectionInfo, allColumns, showAllColumns } = useTable(
    tableData.displayData,
    columns,
    tableState
  );

  // Unassigned area drop target
  const unassignedDropTarget = dragAndDrop.createUnassignedDropTarget();

  // UI state
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const tableOuterContainerRef = useRef<HTMLDivElement>(null);

  // Virtualization
  const tableRows = table.getRowModel().rows;
  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: useCallback(() => 61, []),
    overscan: 5,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  // Layout calculations
  const totalWidth = useMemo(
    () =>
      table
        .getHeaderGroups()[0]
        ?.headers.filter((header) => header.column.getIsVisible())
        .reduce((sum, header) => sum + header.getSize(), 0) || 0,
    [table]
  );

  const shouldStretchColumns = containerWidth > totalWidth;
  const stretchRatio = shouldStretchColumns ? containerWidth / totalWidth : 1;

  // Event handlers
  const handleAddToFolder = useCallback(
    (folderId: string) => {
      if (selectionInfo.selectedRowIds.length > 0) {
        folderOperations.handleMoveRowsToFolder(selectionInfo.selectedRowIds, folderId);
        tableState.setRowSelection({});
      }
    },
    [selectionInfo.selectedRowIds, folderOperations, tableState]
  );

  const handleRowClick = (row: TableRow) => {
    if (!isFolder(row)) {
      modalStates.setSelectedRow(row as DataItem);
      modalStates.setModalOpen(true);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, rowId: string) => {
    event.preventDefault();
    contextMenu.setContextMenuPosition({ x: event.clientX, y: event.clientY });
    contextMenu.setContextMenuRowId(rowId);
  };

  const handleAddToFolderFromContextMenu = () => {
    if (contextMenu.contextMenuRowId) {
      const currentSelectionIds = Object.keys(tableState.rowSelection);
      const idsToMove = new Set([...currentSelectionIds, contextMenu.contextMenuRowId]);
      contextMenu.setRowIdsToMove(Array.from(idsToMove));
      modalStates.setAddToFolderModalOpen(true);
    }
    contextMenu.setContextMenuPosition(null);
    contextMenu.setContextMenuRowId(null);
  };

  const handleRemoveFromFolder = useCallback(
    (rowId: string) => {
      tableData.setFolderState((prev) => {
        const folderContainingItem = prev.folders.find((folder) => folder.rowIds.includes(rowId));

        if (!folderContainingItem) {
          return prev;
        }

        const originalDataItem = tableData.originalData.find((item) => item.id === rowId);

        const newState = {
          ...prev,
          folders: prev.folders.map((folder) => {
            if (folder.id === folderContainingItem.id) {
              return {
                ...folder,
                rowIds: folder.rowIds.filter((id) => id !== rowId),
                criticalCount:
                  folder.criticalCount - (originalDataItem?.severity === 'critical' ? 1 : 0),
                majorCount: folder.majorCount - (originalDataItem?.severity === 'major' ? 1 : 0),
                warningCount:
                  folder.warningCount - (originalDataItem?.severity === 'warning' ? 1 : 0),
                disabledCount:
                  folder.disabledCount - (originalDataItem?.severity === 'disabled' ? 1 : 0),
              };
            }
            return folder;
          }),
          unassignedRows: [...prev.unassignedRows, originalDataItem!].filter(Boolean) as DataItem[],
        };

        tableData.setTableVersion((v) => v + 1);
        return newState;
      });

      tableState.setRowSelection({});
      contextMenu.setContextMenuPosition(null);
      contextMenu.setContextMenuRowId(null);
    },
    [tableData, tableState, contextMenu]
  );

  // Effects
  useEffect(() => {
    if (!contextMenu.contextMenuPosition) return;

    const handleClick = () => {
      contextMenu.setContextMenuPosition(null);
      contextMenu.setContextMenuRowId(null);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu]);

  useEffect(() => {
    if (!tableOuterContainerRef.current) return;
    const handleResize = () => {
      setContainerWidth(tableOuterContainerRef.current?.offsetWidth || 0);
    };
    handleResize();
    const resizeObserver = new window.ResizeObserver(handleResize);
    resizeObserver.observe(tableOuterContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div style={{ width: '100%', direction: 'rtl' }}>
      <TableHeader
        globalFilter={tableState.globalFilter}
        setGlobalFilter={tableState.setGlobalFilter}
        allColumns={allColumns}
        columnVisibility={tableState.columnVisibility}
        setColumnVisibility={tableState.setColumnVisibility}
        columnOrder={tableState.columnOrder}
        setColumnOrder={tableState.setColumnOrder}
        showAllColumns={showAllColumns}
        pageSize={1000}
        setPageSize={(size) => table.setPageSize(size)}
        table={table}
        data={tableData.originalData}
        folders={tableData.folderState.folders}
        hasSelectedRows={selectionInfo.selectedRowsCount > 0}
        onCreateFolder={() => folderOperations.handleCreateFolder()} // Direct creation, no modal
        onAddToFolder={() => modalStates.setAddToFolderModalOpen(true)}
        onAddManualAlert={() => modalStates.setManualAlertModalOpen(true)}
      />

      <ActiveFilters table={table} setColumnFilters={tableState.setColumnFilters} />

      <RowDetailsModal
        selectedRow={modalStates.selectedRow}
        modalOpen={modalStates.modalOpen}
        onClose={() => modalStates.setModalOpen(false)}
      />

      <ContextMenu
        contextMenuPosition={contextMenu.contextMenuPosition}
        contextMenuRowId={contextMenu.contextMenuRowId}
        folderState={tableData.folderState}
        onClose={() => contextMenu.setContextMenuPosition(null)}
        onAddToFolder={handleAddToFolderFromContextMenu}
        onRemoveFromFolder={handleRemoveFromFolder}
      />

      <div
        ref={tableOuterContainerRef}
        style={{
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          direction: 'rtl',
        }}
        {...unassignedDropTarget.dropProps}
      >
        <div
          ref={tableContainerRef}
          style={{
            width: '100%',
            height: '80vh',
            overflow: 'auto',
            direction: 'rtl',
            contain: 'strict',
            willChange: 'scroll-position',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 10,
              width: '100%',
              minWidth: `${totalWidth}px`,
              // borderBottom: '1px solid #e9ecef',
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <div
                key={headerGroup.id}
                style={{
                  display: 'flex',
                  direction: 'rtl',
                }}
              >
                {headerGroup.headers.map((header) => {
                  const headerWidth = shouldStretchColumns
                    ? Math.floor(header.getSize() * stretchRatio)
                    : header.getSize();

                  return (
                    <div
                      key={header.id}
                      style={{
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        position: 'relative',
                        width: `${headerWidth}px`,
                        minWidth: `${headerWidth}px`,
                        maxWidth: `${headerWidth}px`,
                        padding: '4px',
                        fontWeight: 500,
                        color: '#9198A7',
                        backgroundColor: 'white',
                        borderLeft: 'none',
                        userSelect: 'none',
                        textAlign: 'center',
                        direction: 'rtl',
                        display: 'flex',
                        alignItems: '',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <Box
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        style={{
                          cursor: header.column.getCanSort() ? 'pointer' : 'default',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && ' ↑'}
                        {header.column.getIsSorted() === 'desc' && ' ↓'}
                      </Box>
                      <div style={{ flexShrink: 0 }}>
                        {header.column.getCanFilter() && (
                          <ColumnFilter column={header.column} table={table} />
                        )}
                      </div>

                      {/* Column Resizer with width limits */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={(e) => {
                            const startX = e.clientX;
                            const startSize = header.getSize();
                            const columnId = header.column.id;

                            const onMouseMove = (moveEvent: MouseEvent) => {
                              const delta = startX - moveEvent.clientX;
                              let newSize = Math.max(50, startSize + delta);

                              if (columnId === 'description') {
                                newSize = Math.min(newSize, 500);
                              } else {
                                newSize = Math.min(newSize, 300);
                              }

                              table.setColumnSizing((prev) => ({
                                ...prev,
                                [columnId]: newSize,
                              }));
                            };

                            const onMouseUp = () => {
                              document.removeEventListener('mousemove', onMouseMove);
                              document.removeEventListener('mouseup', onMouseUp);
                            };

                            document.addEventListener('mousemove', onMouseMove);
                            document.addEventListener('mouseup', onMouseUp);
                          }}
                          style={{
                            position: 'absolute',
                            left: '0',
                            top: 0,
                            height: '100%',
                            width: '4px',
                            background: 'transparent',
                            cursor: 'col-resize',
                            userSelect: 'none',
                            touchAction: 'none',
                            zIndex: 1,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderLeft = '2px solid #8E9CC5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderLeft = '2px solid transparent';
                            e.currentTarget.style.background = 'transparent';
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              minWidth: `${totalWidth}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = tableRows[virtualRow.index];
              const isRowFolder = isFolder(row.original);
              const rowStyle = isRowFolder
                ? getFolderRowStyle()
                : getRowStyleBySeverity((row.original as DataItem).severity);

              const isFirstUnassignedRow =
                !isRowFolder &&
                !(row.original as DataItem).isInFolder &&
                virtualRow.index > 0 &&
                tableRows
                  .slice(0, virtualRow.index)
                  .every(
                    (prevRow) =>
                      isFolder(prevRow.original) ||
                      (isDataItem(prevRow.original) && prevRow.original.isInFolder)
                  );

              // Get drag props for data rows (no hooks here)
              let dragProps = {};
              if (!isRowFolder) {
                const rowData = row.original as DataItem;
                const isInFolder = rowData.isInFolder || false;
                dragProps = createDragProps(rowData, isInFolder);
              }

              return (
                <div
                  key={row.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    display: 'flex',
                    direction: 'rtl',
                    transform: `translateY(${virtualRow.start}px) ${row.getIsSelected() ? 'scale(0.99)' : 'scale(1)'}`,
                    cursor: !isRowFolder ? 'pointer' : undefined,
                    paddingTop: '0px',
                    paddingRight: '0px',
                    // Add margin-top for first unassigned row
                    marginTop: isFirstUnassignedRow ? '3px' : '0px',
                    // No bottom padding for folders when expanded, and no padding for folder items
                    paddingBottom:
                      (isRowFolder &&
                        isFolder(row.original) &&
                        tableData.folderState.expandedFolders.has(row.original.id)) ||
                      (isDataItem(row.original) &&
                        row.original.isInFolder &&
                        row.original.folderId &&
                        tableData.folderState.expandedFolders.has(row.original.folderId))
                        ? '0px' // No margin for expanded folders and their items
                        : '3px', // Keep margin for normal standalone rows and collapsed folders
                  }}
                  onClick={() => handleRowClick(row.original)}
                  onContextMenu={(e) => !isRowFolder && handleContextMenu(e, row.original.id)}
                >
                  <div
                    style={{
                      width: '100%',
                      // Different height calculation based on row type and folder state
                      height:
                        // Expanded folder header - full height to connect seamlessly
                        (isRowFolder &&
                          isFolder(row.original) &&
                          tableData.folderState.expandedFolders.has(row.original.id)) ||
                        // Folder items - full height for no gaps
                        (isDataItem(row.original) &&
                          row.original.isInFolder &&
                          row.original.folderId &&
                          tableData.folderState.expandedFolders.has(row.original.folderId))
                          ? 'calc(100%)' // Full height for expanded folders and their items (no margin)
                          : 'calc(100% - 4px)', // Reduced height for normal rows and collapsed folders (creates margin)
                      display: 'flex',
                      direction: 'rtl',
                      borderRadius: '8px',
                      opacity: row.getIsSelected() ? 0.8 : 1,
                    }}
                  >
                    {isRowFolder ? (
                      <div
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          direction: 'rtl',
                          position: 'relative',
                          backgroundColor: '#FFFFFF80',
                          borderRadius: '8px',
                          border: '1px solid #8E9CC5',
                          marginTop: '2px', // Add margin for folder header
                          display: 'flex',
                          alignItems: 'center', // Center the folder content vertically
                          minHeight: '56px', // Match the row height
                          // Folder border styling
                          ...(isFolder(row.original) &&
                          tableData.folderState.expandedFolders.has(row.original.id)
                            ? {
                                // Expanded folder: remove bottom border and radius
                                borderBottom: 'none',
                                borderBottomLeftRadius: '0',
                                borderBottomRightRadius: '0',
                                marginBottom: '0', // Remove any margin below folder
                              }
                            : {
                                border: '1px solid #8E9CC5',
                                borderBottom: '1px solid #8E9CC5',
                                borderBottomLeftRadius: '8px',
                                borderBottomRightRadius: '8px',
                              }),
                        }}
                      >
                        <DraggableFolderRow
                          folder={row.original as FolderItem}
                          isExpanded={tableData.folderState.expandedFolders.has(
                            (row.original as FolderItem).id
                          )}
                          folderState={tableData.folderState}
                          onToggleExpansion={folderOperations.handleToggleFolderExpansion}
                          onRename={folderOperations.handleRenameFolder}
                          onDelete={folderOperations.handleDeleteFolder}
                          onDropRow={folderOperations.handleMoveRowToFolder}
                          // Add new props for inline editing
                          isEditing={
                            folderOperations.editingFolderId === (row.original as FolderItem).id
                          }
                          onStartEdit={folderOperations.handleStartEdit}
                          onSaveName={folderOperations.handleSaveFolderName}
                          onCancelEdit={folderOperations.handleCancelFolderEdit}
                        />
                      </div>
                    ) : (
                      <div
                        {...dragProps}
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          direction: 'rtl',
                          ...getRowStyleBySeverity((row.original as DataItem).severity),
                          opacity:
                            (row.original as DataItem).severity === 'disabled'
                              ? 0.7
                              : row.getIsSelected()
                                ? 0.8
                                : 1,
                          cursor: 'grab',
                          borderRadius: '6px',
                          // Folder item borders - connect to folder
                          ...(isDataItem(row.original) &&
                          row.original.isInFolder &&
                          row.original.folderId &&
                          tableData.folderState.expandedFolders.has(row.original.folderId)
                            ? {
                                // Items in expanded folders
                                border: '1px solid #8E9CC5',
                                borderTop: 'none', // Connect to folder above
                                borderTopLeftRadius: '0',
                                borderTopRightRadius: '0',
                                borderBottomLeftRadius: row.original.isLastInFolderGroup
                                  ? '6px'
                                  : '0',
                                borderBottomRightRadius: row.original.isLastInFolderGroup
                                  ? '6px'
                                  : '0',
                                borderBottom: row.original.isLastInFolderGroup
                                  ? '1px solid ##8E9CC5'
                                  : 'none',
                                margin: '0', // Remove any margins
                                // Remove separator between folder items to eliminate gaps
                              }
                            : {}),
                        }}
                        onClick={() => handleRowClick(row.original)}
                        onContextMenu={(e) => handleContextMenu(e, row.original.id)}
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => {
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
                                paddingRight:
                                  (row.original as any).isInFolder && isFirstCell ? '30px' : '16px',
                                backgroundColor: 'inherit',
                                borderTopRightRadius: isFirstCell ? '6px' : 0,
                                borderBottomRightRadius: isFirstCell ? '6px' : 0,
                                borderTopLeftRadius: isLastCell ? '6px' : 0,
                                borderBottomLeftRadius: isLastCell ? '6px' : 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                textAlign: 'right',
                                direction: 'rtl',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Group justify="center" mt="md">
        {selectionInfo.selectedRowsCount > 0 ? (
          <Group mb="md" justify="flex-start">
            <Text size="sm" fw={500} c="blue">
              {selectionInfo.selectedRowsCount} נבחרו מתוך {selectionInfo.totalFilteredRows} רשומות
            </Text>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            סה"כ {tableRows.length} רשומות
          </Text>
        )}
      </Group>

      {/* Modals */}
      <ManualAlertModal
        opened={modalStates.manualAlertModalOpen}
        onClose={() => modalStates.setManualAlertModalOpen(false)}
        onSave={tableData.handleAddManualAlert}
      />

      {/* Remove CreateFolderModal since we're doing inline creation */}

      <AddToFolderModal
        opened={modalStates.addToFolderModalOpen}
        onClose={() => {
          modalStates.setAddToFolderModalOpen(false);
          contextMenu.setRowIdsToMove([]);
          contextMenu.setContextMenuRowId(null);
          contextMenu.setContextMenuPosition(null);
        }}
        onAddToFolder={(folderId) => {
          const idsToMove =
            contextMenu.rowIdsToMove.length > 0
              ? contextMenu.rowIdsToMove
              : selectionInfo.selectedRowIds;
          if (idsToMove.length > 0) {
            folderOperations.handleMoveRowsToFolder(idsToMove, folderId);
            tableState.setRowSelection({});
          }
          modalStates.setAddToFolderModalOpen(false);
          contextMenu.setRowIdsToMove([]);
          contextMenu.setContextMenuRowId(null);
          contextMenu.setContextMenuPosition(null);
        }}
        folders={tableData.folderState.folders}
        selectedCount={
          contextMenu.rowIdsToMove.length > 0
            ? contextMenu.rowIdsToMove.length
            : selectionInfo.selectedRowsCount
        }
      />
    </div>
  );
}
