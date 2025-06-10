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
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Modal,
  Select,
  Text,
  TextInput,
} from '@mantine/core';
import { FolderItem, severityColorMap } from './types';

// Create Folder Modal
interface CreateFolderModalProps {
  opened: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  opened,
  onClose,
  onCreateFolder,
}) => {
  const [folderName, setFolderName] = useState('');

  const handleSubmit = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleSubmit();
    }
  };

  // Reset folder name when modal closes
  const handleClose = () => {
    setFolderName('');
    onClose();
  };

  return (
    <Modal
      style={{ direction: 'rtl', textAlign: 'right' }}
      opened={opened}
      onClose={handleClose}
      title="צור תיקייה חדשה"
      size="sm"
    >
      <div style={{ direction: 'rtl' }}>
        <TextInput
          label="שם התיקייה"
          placeholder="הכנס שם לתיקייה"
          value={folderName}
          onChange={(e) => setFolderName(e.currentTarget.value)}
          onKeyDown={handleKeyPress} // Changed from onKeyPress to onKeyDown for better reliability
          style={{ marginBottom: '1rem' }}
          data-autofocus
        />
        <Group justify="flex-start" gap="sm">
          <Button variant="subtle" onClick={handleClose}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={!folderName.trim()}>
            צור תיקייה
          </Button>
        </Group>
      </div>
    </Modal>
  );
};

// Add to Folder Modal
interface AddToFolderModalProps {
  opened: boolean;
  onClose: () => void;
  onAddToFolder: (folderId: string) => void;
  folders: FolderItem[];
  selectedCount: number;
}

export const AddToFolderModal: React.FC<AddToFolderModalProps> = ({
  opened,
  onClose,
  onAddToFolder,
  folders,
  selectedCount,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  const handleSubmit = () => {
    if (selectedFolderId) {
      onAddToFolder(selectedFolderId);
      setSelectedFolderId('');
      onClose();
    }
  };

  const folderOptions = folders.map((folder) => ({
    value: folder.id,
    label: folder.name,
  }));

  return (
    <Modal opened={opened} onClose={onClose} title="הוסף לתיקייה" size="sm">
      <div style={{ direction: 'rtl' }}>
        <Text size="sm" mb="md">
          הוסף {selectedCount} פריטים נבחרים לתיקייה:
        </Text>
        <Select
          label="בחר תיקייה"
          placeholder="בחר תיקייה"
          value={selectedFolderId}
          onChange={(value) => setSelectedFolderId(value || '')}
          data={folderOptions}
          style={{ marginBottom: '1rem' }}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedFolderId}>
            הוסף לתיקייה
          </Button>
        </Group>
      </div>
    </Modal>
  );
};

// Folder Row Component
interface FolderRowProps {
  folder: FolderItem;
  isExpanded: boolean;
  onToggleExpansion: (folderId: string) => void;
  onRename: (folderId: string, newName: string) => void;
  onDelete: (folderId: string) => void;
}

export const FolderRow: React.FC<FolderRowProps> = ({
  folder,
  isExpanded,
  onToggleExpansion,
  onRename,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

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
    // Adjust icon position slightly for better vertical alignment with text
    // Add a small bottom margin to push the icon down.
    // Based on user's previous manual edit, let's try marginBottom: -2
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
        return '#fff3f3'; // Light red color for critical severity border, matching row background
      case 'major':
        return '#fff8b7'; // Light yellow color for major severity border, matching row background
      case 'warning':
        return '#b5e1ff'; // Light blue color for warning severity border, matching row background
      case 'disabled':
        return '#f0f0f0'; // Light gray color for disabled severity border
      default:
        return severityColorMap[severity];
    }
  };

  return (
    <Group
      gap="xs"
      wrap="nowrap"
      style={{
        width: '100%',
        borderRadius: '4px',
        // padding: isExpanded ? '8px' : '0', // Add padding when border is present
        // marginBottom: isExpanded ? '8px' : '0', // Add margin below when expanded
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
              opacity: 0.7, // Make disabled badges slightly transparent
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
  );
};

// Folder Actions Button (for header)
interface FolderActionsProps {
  onCreateFolder: () => void;
  onAddToFolder: () => void;
  hasSelectedRows: boolean;
}

export const FolderActions: React.FC<FolderActionsProps> = ({
  onCreateFolder,
  onAddToFolder,
  hasSelectedRows,
}) => {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button
          variant="outline"
          size="xs"
          color="#1f3a8a"
          style={{
            borderRadius: '8px',
            backgroundColor: '#f9fafc',
            padding: '8px',
          }}
        >
          <MdCreateNewFolder size={18} />
        </Button>
      </Menu.Target>
      <Menu.Dropdown style={{ direction: 'rtl', textAlign: 'right' }}>
        <Menu.Label>פעולות תיקיות</Menu.Label>
        <Menu.Item
          style={{ direction: 'rtl', textAlign: 'right' }}
          leftSection={<MdAdd size={16} />}
          onClick={onCreateFolder}
        >
          צור תיקייה חדשה
        </Menu.Item>
        {hasSelectedRows && (
          <Menu.Item
            style={{ direction: 'rtl', textAlign: 'right' }}
            leftSection={<MdFolder size={16} />}
            onClick={onAddToFolder}
          >
            הוסף נבחרים לתיקייה
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
