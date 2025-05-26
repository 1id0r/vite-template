// types.ts - Data types and interfaces with folder support

// Define the data type for our table
export type DataItem = {
  id: string;
  objectId: string;
  description: string;
  hierarchy: string;
  lastUpdated: string;
  startTime: string;
  status: 'active' | 'inactive' | 'pending' | 'resolved';
  impact: 'high' | 'medium' | 'low';
  environment: 'production' | 'staging' | 'development';
  origin: string;
  snId: string;
  identities: string[];
  isNew?: boolean;
  severity: 'warning' | 'major' | 'critical';
  isInFolder?: boolean; // Add this property for items inside folders
};

// Folder type
export type FolderItem = {
id: string;
name: string;
type: 'folder';
isExpanded: boolean;
rowIds: string[]; // IDs of rows in this folder
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
      backgroundColor: '#fc9e9d', // Light red for critical severity
      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    };
  } else if (severity === 'major') {
    return {
      backgroundColor: '#fff8b7', // Light yellow for major severity
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    };
  } else if (severity === 'warning') {
    return {
      backgroundColor: '#b5e1ff', // Light blue for warning severity
      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    };
  } else {
    return {
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
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