import '@mantine/core/styles.css';

// import './components/DataTable/styles.css';

import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <div dir="rtl" style={{ direction: 'rtl' }}>
        <Router />
      </div>
    </MantineProvider>
  );
}
