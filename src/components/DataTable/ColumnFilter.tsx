import React, { useMemo } from 'react';
import { MdFilterList } from 'react-icons/md';
import { ActionIcon, Popover, Select, Stack, Text, TextInput } from '@mantine/core';
import { DataItem, isFolder } from './types';

// Filter component for text columns
export const ColumnFilter = ({ column, table }: { column: any; table: any }) => {
  // Get first non-folder row to determine column type
  const firstDataRow = table
    .getPreFilteredRowModel()
    .flatRows.find((row: any) => !isFolder(row.original));
  const firstValue = firstDataRow?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  // Get unique values for select filters (only from data rows, not folders)
  const uniqueValues = useMemo(() => {
    const dataRows = table
      .getPreFilteredRowModel()
      .flatRows.filter((row: any) => !isFolder(row.original));

    // Handle arrays like identities
    if (Array.isArray(firstValue)) {
      return Array.from(
        new Set(
          dataRows
            .flatMap((row: any) => {
              const value = row.getValue(column.id);
              return Array.isArray(value) ? value : [];
            })
            .filter(Boolean) // Remove empty/null/undefined values
        )
      ).sort();
    }

    // Handle enum values like status, impact, environment, severity
    if (
      column.id === 'status' ||
      column.id === 'impact' ||
      column.id === 'environment' ||
      column.id === 'severity'
    ) {
      return Array.from(
        new Set(
          dataRows
            .map((row: any) => row.getValue(column.id))
            .filter((value: any) => value !== null && value !== undefined && value !== '') // Filter out empty values
        )
      ).sort();
    }

    return [];
  }, [column.id, firstValue, table]);

  // For enum columns, use a select input
  if (
    column.id === 'status' ||
    column.id === 'impact' ||
    column.id === 'environment' ||
    column.id === 'severity' ||
    Array.isArray(firstValue)
  ) {
    return (
      <Popover position="bottom" shadow="md" withinPortal>
        <Popover.Target>
          <ActionIcon size="sm" variant="subtle" color="gray">
            <MdFilterList size={16} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack>
            <Text dir="rtl" size="sm">
              פילטר {column.columnDef.header}
            </Text>
            <Select
              placeholder="Select value"
              value={columnFilterValue?.toString() || ''}
              onChange={(value) => column.setFilterValue(value || undefined)}
              data={[
                { value: '', label: 'הכל' }, // Changed to Hebrew and ensure single empty option
                ...uniqueValues
                  .filter((value) => value !== null && value !== undefined && value !== '') // Extra safety filter
                  .map((value: any) => ({
                    value: value?.toString() || '',
                    label: Array.isArray(firstValue)
                      ? value
                      : value
                        ? value.charAt(0).toUpperCase() + value.slice(1)
                        : '',
                  })),
              ]}
              searchable
              clearable
              size="xs"
              style={{
                minWidth: '150px',
                direction: 'rtl',
                textAlign: 'right',
              }}
            />
          </Stack>
        </Popover.Dropdown>
      </Popover>
    );
  }

  // Default text filter for other columns
  return (
    <Popover position="bottom" shadow="md" withinPortal>
      <Popover.Target>
        <ActionIcon size="md" variant="subtle" color="gray">
          <MdFilterList size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            סנן {column.columnDef.header}
          </Text>
          <TextInput
            placeholder="סנן..."
            value={(columnFilterValue ?? '') as string}
            onChange={(e) => column.setFilterValue(e.target.value)}
            size="xs"
            style={{
              minWidth: '150px',
              direction: 'rtl',
              textAlign: 'right',
            }}
          />
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
