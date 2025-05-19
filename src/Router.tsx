import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import TableContainer from './components/DataTable/TableContainer';
import { DataTable } from './components/DataTable/types';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TableContainer />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
