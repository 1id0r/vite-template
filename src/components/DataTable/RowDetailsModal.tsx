import React from 'react';
import { MdCancel } from 'react-icons/md';
import { ActionIcon, Box, Group, Stack, Text } from '@mantine/core';
import { DataItem } from './types';

// Format date as d/m and hour:minute
function formatDateDMHour(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month} ${hour}:${minute}`;
}

interface RowDetailsModalProps {
  selectedRow: DataItem | null;
  modalOpen: boolean;
  onClose: () => void;
}

export const RowDetailsModal: React.FC<RowDetailsModalProps> = ({
  selectedRow,
  modalOpen,
  onClose,
}) => {
  if (!modalOpen || !selectedRow) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: 400,
        background: 'white',
        boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
        zIndex: 10,
        padding: 24,
        overflowY: 'auto',
        borderRadius: 0,
      }}
    >
      <Group justify="space-between" mb="md">
        <Text fw={700} size="lg">
          פרטי רשומה
        </Text>
        <ActionIcon onClick={onClose} variant="subtle">
          <MdCancel />
        </ActionIcon>
      </Group>
      <Stack gap="xs">
        <Text>שם יישות: {selectedRow.objectId}</Text>
        <Text>תיאור: {selectedRow.description}</Text>
        <Text>היררכיה: {selectedRow.hierarchy}</Text>
        <Text>עודכן לאחרונה: {formatDateDMHour(selectedRow.lastUpdated)}</Text>
        <Text>זמן התחלה: {formatDateDMHour(selectedRow.startTime)}</Text>
        <Text>סטטוס: {selectedRow.status}</Text>
        <Text>אימפקט עסקי: {selectedRow.impact}</Text>
        <Text>סביבה: {selectedRow.environment}</Text>
        <Text>מקור התראה: {selectedRow.origin}</Text>
        <Text>SN מזהה: {selectedRow.snId}</Text>
        <Text>מזהים: {selectedRow.identities?.join(', ')}</Text>
        <Text>חומרה: {selectedRow.severity}</Text>
      </Stack>
    </Box>
  );
};
