import React, { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Checkbox, Text, Tooltip } from '@mantine/core';
import { ImpactBadge, SeverityBadge } from './Badges';
import { DataItem, isFolder, TableRow } from './types';

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

export const useTableColumns = () => {
  const columnHelper = useMemo(() => createColumnHelper<TableRow>(), []);

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => null,
        cell: ({ row }: any) => {
          if (isFolder(row.original)) return null;
          return (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
        enableHiding: false,
        enableResizing: false, // Disable resizing for select column
        size: 50,
        minSize: 50,
        maxSize: 50,
      },
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.objectId), {
        id: 'objectId',
        header: 'שם יישות',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return (
            <Text c="#3E4758" fw={400}>
              {info.getValue()}
            </Text>
          );
        },
        enableColumnFilter: false,
        enableHiding: false,
        enableSorting: true,
        enableResizing: false, // Disable resizing for objectId column
        size: 150,
        minSize: 50,
        maxSize: 300,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.description), {
        id: 'description',
        header: 'תיאור',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return (
            <Tooltip label={info.getValue()} multiline w={300} withArrow>
              <Text
                c="#3E4758"
                fw={400}
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {info.getValue()}
              </Text>
            </Tooltip>
          );
        },
        enableColumnFilter: false,
        enableHiding: false,
        enableSorting: true,
        enableResizing: true, // Enable resizing for description column
        size: 300,
        minSize: 100,
        maxSize: 500,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.startTime), {
        id: 'startTime',
        header: 'זמן התחלה',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return (
            <Text c="#3E4758" fw={400}>
              {formatDateDMHour(info.getValue())}
            </Text>
          );
        },
        enableColumnFilter: false,
        enableHiding: false,
        enableSorting: true,
        enableResizing: false, // Disable resizing for startTime column
        size: 150,
        minSize: 50,
        maxSize: 300,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.hierarchy), {
        id: 'hierarchy',
        header: 'היררכיה',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return (
            <Text c="#3E4758" fw={400}>
              {info.getValue()}
            </Text>
          );
        },
        enableColumnFilter: false,
        enableHiding: true,
        enableSorting: true,
        enableResizing: true, // Enable resizing for hierarchy column
        size: 250,
        minSize: 50,
        maxSize: 300,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.lastUpdated), {
        id: 'lastUpdated',
        header: 'עודכן לאחרונה',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return (
            <Text c="#3E4758" fw={400}>
              {formatDateDMHour(info.getValue())}
            </Text>
          );
        },
        enableColumnFilter: false,
        enableHiding: true,
        enableSorting: true,
        enableResizing: false, // Disable resizing for lastUpdated column
        size: 150,
        minSize: 50,
        maxSize: 300,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.impact), {
        id: 'impact',
        header: 'אימפקט עסקי',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return <ImpactBadge impact={info.getValue() as DataItem['impact']} />;
        },
        enableColumnFilter: false,
        enableHiding: true,
        enableSorting: true,
        enableResizing: true, // Enable resizing for impact column
        size: 120,
        minSize: 50,
        maxSize: 300,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.environment), {
        id: 'environment',
        header: 'סביבה',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return (
            <Text c="#3E4758" fw={400}>
              {info.getValue()}
            </Text>
          );
        },
        enableColumnFilter: true,
        enableHiding: true,
        enableSorting: true,
        enableResizing: false, // Disable resizing for environment column
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || isFolder(row.original)) return true;
          const environment = (row.original as DataItem).environment;
          return environment === filterValue;
        },
        size: 150,
        minSize: 50,
        maxSize: 300,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.origin), {
        id: 'origin',
        header: 'מקור התראה',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return (
            <Text c="#3E4758" fw={400}>
              {info.getValue()}
            </Text>
          );
        },
        enableColumnFilter: true,
        enableHiding: true,
        enableSorting: true,
        enableResizing: false, // Disable resizing for origin column
        size: 120,
        minSize: 50,
        maxSize: 300,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.snId), {
        id: 'snId',
        header: 'SN מזהה',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return (
            <Text c="#3E4758" fw={400}>
              {info.getValue()}
            </Text>
          );
        },
        enableColumnFilter: false,
        enableHiding: true,
        enableSorting: true,
        enableResizing: false, // Disable resizing for snId column
        size: 150,
        minSize: 50,
        maxSize: 300,
      }),
      columnHelper.accessor((row) => (isFolder(row) ? '' : row.severity), {
        id: 'severity',
        header: 'חומרה',
        cell: (info) => {
          if (isFolder(info.row.original)) return null;
          return <SeverityBadge severity={info.getValue() as DataItem['severity']} />;
        },
        enableColumnFilter: true,
        enableHiding: true,
        enableSorting: true,
        enableResizing: false, // Disable resizing for severity column
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || isFolder(row.original)) return true;
          const severity = (row.original as DataItem).severity;
          return severity === filterValue;
        },
        size: 120,
        minSize: 120,
        maxSize: 300,
      }),
    ],
    [columnHelper]
  );

  return columns;
};
