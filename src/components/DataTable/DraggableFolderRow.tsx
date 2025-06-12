import React, { useState } from 'react';
import {
  MdAdd,
  MdBlock,
  MdCancel,
  MdCreateNewFolder,
  MdDelete,
  MdEdit,
  MdFolder,
  MdInfo,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdWarning,
} from 'react-icons/md';
import { ActionIcon, Badge, Group, Text, TextInput } from '@mantine/core';
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
}

export const DraggableFolderRow: React.FC<DraggableFolderRowProps> = ({
  folder,
  isExpanded,
  folderState,
  onToggleExpansion,
  onRename,
  onDelete,
  onDropRow,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  // Drop target functionality
  const { dropRef, isOver, canDrop, dropProps } = useDropTarget(folder.id, folderState, onDropRow);

  const handleSaveEdit = () => {
    if (editName.trim() && editName.trim() !== folder.name) {
      onRename(folder.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(folder.name);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
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

  return (
    <div
      ref={dropRef}
      {...dropProps}
      style={{
        width: '100%',
        borderRadius: '4px',
        padding: '4px',
        transition: 'all 0.2s ease',
        position: 'relative',
        minHeight: '40px',
        // Visual feedback for drag over
        ...(isOver &&
          canDrop && {
            backgroundColor: 'rgba(34, 139, 230, 0.1)',
            border: '2px dashed #228be6',
          }),
        ...(isOver &&
          !canDrop && {
            backgroundColor: 'rgba(250, 82, 82, 0.1)',
            border: '2px dashed #fa5252',
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
            color: canDrop ? '#228be6' : '#fa5252',
            backgroundColor: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            zIndex: 10,
          }}
        >
          {canDrop ? 'הוסף לתיקייה' : 'לא ניתן להוסיף'}
        </div>
      )}

      <Group
        gap="xs"
        wrap="nowrap"
        style={{
          width: '100%',
        }}
      >
        <ActionIcon variant="subtle" size="sm" onClick={() => onToggleExpansion(folder.id)}>
          {isExpanded ? <MdKeyboardArrowDown size={18} /> : <MdKeyboardArrowRight size={18} />}
        </ActionIcon>

        <MdFolder size={18} color="black" />

        {isEditing ? (
          <TextInput
            value={editName}
            onChange={(e) => setEditName(e.currentTarget.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSaveEdit}
            size="xs"
            style={{ minWidth: '150px' }}
            autoFocus
          />
        ) : (
          <Text fw={500} onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
            {folder.name}
          </Text>
        )}

        {/* Severity badges with counts */}
        <Group gap={4} style={{ flexShrink: 0 }}>
          {folder.criticalCount > 0 && (
            <Badge
              color={severityColorMap.critical}
              variant="light"
              radius="xl"
              size="sm"
              style={{
                border: `2px solid ${getSeverityColor('critical')}`,
                backgroundColor: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '0 8px',
                height: '20px',
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
                border: `2px solid ${getSeverityColor('major')}`,
                backgroundColor: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '0 8px',
                height: '20px',
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
                border: `2px solid ${getSeverityColor('warning')}`,
                backgroundColor: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '0 8px',
                height: '20px',
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
                height: '20px',
                opacity: 0.7,
              }}
            >
              {getSeverityIcon('disabled')}
              {folder.disabledCount}
            </Badge>
          )}
        </Group>

        <ActionIcon variant="subtle" size="md" onClick={() => setIsEditing(true)} color="blue">
          <MdEdit size={18} />
        </ActionIcon>

        <ActionIcon variant="subtle" size="md" onClick={() => onDelete(folder.id)} color="red">
          <MdDelete size={18} />
        </ActionIcon>
      </Group>
    </div>
  );
};
