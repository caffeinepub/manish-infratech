import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import SummaryPage from './pages/SummaryPage';
import AddBillPage from './pages/AddBillPage';
import SearchBillsPage from './pages/SearchBillsPage';
import PartySummaryPage from './pages/PartySummaryPage';
import CompanyReportPage from './pages/CompanyReportPage';
import CompanySettingsPage from './pages/CompanySettingsPage';
import InvoicePrintPage from './pages/InvoicePrintPage';

// Root route with AuthGuard
const rootRoute = createRootRoute({
  component: () => (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  ),
});

// Layout route
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/summary' });
  },
  component: () => null,
});

const summaryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/summary',
  component: SummaryPage,
});

const addBillRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/add-bill',
  component: AddBillPage,
});

const searchRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/search',
  component: SearchBillsPage,
});

const partiesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/parties',
  component: PartySummaryPage,
});

const companyReportRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/company-report',
  component: CompanyReportPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/settings',
  component: CompanySettingsPage,
});

const invoicePrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoice/$invoiceNumber',
  component: InvoicePrintPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    summaryRoute,
    addBillRoute,
    searchRoute,
    partiesRoute,
    companyReportRoute,
    settingsRoute,
  ]),
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
