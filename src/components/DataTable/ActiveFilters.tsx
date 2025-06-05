import React from 'react';
import { ActionIcon, Badge, Button, Group, Text } from '@mantine/core';

interface ActiveFiltersProps {
  table: any;
  setColumnFilters: (filters: any[]) => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({ table, setColumnFilters }) => {
  if (table.getState().columnFilters.length === 0) {
    return null;
  }

  return (
    <Group gap="xs" mb="md">
      <Text size="sm" fw={500}>
        פילטרים פעילים:
      </Text>
      {table.getState().columnFilters.map((filter: any) => {
        const column = table.getColumn(filter.id);
        const columnName = column?.columnDef?.header as string;
        return (
          <Badge
            key={filter.id}
            rightSection={
              <ActionIcon
                size="xs"
                radius="xl"
                variant="transparent"
                onClick={() => column?.setFilterValue(undefined)}
              >
                ×
              </ActionIcon>
            }
          >
            {columnName}: {filter.value as string}
          </Badge>
        );
      })}
      <Button variant="subtle" size="xs" onClick={() => setColumnFilters([])}>
        נקה הכל
      </Button>
    </Group>
  );
};
