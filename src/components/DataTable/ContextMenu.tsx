import React from 'react';
import { MdCancel, MdCreateNewFolder } from 'react-icons/md';
import { Menu } from '@mantine/core';
import { FolderState } from './types';

interface ContextMenuProps {
  contextMenuPosition: { x: number; y: number } | null;
  contextMenuRowId: string | null;
  folderState: FolderState;
  onClose: () => void;
  onAddToFolder: () => void;
  onRemoveFromFolder: (rowId: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  contextMenuPosition,
  contextMenuRowId,
  folderState,
  onClose,
  onAddToFolder,
  onRemoveFromFolder,
}) => {
  if (!contextMenuPosition || !contextMenuRowId) return null;

  const isRowInFolder = folderState.folders.some((folder) =>
    folder.rowIds.includes(contextMenuRowId)
  );

  return (
    <Menu
      opened={!!contextMenuPosition}
      onClose={onClose}
      position="bottom-start"
      offset={0}
      styles={{
        dropdown: {
          position: 'fixed',
          top: contextMenuPosition.y,
          left: contextMenuPosition.x,
          zIndex: 1000,
        },
      }}
      withArrow
    >
      <Menu.Target>
        {/* This target is just to anchor the menu, not visible */}
        <div
          style={{
            position: 'fixed',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            width: 1,
            height: 1,
            zIndex: -1,
          }}
        />
      </Menu.Target>
      <Menu.Dropdown>
        {!isRowInFolder && (
          <Menu.Item leftSection={<MdCreateNewFolder size={14} />} onClick={onAddToFolder}>
            הוסף לתיקייה
          </Menu.Item>
        )}
        {isRowInFolder && (
          <Menu.Item
            leftSection={<MdCancel size={14} />}
            onClick={() => onRemoveFromFolder(contextMenuRowId)}
          >
            הסר מתיקייה
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
