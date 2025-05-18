import React from 'react';
import { Container, Paper, Stack, Title } from '@mantine/core';
import { DataTable } from './DataTable';

const TableContainer = () => {
  return (
    <Container size="xl" py="xl">
      <Stack spacing="lg">
        <Title order={1}>Advanced Data Table</Title>
        <Paper shadow="xs" p="md" withBorder>
          <DataTable />
        </Paper>
      </Stack>
    </Container>
  );
};

export default TableContainer;
