// ColumnFilter.tsx - Column filtering component
import React, { useMemo } from 'react';
import { IconFilter } from '@tabler/icons-react';
import { ActionIcon, Popover, Select, Stack, Text, TextInput } from '@mantine/core';

// Filter component for text columns
export const ColumnFilter = ({ column, table }: { column: any; table: any }) => {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  // Get unique values for select filters
  const uniqueValues = useMemo(() => {
    // Handle arrays like identities
    if (Array.isArray(firstValue)) {
      return Array.from(
        new Set(
          table.getPreFilteredRowModel().flatRows.flatMap((row: any) => row.getValue(column.id))
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
        new Set(table.getPreFilteredRowModel().flatRows.map((row: any) => row.getValue(column.id)))
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
            <IconFilter size={16} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack>
            <Text size="sm">Filter {column.columnDef.header}</Text>
            <Select
              placeholder="Select value"
              value={columnFilterValue?.toString() || ''}
              onChange={(value) => column.setFilterValue(value || undefined)}
              data={[
                { value: '', label: 'All' },
                ...uniqueValues.map((value: any) => ({
                  value: value.toString(),
                  label: Array.isArray(firstValue)
                    ? value
                    : value.charAt(0).toUpperCase() + value.slice(1),
                })),
              ]}
              searchable
              clearable
              size="xs"
              style={{ minWidth: '150px' }}
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
        <ActionIcon size="sm" variant="subtle" color="gray">
          <IconFilter size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Filter {column.columnDef.header}
          </Text>
          <TextInput
            placeholder="Filter..."
            value={(columnFilterValue ?? '') as string}
            onChange={(e) => column.setFilterValue(e.target.value)}
            size="xs"
            style={{ minWidth: '150px' }}
          />
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
