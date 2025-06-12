// SortingUtils.ts - All sorting-related logic

// Helper function to detect if text starts with Hebrew
export const startsWithHebrew = (text: string): boolean => {
    if (!text) return false;
    const firstChar = text.trim().charAt(0);
    // Hebrew Unicode range: \u0590-\u05FF
    return /[\u0590-\u05FF]/.test(firstChar);
  };
  
  // Safe date sorting function with proper type checking
  export const createDateSortFn = () => {
    return (rowA: any, rowB: any, columnId: string) => {
      const aValue = rowA.getValue(columnId);
      const bValue = rowB.getValue(columnId);
  
      // Handle null/undefined/empty values
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
  
      // Convert to string and validate
      const aString = String(aValue).trim();
      const bString = String(bValue).trim();
  
      // Check if strings are empty
      if (!aString && !bString) return 0;
      if (!aString) return 1;
      if (!bString) return -1;
  
      // Try to parse as dates
      const aDate = new Date(aString);
      const bDate = new Date(bString);
  
      // Check if dates are valid
      const aIsValidDate = !isNaN(aDate.getTime());
      const bIsValidDate = !isNaN(bDate.getTime());
  
      // If both are invalid dates, fall back to string comparison
      if (!aIsValidDate && !bIsValidDate) {
        return aString.localeCompare(bString);
      }
  
      // If only one is invalid, put invalid dates last
      if (!aIsValidDate) return 1;
      if (!bIsValidDate) return -1;
  
      // Both are valid dates, compare chronologically
      return aDate.getTime() - bDate.getTime();
    };
  };
  
  // Custom sort function for Hebrew-first, then English
  export const createHebrewFirstSortFn = () => {
    return (rowA: any, rowB: any, columnId: string) => {
      const aValue = rowA.getValue(columnId);
      const bValue = rowB.getValue(columnId);
  
      // Handle null/undefined values
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
  
      const aString = String(aValue).trim();
      const bString = String(bValue).trim();
  
      const aIsHebrew = startsWithHebrew(aString);
      const bIsHebrew = startsWithHebrew(bString);
  
      // If both are Hebrew or both are not Hebrew, sort normally with locale
      if (aIsHebrew === bIsHebrew) {
        if (aIsHebrew) {
          // Both Hebrew - use Hebrew locale sorting
          return aString.localeCompare(bString, 'he-IL', {
            sensitivity: 'base',
            ignorePunctuation: true,
          });
        } else {
          // Both English/Latin - use English locale sorting
          return aString.localeCompare(bString, 'en-US', {
            sensitivity: 'base',
            ignorePunctuation: true,
          });
        }
      }
  
      // Hebrew comes first, English comes second
      return aIsHebrew ? -1 : 1;
    };
  };
  
  // Severity sorting function
  export const createSeveritySortFn = () => {
    return (rowA: any, rowB: any, columnId: string) => {
      const aValue = rowA.getValue(columnId);
      const bValue = rowB.getValue(columnId);
  
      const severityOrder = { critical: 4, major: 3, warning: 2, disabled: 1 };
      const aRank = severityOrder[aValue as keyof typeof severityOrder] || 0;
      const bRank = severityOrder[bValue as keyof typeof severityOrder] || 0;
  
      return bRank - aRank;
    };
  };
  
  // Impact sorting function
  export const createImpactSortFn = () => {
    return (rowA: any, rowB: any, columnId: string) => {
      const aValue = rowA.getValue(columnId);
      const bValue = rowB.getValue(columnId);
  
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const aRank = impactOrder[aValue as keyof typeof impactOrder] || 0;
      const bRank = impactOrder[bValue as keyof typeof impactOrder] || 0;
  
      return bRank - aRank;
    };
  };