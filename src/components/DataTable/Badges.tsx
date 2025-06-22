import React from 'react';
import { MdBlock, MdCancel, MdInfo, MdWarning } from 'react-icons/md';
import { Badge } from '@mantine/core';
import { DataItem, impactColorMap, severityColorMap, statusColorMap } from './types';

export const StatusBadge = ({ status }: { status: DataItem['status'] }) => {
  return (
    <Badge color={statusColorMap[status]} variant="filled" radius="md" size="sm">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const ImpactBadge = ({ impact }: { impact: DataItem['impact'] }) => {
  return (
    <Badge color={impactColorMap[impact]} variant="filled" radius="md" size="sm">
      {impact.charAt(0).toUpperCase() + impact.slice(1)}
    </Badge>
  );
};

export const SeverityBadge = ({ severity }: { severity: DataItem['severity'] }) => {
  const getBorderColor = (severity: DataItem['severity']) => {
    switch (severity) {
      case 'major':
        return '#ffd700';
      case 'critical':
        return severityColorMap[severity];
      case 'warning':
        return severityColorMap[severity];
      case 'disabled':
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
      case 'disabled':
        return <MdBlock size={12} style={iconStyle} />;
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
        fontWeight: '500',
        padding: '0 4px',
        height: '20px',
      }}
    >
      {getIcon(severity)}
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};
