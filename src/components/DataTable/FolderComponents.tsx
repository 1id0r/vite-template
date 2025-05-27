// FolderComponents.tsx - UI components for folder functionality

import React, { useState } from 'react';
import {
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconFolder,
  IconFolderPlus,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { ActionIcon, Button, Group, Menu, Modal, Select, Text, TextInput } from '@mantine/core';
import { FolderItem } from './types';

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
    <Modal opened={opened} onClose={handleClose} title="צור תיקייה חדשה" size="sm">
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
        <Group justify="flex-end" gap="sm">
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

  return (
    <Group gap="xs" wrap="nowrap" style={{ width: '100%' }}>
      <ActionIcon variant="subtle" size="sm" onClick={() => onToggleExpansion(folder.id)}>
        {isExpanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
      </ActionIcon>

      <IconFolder size={18} color="black" />

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
          {folder.name} ({folder.rowIds.length})
        </Text>
      )}

      {/* Edit and Delete icons right next to the name */}
      <ActionIcon variant="subtle" size="md" onClick={() => setIsEditing(true)} color="blue">
        <IconEdit size={18} />
      </ActionIcon>

      <ActionIcon variant="subtle" size="md" onClick={() => onDelete(folder.id)} color="red">
        <IconTrash size={18} />
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
        <Button leftSection={<IconFolderPlus size={16} />} variant="subtle" size="sm"></Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>פעולות תיקיות</Menu.Label>
        <Menu.Item leftSection={<IconPlus size={16} />} onClick={onCreateFolder}>
          צור תיקייה חדשה
        </Menu.Item>
        {hasSelectedRows && (
          <Menu.Item leftSection={<IconFolder size={16} />} onClick={onAddToFolder}>
            הוסף נבחרים לתיקייה
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
