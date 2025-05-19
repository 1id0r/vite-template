// types.ts - Data types and interfaces

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
        backgroundColor: '#ffebee', // Light red for critical severity
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      };
    } else if (severity === 'major') {
      return {
        backgroundColor: '#fffde7', // Light yellow for major severity
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      };
    } else if (severity === 'warning') {
      return {
        backgroundColor: '#e3f2fd', // Light blue for warning severity
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      };
    } else {
      return {
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      };
    }
  };