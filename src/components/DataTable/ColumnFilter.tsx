import React, { useMemo } from 'react';
import { MdFilterList } from 'react-icons/md';
import { ActionIcon, Popover, Select, Stack, Text, TextInput } from '@mantine/core';
import { DataItem, environmentOptions, isFolder } from './types';

export const ColumnFilter = ({ column, table }: { column: any; table: any }) => {
  const firstDataRow = table
    .getPreFilteredRowModel()
    .flatRows.find((row: any) => !isFolder(row.original));
  const firstValue = firstDataRow?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const uniqueValues = useMemo(() => {
    const dataRows = table
      .getPreFilteredRowModel()
      .flatRows.filter((row: any) => !isFolder(row.original));

    if (Array.isArray(firstValue)) {
      return Array.from(
        new Set(
          dataRows
            .flatMap((row: any) => {
              const value = row.getValue(column.id);
              return Array.isArray(value) ? value : [];
            })
            .filter(Boolean)
        )
      ).sort();
    }

    if (column.id === 'environment') {
      return environmentOptions.slice();
    }

    if (column.id === 'status' || column.id === 'impact' || column.id === 'severity') {
      return Array.from(
        new Set(
          dataRows
            .map((row: any) => row.getValue(column.id))
            .filter((value: any) => value !== null && value !== undefined && value !== '')
        )
      ).sort();
    }

    return [];
  }, [column.id, firstValue, table]);

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
                { value: '', label: 'הכל' },
                ...uniqueValues
                  .filter((value) => value !== null && value !== undefined && value !== '')
                  .map((value: any) => ({
                    value: value?.toString() || '',
                    label: Array.isArray(firstValue)
                      ? value
                      : column.id === 'environment'
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
