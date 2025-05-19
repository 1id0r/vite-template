// DataTableDefinition.tsx - Column definitions
import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Text, Tooltip } from '@mantine/core';
import { EnvironmentBadge, ImpactBadge, SeverityBadge, StatusBadge } from './Badges';
import { DataItem } from './types';

// Create column helper
const columnHelper = createColumnHelper<DataItem>();

// Define columns with sizes and customizations
export const createColumns = () => [
  columnHelper.accessor('objectId', {
    header: 'שם יישות',
    cell: (info) => (
      <Text c="grey" fw={600}>
        {info.getValue()}
      </Text>
    ),
    enableColumnFilter: true,
    size: 150,
  }),
  columnHelper.accessor('description', {
    header: 'תיאור',
    cell: (info) => (
      <Tooltip label={info.getValue()} multiline w={300} withArrow>
        <Text
          c="black"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '300px',
          }}
        >
          {info.getValue()}
        </Text>
      </Tooltip>
    ),
    enableColumnFilter: true,
    size: 300,
  }),
  columnHelper.accessor('hierarchy', {
    header: 'היררכיה',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    size: 250,
  }),
  columnHelper.accessor('lastUpdated', {
    header: 'עודכן לאחרונה',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    size: 150,
  }),
  columnHelper.accessor('startTime', {
    header: 'זמן התחלה',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    size: 150,
  }),
  columnHelper.accessor('status', {
    header: 'סטטוס',
    cell: (info) => <StatusBadge status={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
    size: 120,
  }),
  columnHelper.accessor('impact', {
    header: 'אימפקט עסקי',
    cell: (info) => <ImpactBadge impact={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
    size: 120,
  }),
  columnHelper.accessor('environment', {
    header: 'סביבה',
    cell: (info) => <EnvironmentBadge environment={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
    size: 150,
  }),
  columnHelper.accessor('origin', {
    header: 'מקור התראה',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    size: 120,
  }),
  columnHelper.accessor('snId', {
    header: 'SN מזהה',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    size: 150,
  }),
  columnHelper.accessor('identities', {
    header: 'Identities',
    cell: (info) => <Text color="black">{info.getValue()}</Text>,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const identities = row.getValue(columnId) as string[];
      return identities.some((identity) =>
        identity.toLowerCase().includes(filterValue.toLowerCase())
      );
    },
    size: 250,
  }),
  // Severity column
  columnHelper.accessor('severity', {
    header: 'חומרה',
    cell: (info) => <SeverityBadge severity={info.getValue()} />,
    enableColumnFilter: true,
    filterFn: 'equals',
    size: 120,
  }),
];
