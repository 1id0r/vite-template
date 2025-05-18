import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DataTable } from './components/DataTable';
import TableContainer from './components/TableContainer';
import { HomePage } from './pages/Home.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TableContainer />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
