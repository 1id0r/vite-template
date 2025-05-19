import React from 'react';
import { Box, Container } from '@mantine/core';
import { DataTable } from './DataTable';

const TableContainer = () => {
  return (
    <Container fluid p={0} style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Box py="xl" px="xl">
        <DataTable />
      </Box>
    </Container>
  );
};

export default TableContainer;
