// types.ts - Data types and interfaces with folder support

// Define the data type for our table
export type DataItem = {
  id: string;
  objectId: string;
  description: string;
  hierarchy: string;
  lastUpdated: string;
  startTime: string;
  status: 'active' | 'inactive' | 'pending' | 'resolved'; // Re-added status field
  impact: 'high' | 'medium' | 'low';
  environment: 'production' | 'staging' | 'development';
  origin: string;
  snId: string;
  identities: string[];
  severity: 'warning' | 'major' | 'critical';
  isInFolder?: boolean; // Add this property for items inside folders
  folderId?: string;
  isFirstInFolderGroup?: boolean;
  isLastInFolderGroup?: boolean;
};

// Folder type
export type FolderItem = {
  id: string;
  name: string;
  type: 'folder';
  isExpanded: boolean;
  rowIds: string[]; // IDs of rows in this folder
  criticalCount: number;
  majorCount: number;
  warningCount: number;
};

// Combined type for table display
export type TableRow = DataItem | FolderItem;

// Folder state management
export type FolderState = {
folders: FolderItem[];
unassignedRows: DataItem[];
expandedFolders: Set<string>;
};

// Helper to check if row is folder
export const isFolder = (row: TableRow): row is FolderItem => {
return 'type' in row && row.type === 'folder';
};

// Helper to check if row is data item
export const isDataItem = (row: TableRow): row is DataItem => {
return !('type' in row);
};

// Export status color maps for consistency
export const statusColorMap = {
  active: 'green',
  inactive: 'gray',
  pending: 'yellow',
  resolved: 'blue',
};

export const impactColorMap = {
  high: 'red',
  medium: 'orange',
  low: 'blue',
};

export const environmentColorMap = {
  production: 'purple',
  staging: 'cyan',
  development: 'indigo',
};

export const severityColorMap = {
  warning: 'blue',
  major: 'yellow',
  critical: 'red',
};

// Row style based on severity
export const getRowStyleBySeverity = (severity: DataItem['severity']) => {
  if (severity === 'critical') {
    return {
      backgroundColor: '#fcd4d4', // Set background color to #fcd4d4 for critical severity
      border: '1px solid #f0b0b0', // Darker red border
    };
  } else if (severity === 'major') {
    return {
      backgroundColor: '#fffac8', // Light yellow for major severity
      border: '1px solid #e0d5a1', // Darker yellow border
    };
  } else if (severity === 'warning') {
    return {
      backgroundColor: '#f0f9ff', // Light blue for warning severity
      border: '1px solid #a0c3e0', // Darker blue border
    };
  } else {
    return {
      backgroundColor: 'white',
      border: '1px solid #e0e0e0', // Grey border for default
    };
  }
};

// Folder row style
export const getFolderRowStyle = () => {
  return {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };
};