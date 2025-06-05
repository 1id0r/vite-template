import React from 'react';
import { IconDownload, IconFileExport } from '@tabler/icons-react';
import { Button, Group, Menu, Text } from '@mantine/core';
import { DataItem } from './types';

interface ExportControlsProps {
  table: any;
  data: DataItem[];
}

export const ExportControls: React.FC<ExportControlsProps> = ({ table, data }) => {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;

  // Convert data to CSV format
  const convertToCSV = (items: DataItem[]): string => {
    if (items.length === 0) return '';

    // Define headers in Hebrew
    const headers = [
      'שם יישות',
      'תיאור',
      'היררכיה',
      'עודכן לאחרונה',
      'זמן התחלה',
      'סטטוס',
      'אימפקט עסקי',
      'סביבה',
      'מקור התראה',
      'SN מזהה',
      'מזהים',
      'חומרה',
    ];

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...items.map((item) =>
        [
          `"${item.objectId}"`,
          `"${item.description.replace(/"/g, '""')}"`,
          `"${item.hierarchy}"`,
          `"${item.lastUpdated}"`,
          `"${item.startTime}"`,
          `"${item.status}"`,
          `"${item.impact}"`,
          `"${item.environment}"`,
          `"${item.origin}"`,
          `"${item.snId}"`,
          `"${item.identities.join('; ')}"`,
          `"${item.severity}"`,
        ].join(',')
      ),
    ].join('\n');

    return csvContent;
  };

  // Convert data to JSON format
  const convertToJSON = (items: DataItem[]): string => {
    return JSON.stringify(items, null, 2);
  };

  // Download file function
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export selected rows
  const exportSelected = (format: 'csv' | 'json') => {
    const selectedData = selectedRows.map((row: any) => row.original);
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const csvContent = convertToCSV(selectedData);
      downloadFile(csvContent, `selected-data-${timestamp}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const jsonContent = convertToJSON(selectedData);
      downloadFile(jsonContent, `selected-data-${timestamp}.json`, 'application/json');
    }
  };

  // Export all data
  const exportAll = (format: 'csv' | 'json') => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const csvContent = convertToCSV(data);
      downloadFile(csvContent, `all-data-${timestamp}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const jsonContent = convertToJSON(data);
      downloadFile(jsonContent, `all-data-${timestamp}.json`, 'application/json');
    }
  };

  // Export filtered data
  const exportFiltered = (format: 'csv' | 'json') => {
    const filteredData = table.getFilteredRowModel().rows.map((row: any) => row.original);
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const csvContent = convertToCSV(filteredData);
      downloadFile(csvContent, `filtered-data-${timestamp}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const jsonContent = convertToJSON(filteredData);
      downloadFile(jsonContent, `filtered-data-${timestamp}.json`, 'application/json');
    }
  };

  return (
    <Group gap="xs">
      {/* Export Selected */}
      {hasSelectedRows && (
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button leftSection={<IconFileExport size={16} />} variant="outline" color="blue">
              ייצא נבחרים ({selectedRows.length})
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>ייצוא נבחרים</Menu.Label>
            <Menu.Item onClick={() => exportSelected('csv')}>CSV קובץ</Menu.Item>
            <Menu.Item onClick={() => exportSelected('json')}>JSON קובץ</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}

      {/* Export All/Filtered */}
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button leftSection={<IconDownload size={16} />} variant="filled">
            ייצא נתונים
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>ייצוא כל הנתונים</Menu.Label>
          <Menu.Item onClick={() => exportAll('csv')}>CSV - כל הנתונים</Menu.Item>
          <Menu.Item onClick={() => exportAll('json')}>JSON - כל הנתונים</Menu.Item>

          <Menu.Divider />

          <Menu.Label>ייצוא נתונים מסוננים</Menu.Label>
          <Menu.Item onClick={() => exportFiltered('csv')}>CSV - נתונים מסוננים</Menu.Item>
          <Menu.Item onClick={() => exportFiltered('json')}>JSON - נתונים מסוננים</Menu.Item>

          <Menu.Divider />

          <Menu.Item disabled>
            <Text size="xs" c="dimmed">
              {table.getFilteredRowModel().rows.length} רשומות מסוננות
            </Text>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};
