import React, { useEffect, useRef, useState } from 'react';
import { FiEdit } from 'react-icons/fi';
import {
  MdBlock,
  MdCancel,
  MdDelete,
  MdFolder,
  MdInfo,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdWarning,
} from 'react-icons/md';
import { ActionIcon, Badge, Group, Stack, Text, TextInput } from '@mantine/core';
import { useDropTarget } from './DragDropHooks';
import { FolderItem, FolderState, severityColorMap } from './types';

interface DraggableFolderRowProps {
  folder: FolderItem;
  isExpanded: boolean;
  folderState: FolderState;
  onToggleExpansion: (folderId: string) => void;
  onRename: (folderId: string, newName: string) => void;
  onDelete: (folderId: string) => void;
  onDropRow: (rowId: string, targetFolderId: string) => void;
  // New props for inline editing
  isEditing?: boolean;
  onStartEdit?: (folderId: string) => void;
  onSaveName?: (folderId: string, newName: string) => void;
  onCancelEdit?: (folderId: string) => void;
}

export const DraggableFolderRow: React.FC<DraggableFolderRowProps> = ({
  folder,
  isExpanded,
  folderState,
  onToggleExpansion,
  onRename,
  onDelete,
  onDropRow,
  isEditing = false,
  onStartEdit,
  onSaveName,
  onCancelEdit,
}) => {
  const [editName, setEditName] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Drop target functionality
  const { dropRef, isOver, canDrop, dropProps } = useDropTarget(folder.id, folderState, onDropRow);

  // Auto-focus when editing starts
  useEffect(() => {
    if ((isEditing || !folder.name) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, folder.name]);

  // Update local state when folder name changes
  useEffect(() => {
    setEditName(folder.name);
  }, [folder.name]);

  const handleSaveEdit = () => {
    if (onSaveName) {
      onSaveName(folder.id, editName);
    } else {
      // Fallback to old rename function
      if (editName.trim() && editName.trim() !== folder.name) {
        onRename(folder.id, editName.trim());
      }
    }
  };

  const handleCancelEdit = () => {
    if (onCancelEdit) {
      onCancelEdit(folder.id);
    }
    setEditName(folder.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleStartEditing = () => {
    if (onStartEdit) {
      onStartEdit(folder.id);
    }
  };

  const getSeverityIcon = (severity: 'critical' | 'major' | 'warning' | 'disabled') => {
    const iconStyle = { marginBottom: -2 };
    switch (severity) {
      case 'critical':
        return <MdCancel size={12} style={iconStyle} />;
      case 'major':
        return <MdWarning size={12} style={iconStyle} />;
      case 'warning':
        return <MdInfo size={12} style={iconStyle} />;
      case 'disabled':
        return <MdBlock size={12} style={iconStyle} />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: 'critical' | 'major' | 'warning' | 'disabled') => {
    switch (severity) {
      case 'critical':
        return '#fff3f3';
      case 'major':
        return '#fff8b7';
      case 'warning':
        return '#b5e1ff';
      case 'disabled':
        return '#f0f0f0';
      default:
        return severityColorMap[severity];
    }
  };

  const isInputEmpty = editName.trim() === '';
  const showWarning = (isEditing || !folder.name) && isInputEmpty;

  return (
    <div
      ref={dropRef}
      {...dropProps}
      style={{
        width: '100%',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        position: 'relative',
        display: 'flex',

        alignItems: 'center',
        ...(isOver &&
          canDrop && {
            backgroundColor: 'rgba(34, 139, 230, 0.1)',
            border: '2px dashed #228be6',
          }),
        ...(isOver &&
          !canDrop && {
            backgroundColor: 'rgba(250, 82, 82, 0.1)',
            border: '2px dashed #228be6',
          }),
      }}
    >
      {/* Drop zone indicator */}
      {isOver && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '8px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#228be6',
            backgroundColor: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            zIndex: 10,
          }}
        >
          הוסף לתיקייה
        </div>
      )}
      <Group
        gap="xs"
        wrap="nowrap"
        style={{
          width: '100%',
        }}
      >
        <ActionIcon
          variant="subtle"
          size="sm"
          color="#8E9CC5"
          onClick={() => onToggleExpansion(folder.id)}
        >
          {isExpanded ? <MdKeyboardArrowDown size={18} /> : <MdKeyboardArrowRight size={18} />}
        </ActionIcon>
        <ActionIcon variant="subtle" size="md" onClick={handleStartEditing} color="blue">
          <FiEdit color="#8E9CC5" size={18} />
        </ActionIcon>
        {/* <MdFolder size={18} color="black" /> */}

        {isEditing || !folder.name ? (
          <TextInput
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.currentTarget.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSaveEdit}
            size="xs"
            color="#e63946"
            style={{ minWidth: '150px' }}
            placeholder="הכנס שם התיקייה"
            error={showWarning}
            styles={{
              input: {
                direction: 'rtl',
                textAlign: 'right',
              },
            }}
          />
        ) : (
          <Text
            fw={400}
            c="#3E4758"
            onClick={handleStartEditing}
            style={{
              cursor: 'pointer',
            }}
          >
            {folder.name}
          </Text>
        )}
        {showWarning ? (
          // Show warning alert when no name
          <Text
            size="xs"
            c="#e63946"
            fw={500}
            style={{
              whiteSpace: 'nowrap',
              direction: 'rtl',
              textAlign: 'center',
            }}
          >
            ⚠️ ללא שם התיקייה תימחק
          </Text>
        ) : (
          <>
            <Group gap={4} style={{ flexShrink: 0 }}>
              {folder.criticalCount > 0 && (
                <Badge
                  color={severityColorMap.critical}
                  variant="light"
                  radius="xl"
                  size="sm"
                  style={{
                    border: `1px solid #E54644`,
                    backgroundColor: '#FFE4E4',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '0 8px',
                    height: '24px',
                    width: '40px',
                  }}
                >
                  {getSeverityIcon('critical')}
                  {folder.criticalCount}
                </Badge>
              )}
              {folder.majorCount > 0 && (
                <Badge
                  color={severityColorMap.major}
                  variant="light"
                  radius="xl"
                  size="sm"
                  style={{
                    border: `1px solid #E9A91D`,
                    backgroundColor: '#FEFCE8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '0 8px',
                    height: '24px',
                    width: '40px',
                  }}
                >
                  {getSeverityIcon('major')}
                  {folder.majorCount}
                </Badge>
              )}
              {folder.warningCount > 0 && (
                <Badge
                  color={severityColorMap.warning}
                  variant="light"
                  radius="xl"
                  size="sm"
                  style={{
                    border: `1px solid #3075F6`,
                    backgroundColor: '#F0F9FF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '0 8px',
                    height: '24px',
                    width: '40px',
                  }}
                >
                  {getSeverityIcon('warning')}
                  {folder.warningCount}
                </Badge>
              )}
              {folder.disabledCount > 0 && (
                <Badge
                  color={severityColorMap.disabled}
                  variant="light"
                  radius="xl"
                  size="sm"
                  style={{
                    border: `2px solid ${getSeverityColor('disabled')}`,
                    backgroundColor: 'transparent',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '0 8px',
                    height: '24px',
                    width: '40px',
                    opacity: 0.7,
                  }}
                >
                  {getSeverityIcon('disabled')}
                  {folder.disabledCount}
                </Badge>
              )}
            </Group>

            <ActionIcon
              variant="subtle"
              size="md"
              onClick={() => onDelete(folder.id)}
              color="#E54644"
            >
              <MdDelete size={18} />
            </ActionIcon>
          </>
        )}
      </Group>
    </div>
  );
};
