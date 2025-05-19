import React from 'react';
import { Box, Container } from '@mantine/core';
import { DataTable } from './DataTable';

const TableContainer = () => {
  return (
    // <div dir="rtl">
    <Container fluid p={0} style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Box py="xl" px="xl">
        <DataTable />
      </Box>
    </Container>
    // </div>
  );
};

export default TableContainer;
