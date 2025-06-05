import React from 'react';
import { MdCancel, MdInfo, MdWarning } from 'react-icons/md';
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
  const getBorderColor = (severity: DataItem['severity']) => {
    switch (severity) {
      case 'major':
        return '#ffd700'; // Golden yellow color for major severity
      case 'critical':
        return severityColorMap[severity];
      case 'warning':
        return severityColorMap[severity];
      default:
        return severityColorMap[severity];
    }
  };

  const getIcon = (severity: DataItem['severity']) => {
    const iconStyle = { position: 'relative' as const, top: 2, marginLeft: 4 };
    switch (severity) {
      case 'critical':
        return <MdCancel size={12} style={iconStyle} />;
      case 'major':
        return <MdWarning size={12} style={iconStyle} />;
      case 'warning':
        return <MdInfo size={12} style={iconStyle} />;
      default:
        return null;
    }
  };

  return (
    <Badge
      color={severityColorMap[severity]}
      variant="light"
      radius="md"
      size="sm"
      style={{
        border: `1px solid ${getBorderColor(severity)}`,
        backgroundColor: 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        padding: '0 8px',
        height: '20px',
      }}
    >
      {getIcon(severity)}
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};
