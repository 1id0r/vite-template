// Badges.tsx - All badge components
import React from 'react';
import { Badge } from '@mantine/core';
import {
  DataItem,
  environmentColorMap,
  impactColorMap,
  severityColorMap,
  statusColorMap,
} from './types';

// Create status badge with appropriate color
export const StatusBadge = ({ status }: { status: DataItem['status'] }) => {
  return (
    <Badge color={statusColorMap[status]} variant="filled" radius="md" size="sm">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Create impact badge with appropriate color
export const ImpactBadge = ({ impact }: { impact: DataItem['impact'] }) => {
  return (
    <Badge color={impactColorMap[impact]} variant="filled" radius="md" size="sm">
      {impact.charAt(0).toUpperCase() + impact.slice(1)}
    </Badge>
  );
};

// Create environment badge with appropriate color
export const EnvironmentBadge = ({ environment }: { environment: DataItem['environment'] }) => {
  return (
    <Badge color={environmentColorMap[environment]} variant="filled" radius="md" size="sm">
      {environment.charAt(0).toUpperCase() + environment.slice(1)}
    </Badge>
  );
};

// Severity Badge component
export const SeverityBadge = ({ severity }: { severity: DataItem['severity'] }) => {
  return (
    <Badge color={severityColorMap[severity]} variant="filled" radius="md" size="sm">
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};
