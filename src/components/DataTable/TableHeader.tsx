import React from 'react';
import { MdDownload, MdFileUpload, MdSearch } from 'react-icons/md';
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

  const convertToJSON = (items: DataItem[]): string => {
    return JSON.stringify(items, null, 2);
  };

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
            leftSection={<MdSearch size={16} />}
            style={{
              width: '250px',
              borderRadius: '16px',
            }}
            styles={{
              input: {
                backgroundColor: '#f9fafc',
                borderColor: '#687aaf',

                '&:focus': {
                  borderColor: '#687aaf',
                },
              },
            }}
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
          {/* Export Menu */}
          <Menu shadow="md" width={220} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="outline"
                size="md"
                aria-label="Export data"
                color="#687aaf"
                style={{ backgroundColor: '#f9fafc', borderRadius: '8px' }}
              >
                <MdDownload size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown style={{ direction: 'rtl', textAlign: 'right' }}>
              {/* Export Selected - only show if rows are selected */}
              {hasSelectedRows && (
                <>
                  <Menu.Label>
                    <Group gap="xs">
                      <MdFileUpload size={14} />
                      <Text>ייצא נבחרים ({selectedRows.length})</Text>
                    </Group>
                  </Menu.Label>
                  <Menu.Item onClick={() => exportSelected('csv')}>
                    <Text style={{ direction: 'rtl', textAlign: 'right' }}>קובץ CSV</Text>
                  </Menu.Item>
                  <Menu.Item onClick={() => exportSelected('json')}>
                    <Text style={{ direction: 'rtl', textAlign: 'right' }}>קובץ JSON</Text>
                  </Menu.Item>
                  <Menu.Divider />
                </>
              )}

              {/* Export All */}
              <Menu.Label>ייצוא כל הנתונים</Menu.Label>
              <Menu.Item onClick={() => exportAll('csv')}>
                <Text style={{ direction: 'rtl', textAlign: 'right' }}>כל הנתונים - CSV</Text>
              </Menu.Item>
              <Menu.Item onClick={() => exportAll('json')}>
                <Text style={{ direction: 'rtl', textAlign: 'right' }}>כל הנתונים - JSON</Text>
              </Menu.Item>

              <Menu.Divider />

              {/* Export Filtered */}
              <Menu.Label>ייצוא נתונים מסוננים</Menu.Label>
              <Menu.Item onClick={() => exportFiltered('csv')}>
                <Text style={{ direction: 'rtl', textAlign: 'right' }}>נתונים מסוננים - CSV</Text>
              </Menu.Item>
              <Menu.Item onClick={() => exportFiltered('json')}>
                <Text style={{ direction: 'rtl', textAlign: 'right' }}>נתונים מסוננים - JSON</Text>
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item disabled>
                <Text size="xs" c="dimmed">
                  {table.getFilteredRowModel().rows.length} רשומות מסוננות
                </Text>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* <Group>
          {/* <Text size="sm">פריטים בעמוד:</Text>
          <Select
            value={String(pageSize)}
            onChange={(value) => {
              setPageSize(Number(value));
            }}
            data={['5', '10', '20', '50', '500']}
            style={{ width: '80px' }}
          /> */}
        {/* </Group> */}
      </Group>
    </div>
  );
};
