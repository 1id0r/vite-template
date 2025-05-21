import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import TableContainer from './components/DataTable/TableContainer';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TableContainer />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
