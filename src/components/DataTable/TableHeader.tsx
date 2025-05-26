// TableHeader.tsx - Table header with search, controls, export and folders (RTL)
import React from 'react';
import { IconDownload, IconFileExport, IconSearch } from '@tabler/icons-react';
import { ActionIcon, Group, Menu, Select, Text, TextInput } from '@mantine/core';
import { ColumnSelector } from './ColumnSelector';
import { FolderActions } from './FolderComponents';
import { DataItem, FolderItem } from './types';

interface TableHeaderProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  allColumns: any[];
  columnVisibility: any;
  setColumnVisibility: (visibility: any) => void;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  showAllColumns: () => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  // Export props
  table: any;
  data: DataItem[];
  // Folder props
  folders: FolderItem[];
  hasSelectedRows: boolean;
  onCreateFolder: () => void;
  onAddToFolder: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  globalFilter,
  setGlobalFilter,
  allColumns,
  columnVisibility,
  setColumnVisibility,
  columnOrder,
  setColumnOrder,
  showAllColumns,
  pageSize,
  setPageSize,
  table,
  data,
  // Folder props
  folders,

  onCreateFolder,
  onAddToFolder,
}) => {
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
    <div style={{ direction: 'rtl' }}>
      <Group mb="md" justify="space-between">
        <Group>
          <TextInput
            placeholder="חיפוש בכל העמודות..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.currentTarget.value)}
            rightSection={<IconSearch size={16} />} // Changed from leftSection to rightSection for RTL
            style={{ width: '300px' }}
          />
          <ColumnSelector
            allColumns={allColumns}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            columnOrder={columnOrder}
            setColumnOrder={setColumnOrder}
            showAllColumns={showAllColumns}
          />
          <FolderActions
            onCreateFolder={onCreateFolder}
            onAddToFolder={onAddToFolder}
            hasSelectedRows={hasSelectedRows}
          />
        </Group>

        <Group>
          <Text size="sm">פריטים בעמוד:</Text>
          <Select
            value={String(pageSize)}
            onChange={(value) => {
              setPageSize(Number(value));
            }}
            data={['5', '10', '20', '50','500']}
            style={{ width: '80px' }}
          />

          {/* Export Menu */}
          <Menu shadow="md" width={220} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Export data">
                <IconDownload size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {/* Export Selected - only show if rows are selected */}
              {hasSelectedRows && (
                <>
                  <Menu.Label>
                    <Group gap="xs">
                      <IconFileExport size={14} />
                      <Text>ייצא נבחרים ({selectedRows.length})</Text>
                    </Group>
                  </Menu.Label>
                  <Menu.Item onClick={() => exportSelected('csv')}>CSV קובץ</Menu.Item>
                  <Menu.Item onClick={() => exportSelected('json')}>JSON קובץ</Menu.Item>
                  <Menu.Divider />
                </>
              )}

              {/* Export All */}
              <Menu.Label>ייצוא כל הנתונים</Menu.Label>
              <Menu.Item onClick={() => exportAll('csv')}>CSV - כל הנתונים</Menu.Item>
              <Menu.Item onClick={() => exportAll('json')}>JSON - כל הנתונים</Menu.Item>

              <Menu.Divider />

              {/* Export Filtered */}
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
      </Group>
    </div>
  );
};
