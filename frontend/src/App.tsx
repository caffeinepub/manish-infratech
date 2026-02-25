import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import AddBillPage from './pages/AddBillPage';
import SearchBillsPage from './pages/SearchBillsPage';
import SummaryPage from './pages/SummaryPage';
import InvoicePrintPage from './pages/InvoicePrintPage';

const rootRoute = createRootRoute({
  component: () => (
    <AuthGuard>
      <Layout>
        <Outlet />
      </Layout>
    </AuthGuard>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AddBillPage,
});

const addBillRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-bill',
  component: AddBillPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchBillsPage,
});

const summaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/summary',
  component: SummaryPage,
});

const invoicePrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoice/$invoiceNumber/print',
  component: InvoicePrintPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  addBillRoute,
  searchRoute,
  summaryRoute,
  invoicePrintRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
