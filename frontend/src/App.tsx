import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import AddBillPage from './pages/AddBillPage';
import SearchBillsPage from './pages/SearchBillsPage';
import SummaryPage from './pages/SummaryPage';
import PartySummaryPage from './pages/PartySummaryPage';
import CompanyReportPage from './pages/CompanyReportPage';
import InvoicePrintPage from './pages/InvoicePrintPage';

function RootLayout() {
  return (
    <AuthGuard>
      <Layout />
    </AuthGuard>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
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

const partySummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/party-summary',
  component: PartySummaryPage,
});

const companyReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-report',
  component: CompanyReportPage,
});

const invoicePrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoice/$id/print',
  component: InvoicePrintPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  summaryRoute,
  partySummaryRoute,
  companyReportRoute,
  invoicePrintRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
